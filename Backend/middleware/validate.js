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

// /* ============================================================
//    2. CUSTOMER SCHEMAS — Create & Update
//    ============================================================ */

// export const customerSchema = z.object({
//     name: z
//         .string({ error: "Customer name is required" })
//         .trim()
//         .min(3, "Name must be at least 3 characters")
//         .max(100, "Name too long"),

//     phone: z
//         .string({ error: "Phone number is required" })
//         .trim()
//         .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),

//     email: z
//         .string()
//         .trim()
//         .toLowerCase()
//         .email("Invalid email address")
//         .optional()
//         .or(z.literal("")),

//     address: z
//         .string()
//         .trim()
//         .max(250, "Address too long")
//         .optional(),

//     gstNumber: z
//         .string()
//         .trim()
//         .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number")
//         .optional()
//         .or(z.literal("")),
// });

// export const customerUpdateSchema = customerSchema.partial();

/* ============================================================
   3. PRODUCT SCHEMAS — Add & Update
   ============================================================ */

// export const productSchema = z.object({
//     name: z
//         .string({ error: "Product name is required" })
//         .trim()
//         .min(2, "Product name must be at least 2 characters")
//         .max(100, "Product name too long"),

//     sku: z
//         .string({ error: "SKU is required" })
//         .trim()
//         .min(1, "SKU cannot be empty"),

//     category: z
//         .string({ error: "Category is required" })
//         .trim()
//         .min(1, "Category cannot be empty"),

//     price: z
//         .number({ error: "Price is required and must be a number" })
//         .positive("Price must be greater than 0"),

//     costPrice: z
//         .number({ error: "Cost price must be a number" })
//         .nonnegative("Cost price cannot be negative")
//         .optional(),

//     quantity: z
//         .number({ error: "Quantity is required and must be a number" })
//         .int("Quantity must be a whole number")
//         .nonnegative("Quantity cannot be negative"),

//     unit: z.string().trim().optional().default("pcs"),

//     gstPercentage: z
//         .number({ error: "GST must be a number" })
//         .min(0, "GST cannot be negative")
//         .max(100, "GST cannot exceed 100%")
//         .optional()
//         .default(0),

//     description: z.string().trim().max(500, "Description too long").optional(),
// });

// export const productUpdateSchema = productSchema.partial();

/* ============================================================
   4. GENERIC VALIDATE MIDDLEWARE
   Isse hi import karke kisi bhi schema ke saath route pe lagao
   ============================================================ */

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