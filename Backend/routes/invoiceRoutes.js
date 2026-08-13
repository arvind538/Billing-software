import express from "express";
const router = express.Router();
import { createInvoice, getInvoices, getInvoiceById } from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";


router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);
router.get("/:id", protect, getInvoiceById);

export default router;