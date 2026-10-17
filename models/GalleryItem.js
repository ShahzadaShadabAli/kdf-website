// One document = one album (an event), holding every photo and video from it.
export const GalleryItemShape = {
  _id: "string (Firestore document id)",
  title: "string (album / event name)",
  caption: "string",
  eventDate: "string (YYYY-MM-DD) | ''",
  // Album cover, derived from `photos` on save. Entries created before albums
  // existed carry only this field and read back as a one-photo album
  // (see lib/gallery.js).
  image: "{ url, alt, width, height } | null",
  photos: "[{ url, alt, width, height, isPrimary }]",
  videos: "[{ youtubeUrl, title }]", // played from YouTube, never uploaded
  category: "Weaving | Woodwork | Embroidery | Community",
  status: "draft | published | archived",
  sortOrder: "number",
  createdAt: "Date",
  updatedAt: "Date",
};

export const galleryItemIndexes = [{ key: { status: 1, sortOrder: 1 } }];
