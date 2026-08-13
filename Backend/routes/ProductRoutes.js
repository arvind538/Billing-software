import express from "express";
const router = express.Router();
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";


router.get("/", protect, getProducts);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;