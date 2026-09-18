import { z } from "zod";

export const GALLERY_CATEGORIES = ["Weaving", "Woodwork", "Embroidery", "Community"];
export const GALLERY_STATUSES = ["draft", "published", "archived"];

export const galleryImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const galleryItemSchema = z.object({
  title: z.string().trim().min(1).max(140),
  caption: z.string().trim().max(300).default(""),
  // Nullable — falls back to illustrated placeholder art on the public site
  // until a real photo is uploaded (see components/shared/PlaceholderArt.js).
  image: galleryImageSchema.nullable().default(null),
  category: z.enum(GALLERY_CATEGORIES),
  status: z.enum(GALLERY_STATUSES).default("draft"),
  sortOrder: z.number().int().default(0),
});

export const galleryItemUpdateSchema = galleryItemSchema.partial();
