import { z } from "zod";

export const LEADER_STATUSES = ["draft", "published", "archived"];

export const leaderPhotoSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
});

export const leaderSchema = z.object({
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  photo: leaderPhotoSchema.nullable().default(null),
  quote: z.string().trim().min(1).max(600),
  bio: z.string().trim().max(2000).default(""),
  order: z.number().int().default(0),
  status: z.enum(LEADER_STATUSES).default("draft"),
});

export const leaderUpdateSchema = leaderSchema.partial();
