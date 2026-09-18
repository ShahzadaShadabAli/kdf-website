export const VoiceShape = {
  _id: "string (Firestore document id)",
  quote: "string",
  personName: "string",
  personRole: "string", // e.g. "Member since 2019"
  vignetteTitle: "string", // e.g. "Loom Corner"
  vignetteCaption: "string", // e.g. "Weaving Programme, Skardu bazaar"
  image: "{ url, alt } | null", // falls back to illustrated placeholder art
  order: "number",
  status: "draft | published | archived",
  createdAt: "Date",
  updatedAt: "Date",
};

export const voiceIndexes = [{ key: { status: 1, order: 1 } }];
