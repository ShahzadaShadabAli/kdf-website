// Shared YouTube link handling — used by Success Stories and by gallery
// albums, which can hold videos alongside their photos.

// Accepts the common YouTube URL shapes: watch?v=, youtu.be/, embed/, shorts/.
const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export function extractYouTubeId(url) {
  try {
    const parsed = new URL(String(url).trim());
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

// Thumbnails come straight from YouTube (allowed in the img-src CSP in
// next.config.js); the player is the no-cookie embed host.
export function youtubeThumb(id, size = "hqdefault") {
  return `https://i.ytimg.com/vi/${id}/${size}.jpg`;
}

export function youtubeEmbed(id, { autoplay = false } = {}) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? "&autoplay=1" : ""}`;
}
