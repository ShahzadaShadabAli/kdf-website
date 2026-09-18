// Plain JS "schema shape" reference for the `products` collection.
// Not an ORM model — the native MongoDB driver is used directly;
// this documents the document shape and required indexes.

export const ProductShape = {
  _id: "string (Firestore document id)",
  name: "string",
  slug: "string", // unique
  craft: "Weaving | Woodwork | Embroidery | Other",
  makerName: "string",
  makerRole: "string",
  priceMinor: "number", // integer minor units, never floats
  currency: "string", // e.g. PKR
  images: "[{ url, alt, width, height, isPrimary }]",
  description: "string",
  status: "draft | published | archived",
  sortOrder: "number",
  createdAt: "Date",
  updatedAt: "Date",
};

export const productIndexes = [
  { key: { status: 1, sortOrder: 1 } },
  { key: { craft: 1, status: 1 } },
  { key: { slug: 1 }, options: { unique: true } },
];
