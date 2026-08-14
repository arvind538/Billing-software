import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

// Generate next unique invoice number
const generateInvoiceNumber = async (session) => {
  const lastInvoice = await Invoice.findOne()
    .sort({ createdAt: -1 })
    .select("invoiceNumber")
    .session(session);

  let nextNumber = 1;

  if (lastInvoice?.invoiceNumber) {
    const lastNumber = parseInt(
      lastInvoice.invoiceNumber.replace("INV-", ""),
      10
    );

    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `INV-${String(nextNumber).padStart(4, "0")}`;
};

export const createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items,
      customerId,
      discount = 0,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      throw new Error("Cart empty, one items selected");
    }

    let subtotal = 0;
    let taxTotal = 0;

    const invoiceItems = [];

    // Process products
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.qty) {
        throw new Error(
          `${product.name} ka stock sirf ${product.stock} bacha hai`
        );
      }

      const itemSubtotal = product.price * item.qty;

      const itemTax =
        (itemSubtotal * product.taxRate) / 100;

      const itemTotal = itemSubtotal + itemTax;

      subtotal += itemSubtotal;
      taxTotal += itemTax;

      invoiceItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        taxRate: product.taxRate,
        total: itemTotal,
      });

      // Reduce stock
      product.stock -= item.qty;

      await product.save({ session });
    }

    // Calculate total
    const grandTotal =
      subtotal + taxTotal - Number(discount || 0);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(session);

    // Create invoice
    const invoice = await Invoice.create(
      [
        {
          invoiceNumber,
          customer: customerId || null,
          items: invoiceItems,
          subtotal,
          taxTotal,
          discount: Number(discount || 0),
          grandTotal,
          paymentMethod,
        },
      ],
      { session }
    );

    // Update customer purchase total
    if (customerId) {
      await Customer.findByIdAndUpdate(
        customerId,
        {
          $inc: {
            totalPurchases: grandTotal,
          },
        },
        {
          session,
        }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(invoice[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Create Invoice Error:", err);

    res.status(400).json({
      message: err.message,
    });
  }
};

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customer")
      .populate("items.product");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};