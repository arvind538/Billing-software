import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  price: Number,
  qty: { type: Number, required: true },
  taxRate: Number,
  total: Number,
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [invoiceItemSchema],
    subtotal: Number,
    taxTotal: Number,
    discount: { type: Number, default: 0 },
    grandTotal: Number,
    paymentMethod: { type: String, enum: ["cash", "card", "upi"], default: "cash" },
    status: { type: String, enum: ["paid", "due"], default: "paid" },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);