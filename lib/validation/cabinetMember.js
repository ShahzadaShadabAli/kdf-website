import { z } from "zod";

export const CABINET_STATUSES = ["draft", "published", "archived"];

// Each member belongs to one chart: the two cabinet wings, or the governing body.
// Older records saved before the split have no group and are treated as male.
export const CABINET_GROUPS = ["male", "female", "governing"];
export const CABINET_GROUP_LABELS = {
  male: "Male Cabinet",
  female: "Female Cabinet",
  governing: "Governing Body",
};
export const groupOf = (member) =>
  CABINET_GROUPS.includes(member?.group) ? member.group : "male";

export const cabinetPhotoSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
});

export const cabinetMemberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(160),
  photo: cabinetPhotoSchema.nullable().default(null),
  parentId: z.string().nullable().default(null), // parent's Firestore document id, or null for root
  group: z.enum(CABINET_GROUPS).default("male"),
  order: z.number().int().default(0),
  status: z.enum(CABINET_STATUSES).default("draft"),
});

export const cabinetMemberUpdateSchema = cabinetMemberSchema.partial();
