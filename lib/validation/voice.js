import { z } from "zod";

export const VOICE_STATUSES = ["draft", "published", "archived"];

// The illustrated "vignette" image is optional — if left blank, the public
// site falls back to the same illustrated placeholder art used elsewhere
// (see components/shared/PlaceholderArt.js), keyed off the document id.
export const voiceImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
});

export const voiceSchema = z.object({
  quote: z.string().trim().min(1).max(600),
  personName: z.string().trim().min(1).max(120),
  personRole: z.string().trim().min(1).max(160),
  vignetteTitle: z.string().trim().min(1).max(120),
  vignetteCaption: z.string().trim().min(1).max(200),
  image: voiceImageSchema.nullable().default(null),
  order: z.number().int().default(0),
  status: z.enum(VOICE_STATUSES).default("draft"),
});

export const voiceUpdateSchema = voiceSchema.partial();
