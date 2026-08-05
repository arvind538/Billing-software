import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  return `INV-${String(count + 1).padStart(4, "0")}`;
};

export const createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, customerId, discount = 0, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      throw new Error("Cart empty hai, kam se kam 1 item add karo");
    }

    let subtotal = 0;
    let taxTotal = 0;
    const invoiceItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.qty) {
        throw new Error(`${product.name} ka stock sirf ${product.stock} bacha hai`);
      }

      const itemTax = (product.price * item.qty * product.taxRate) / 100;
      const itemTotal = product.price * item.qty + itemTax;

      subtotal += product.price * item.qty;
      taxTotal += itemTax;

      invoiceItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        taxRate: product.taxRate,
        total: itemTotal,
      });

      product.stock -= item.qty;
      await product.save({ session });
    }

    const grandTotal = subtotal + taxTotal - discount;
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create(
      [{ invoiceNumber, customer: customerId || null, items: invoiceItems, subtotal, taxTotal, discount, grandTotal, paymentMethod }],
      { session }
    );

    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, { $inc: { totalPurchases: grandTotal } }, { session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(invoice[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

export const getInvoices = async (req, res) => {
  const invoices = await Invoice.find().populate("customer").sort({ createdAt: -1 });
  res.json(invoices);
};

export const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate("customer items.product");
  if (!invoice) return res.status(404).json({ message: "Invoice nahi mila" });
  res.json(invoice);
};