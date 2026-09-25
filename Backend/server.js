import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/ProductRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

connectDB();

const app = express();


const allowedOrigins = [
    'http://localhost:3000',
    'https://billing-software-en5c.vercel.app' // Aapka Vercel URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Mobile apps ya curl/postman ke liye (!origin) allow karein
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS'));
        }
    },
    credentials: true, // Cookies aur auth headers bhejne ke liye zaroori hai
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => res.send("Billing API running"));

// Global error handler
app.use((err, req, res, next) => {
    console.error("Backend Error:", err.message);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Hardcoded 5000 mat rakhein, process.env.PORT use karein
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});