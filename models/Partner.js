export const PartnerShape = {
  _id: "string (Firestore document id)",
  name: "string", // e.g. "AKRSP", "SCOM"
  logo: "{ url, alt } | null", // falls back to a text badge until uploaded
  websiteUrl: "string", // optional, "" if none
  status: "draft | published | archived",
  sortOrder: "number",
  createdAt: "Date",
  updatedAt: "Date",
};

export const partnerIndexes = [{ key: { status: 1, sortOrder: 1 } }];
