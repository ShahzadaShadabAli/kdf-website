import { z } from "zod";
import { extractYouTubeId } from "@/lib/youtube";

export const GALLERY_CATEGORIES = ["Weaving", "Woodwork", "Embroidery", "Community"];
export const GALLERY_STATUSES = ["draft", "published", "archived"];

export const GALLERY_MAX_PHOTOS = 60;
export const GALLERY_MAX_VIDEOS = 20;

export const galleryImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

// One photo inside an album. The photo flagged isPrimary is the album cover
// shown on the gallery grid; without a flag the first photo is used.
export const galleryPhotoSchema = galleryImageSchema.extend({
  isPrimary: z.boolean().default(false),
});

// Albums can also hold YouTube videos — nothing is uploaded for these, the
// video stays on YouTube and plays in the album viewer.
export const galleryVideoSchema = z
  .object({
    youtubeUrl: z.string().trim().url(),
    title: z.string().trim().max(140).default(""),
  })
  .superRefine((data, ctx) => {
    if (!extractYouTubeId(data.youtubeUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["youtubeUrl"],
        message: "Enter a valid YouTube video link (e.g. youtube.com/watch?v=... or youtu.be/...)",
      });
    }
  });

// A gallery entry is an album: one event, with all of its photos and videos
// grouped under a single title instead of one entry per photo.
export const galleryItemSchema = z.object({
  title: z.string().trim().min(1).max(140),
  caption: z.string().trim().max(300).default(""),
  // "YYYY-MM-DD" from the admin's date field, or "" when left blank.
  eventDate: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Pick a date from the calendar")
    .default(""),
  // The album cover, derived from `photos` when the album is saved. Older
  // single-photo entries only have this field, and still render fine.
  image: galleryImageSchema.nullable().default(null),
  photos: z.array(galleryPhotoSchema).max(GALLERY_MAX_PHOTOS).default([]),
  videos: z.array(galleryVideoSchema).max(GALLERY_MAX_VIDEOS).default([]),
  category: z.enum(GALLERY_CATEGORIES),
  status: z.enum(GALLERY_STATUSES).default("draft"),
  sortOrder: z.number().int().default(0),
});

export const galleryItemUpdateSchema = galleryItemSchema.partial();
