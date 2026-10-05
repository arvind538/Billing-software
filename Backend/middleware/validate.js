import { z } from "zod";

/* ============================================================
   1. AUTH SCHEMAS — Register & Login
   ============================================================ */

export const registerSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be less than 50 characters"),

    email: z
        .string({ error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z
        .string({ error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(64, "Password too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),

    role: z
        .enum(["admin", "cashier"], {
            error: "Role must be admin or cashier",
        })
        .optional()
        .default("cashier"),
});

export const loginSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z
        .string({ error: "Password is required" })
        .min(1, "Password is required"),
});


export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    req.body = result.data; // cleaned + defaults applied
    next();
};