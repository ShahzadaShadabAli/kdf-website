import { z } from "zod";

export const CRAFTS = ["Weaving", "Woodwork", "Embroidery", "Other"];
export const PRODUCT_STATUSES = ["draft", "published", "archived"];

export const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  isPrimary: z.boolean().optional().default(false),
});

export const productSchema = z.object({
  name: z.string().trim().min(1).max(140),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  craft: z.enum(CRAFTS),
  makerName: z.string().trim().min(1).max(120),
  makerRole: z.string().trim().max(120).optional().default(""),
  priceMinor: z.number().int().nonnegative(),
  currency: z.string().trim().length(3).default("PKR"),
  images: z.array(imageSchema).max(10).default([]),
  description: z.string().trim().max(4000).default(""),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
  sortOrder: z.number().int().default(0),
});

export const productUpdateSchema = productSchema.partial();
