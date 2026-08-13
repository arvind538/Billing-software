import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URI,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);

app.get("/", (req, res) => res.send("Billing API running"));

const PORT = process.env.PORT || 5000;

app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on http://10.122.237.144:5000");
});