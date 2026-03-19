// src/lib/validations.ts
import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  telegram: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{5,32}$/, "Invalid Telegram username")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

// ─── Profile ───────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  telegram: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{5,32}$/, "Invalid Telegram username")
    .optional()
    .or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
});

// ─── Product ───────────────────────────────────────────────

export const createProductSchema = z.object({
  title: z.string().min(5, "Title too short").max(150, "Title too long").trim(),
  description: z.string().min(20, "Description too short").max(5000).trim(),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be positive")
    .max(999_999_999, "Price too large"),
  currency: z.enum(["USD", "UZS", "RUB"]).default("USD"),
  categoryId: z.string().cuid("Invalid category"),
  location: z.string().min(2, "Location required").max(100).trim(),
  images: z
    .array(z.string().url())
    .min(1, "At least one image required")
    .max(8, "Maximum 8 images"),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(["ACTIVE", "INACTIVE", "SOLD"]).optional(),
});

// ─── Report ────────────────────────────────────────────────

export const createReportSchema = z.object({
  productId: z.string().cuid(),
  reason: z.enum([
    "SPAM",
    "FRAUD",
    "INAPPROPRIATE",
    "WRONG_CATEGORY",
    "DUPLICATE",
    "OTHER",
  ]),
  description: z.string().max(500).optional(),
});

// ─── Types ─────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
