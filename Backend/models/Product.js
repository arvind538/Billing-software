import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, default: "General" },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "pcs" },
    lowStockAlert: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);