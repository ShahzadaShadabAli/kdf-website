import { extractYouTubeId } from "@/lib/youtube";

// A gallery entry is an album (one event) holding photos and YouTube videos.
// Entries created before albums existed only carry a single `image`, so every
// read goes through these helpers and treats such an entry as a one-photo
// album — no data migration needed.

export function albumPhotos(item) {
  if (item?.photos?.length) return item.photos;
  return item?.image ? [item.image] : [];
}

// Only videos with a readable YouTube id are shown, so a mistyped link can
// never break the album viewer.
export function albumVideos(item) {
  return (item?.videos || [])
    .map((video) => ({ ...video, youtubeId: extractYouTubeId(video.youtubeUrl) }))
    .filter((video) => video.youtubeId);
}

export function albumCoverPhoto(item) {
  const photos = albumPhotos(item);
  return photos.find((photo) => photo.isPrimary) || photos[0] || null;
}

// What the album viewer steps through: photos in their saved order, then the
// videos.
export function albumMedia(item) {
  return [
    ...albumPhotos(item).map((image) => ({ type: "image", image })),
    ...albumVideos(item).map((video) => ({
      type: "video",
      youtubeId: video.youtubeId,
      title: video.title || "",
    })),
  ];
}

export function albumCounts(item) {
  return { photos: albumPhotos(item).length, videos: albumVideos(item).length };
}

// "12 photos · 2 videos" — the chip under an album's title.
export function albumSummary(item) {
  const { photos, videos } = albumCounts(item);
  const parts = [];
  if (photos) parts.push(`${photos} photo${photos === 1 ? "" : "s"}`);
  if (videos) parts.push(`${videos} video${videos === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Formatted by hand rather than with toLocaleDateString so the server and the
// browser always render the same string (no hydration mismatch).
export function albumDateLabel(item) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(item?.eventDate || "");
  if (!match) return "";
  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  if (!name) return "";
  return `${Number(day)} ${name} ${year}`;
}
