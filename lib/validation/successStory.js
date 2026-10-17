import { z } from "zod";
import { extractYouTubeId } from "@/lib/youtube";

export const SUCCESS_STORY_STATUSES = ["draft", "published", "archived"];

// Re-exported so the existing `from "@/lib/validation/successStory"` imports
// keep working now that the helper is shared with gallery albums.
export { extractYouTubeId };

const successStoryBaseSchema = z.object({
  title: z.string().trim().min(1).max(140),
  caption: z.string().trim().max(300).default(""),
  youtubeUrl: z.string().trim().url(),
  order: z.number().int().default(0),
  status: z.enum(SUCCESS_STORY_STATUSES).default("draft"),
});

function checkYoutubeUrl(data, ctx) {
  if (data.youtubeUrl !== undefined && !extractYouTubeId(data.youtubeUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["youtubeUrl"],
      message: "Enter a valid YouTube video link (e.g. youtube.com/watch?v=... or youtu.be/...)",
    });
  }
}

export const successStorySchema = successStoryBaseSchema.superRefine(checkYoutubeUrl);
export const successStoryUpdateSchema = successStoryBaseSchema.partial().superRefine(checkYoutubeUrl);
