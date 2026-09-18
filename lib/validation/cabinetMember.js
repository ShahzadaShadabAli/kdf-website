import { z } from "zod";

export const CABINET_STATUSES = ["draft", "published", "archived"];

export const cabinetPhotoSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
});

export const cabinetMemberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(160),
  photo: cabinetPhotoSchema.nullable().default(null),
  parentId: z.string().nullable().default(null), // parent's Firestore document id, or null for root
  order: z.number().int().default(0),
  status: z.enum(CABINET_STATUSES).default("draft"),
});

export const cabinetMemberUpdateSchema = cabinetMemberSchema.partial();
