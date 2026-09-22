import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const bankAccountSchema = z.object({
  bankName: z.string().trim().max(200).default(""),
  accountTitle: z.string().trim().max(200).default(""),
  accountNumber: z.string().trim().max(60).default(""),
  iban: z.string().trim().max(60).default(""),
  branchName: z.string().trim().max(200).default(""),
});

// Empty string hides the social icon; anything else must be a real URL.
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || z.string().url().safeParse(v).success, "Must be a valid URL")
  .default("");

export const settingsSchema = z.object({
  heroHeadline: z.string().trim().min(1).max(200),
  heroSubtext: z.string().trim().min(1).max(600),
  // One upload serves as both the header logo and the browser-tab favicon.
  logo: imageSchema.nullable().default(null),
  // Optional — falls back to the illustrated SVG graphics until a real
  // photo is uploaded (see components/site/Hero.js and Story.js).
  heroImage: imageSchema.nullable().default(null),
  storyImage: imageSchema.nullable().default(null),
  whatsappNumber: z.string().trim().min(6).max(20),
  contactEmail: z.string().trim().email().max(200),
  address: z.string().trim().min(1).max(300),

  // Optional exact coordinates for the homepage map embed — when set, these
  // take priority over an address-text search (more precise pin placement).
  mapLat: z.number().min(-90).max(90).nullable().default(null),
  mapLng: z.number().min(-180).max(180).nullable().default(null),

  // Donate section — display-only bank details, no payment processing on the site.
  // Visitors pick between the accounts; the single-account fields below are the
  // older format, read only as a fallback (see lib/bankAccounts.js).
  bankAccounts: z.array(bankAccountSchema).max(10).default([]),
  bankName: z.string().trim().max(200).default(""),
  accountTitle: z.string().trim().max(200).default(""),
  accountNumber: z.string().trim().max(60).default(""),
  iban: z.string().trim().max(60).default(""),
  branchName: z.string().trim().max(200).default(""),

  // Social links — footer icons. Empty string hides the icon.
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  tiktokUrl: optionalUrl,
});

export const settingsUpdateSchema = settingsSchema.partial();
