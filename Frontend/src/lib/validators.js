import { z } from "zod";

export const registerSchema = z.object({
    name: z.string({ error: "Name is required" }).trim().min(3, "Name must be at least 3 characters").max(50, "Name too long"),
    email: z.string({ error: "Email is required" }).trim().toLowerCase().email("Invalid email address"),
    password: z
        .string({ error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
});

export const loginSchema = z.object({
    email: z.string({ error: "Email is required" }).trim().toLowerCase().email("Invalid email address"),
    password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export const productSchema = z.object({
    name: z.string({ error: "Product name is required" }).trim().min(2, "Too short").max(100, "Too long"),
    sku: z.string({ error: "SKU is required" }).trim().min(1, "SKU cannot be empty"),
    category: z.string({ error: "Category is required" }).trim().min(1, "Category cannot be empty"),
    price: z.coerce.number({ error: "Price must be a number" }).positive("Price must be greater than 0"),
    costPrice: z.coerce.number().nonnegative("Cannot be negative").optional(),
    quantity: z.coerce.number({ error: "Quantity must be a number" }).int("Must be a whole number").nonnegative("Cannot be negative"),
    unit: z.string().trim().optional(),
    gstPercentage: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100%").optional(),
    description: z.string().trim().max(500, "Too long").optional(),
});

export const customerSchema = z.object({
    name: z.string({ error: "Name is required" }).trim().min(2, "Name must be at least 2 characters"),
    phone: z.string({ error: "Phone is required" }).trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
    email: z.string().trim().toLowerCase().email("Invalid email address").optional().or(z.literal("")),
    address: z.string().trim().optional(),
});