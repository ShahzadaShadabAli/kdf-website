import { albumCoverPhoto } from "@/lib/gallery";

// The album's `image` field is always derived from its photos, so the public
// grid has one field to read for the cover. Partial updates that don't touch
// the photos leave the existing cover alone.
export function withAlbumCover(data) {
  if (!data.photos) return data;
  const cover = albumCoverPhoto({ photos: data.photos });
  if (!cover) return { ...data, image: null };
  const { url, alt, width, height } = cover;
  return { ...data, image: { url, alt, width, height } };
}
