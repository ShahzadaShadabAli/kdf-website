export const GalleryItemShape = {
  _id: "string (Firestore document id)",
  title: "string",
  caption: "string",
  image: "{ url, alt, width, height } | null", // falls back to placeholder art
  category: "Weaving | Woodwork | Embroidery | Community",
  status: "draft | published | archived",
  sortOrder: "number",
  createdAt: "Date",
  updatedAt: "Date",
};

export const galleryItemIndexes = [{ key: { status: 1, sortOrder: 1 } }];
