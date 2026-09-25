import mongoose from "mongoose";
import Invoice from "../models/Invoice.js"; // Aapka model file name check karein
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

// @desc    Create new invoice
// @route   POST /api/invoices
export const createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, customerId, discount = 0, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      throw new Error("Cart empty, please select at least one item.");
    }

    let subtotal = 0;
    let taxTotal = 0;
    const invoiceItems = [];

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
      const itemTax = (itemSubtotal * Number(product.taxRate || 0)) / 100;
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

      product.stock -= item.qty;
      await product.save({ session });
    }

    const grandTotal = subtotal + taxTotal - Number(discount || 0);
    const invoiceNumber = await generateInvoiceNumber(session);

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

    if (customerId) {
      await Customer.findByIdAndUpdate(
        customerId,
        {
          $inc: {
            totalPurchases: grandTotal,
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(invoice[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Create Invoice Error:", err);
    return res.status(400).json({
      message: err.message,
    });
  }
};

// @desc    Get all invoices
// @route   GET /api/invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer")
      .sort({ createdAt: -1 });

    return res.status(200).json(invoices);
  } catch (err) {
    console.error("Get Invoices Error:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
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

    return res.status(200).json(invoice);
  } catch (err) {
    console.error("Get Invoice By ID Error:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// @desc    Update Invoice (Payment Mode, Date etc.)
// @route   PUT /api/invoices/:id
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, date } = req.body;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(paymentMethod && { paymentMethod }),
          ...(date && { createdAt: new Date(date), date: new Date(date) }),
        },
      },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice nahi mila database mein.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update invoice",
    });
  }
};

// @desc    Delete Invoice
// @route   DELETE /api/invoices/:id
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInvoice = await Invoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice database mein nahi mila.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete invoice",
    });
  }
};