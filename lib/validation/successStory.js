import { z } from "zod";

export const SUCCESS_STORY_STATUSES = ["draft", "published", "archived"];

// Accepts the common YouTube URL shapes: watch?v=, youtu.be/, embed/, shorts/.
const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export function extractYouTubeId(url) {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
      }
      const embedMatch = parsed.pathname.match(/^\/(embed|shorts)\/([\w-]{11})/);
      if (embedMatch) return embedMatch[2];
    }

    return null;
  } catch {
    return null;
  }
}

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
