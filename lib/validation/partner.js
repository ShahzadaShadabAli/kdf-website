import { z } from "zod";

export const PARTNER_STATUSES = ["draft", "published", "archived"];

export const partnerLogoSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
});

export const partnerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  // Nullable — a partner can be listed by name only until a real logo is
  // uploaded; the public site falls back to a text badge (see PartnersSection).
  logo: partnerLogoSchema.nullable().default(null),
  websiteUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || z.string().url().safeParse(v).success, "Must be a valid URL")
    .default(""),
  status: z.enum(PARTNER_STATUSES).default("draft"),
  sortOrder: z.number().int().default(0),
});

export const partnerUpdateSchema = partnerSchema.partial();
