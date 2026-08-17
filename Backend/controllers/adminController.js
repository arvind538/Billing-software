import User from "../models/User.js";
import Product from "../models/Product.js";
import Invoice from "../models/Invoice.js";

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Users fetch failed", error: err.message });
    }
};

// GET /api/admin/products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Products fetch failed", error: err.message });
    }
};

// GET /api/admin/invoices  (recent invoices, customer populated)
export const getRecentInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate("customer", "name phone email")
            .sort({ createdAt: -1 })
            .limit(30);
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: "Invoices fetch failed", error: err.message });
    }
};

// GET /api/admin/stats  (dashboard summary numbers)
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalInvoices = await Invoice.countDocuments();

        const lowStockProducts = await Product.countDocuments({
            $expr: { $lte: ["$stock", "$lowStockAlert"] },
        });

        const revenueAgg = await Invoice.aggregate([
            { $match: { status: "paid" } },
            { $group: { _id: null, total: { $sum: "$grandTotal" } } },
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        const dueAgg = await Invoice.aggregate([
            { $match: { status: "due" } },
            { $group: { _id: null, total: { $sum: "$grandTotal" } } },
        ]);
        const totalDue = dueAgg[0]?.total || 0;

        res.json({
            totalUsers,
            totalProducts,
            totalInvoices,
            lowStockProducts,
            totalRevenue,
            totalDue,
        });
    } catch (err) {
        res.status(500).json({ message: "Stats fetch failed", error: err.message });
    }
};