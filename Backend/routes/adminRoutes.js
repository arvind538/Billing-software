import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
    getAllUsers,
    getAllProducts,
    getRecentInvoices,
    getDashboardStats,
} from "../controllers/adminController.js";

const router = express.Router();

// Sab routes protected + admin-only hain
router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/products", protect, adminOnly, getAllProducts);
router.get("/invoices", protect, adminOnly, getRecentInvoices);

export default router;