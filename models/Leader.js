export const LeaderShape = {
  _id: "string (Firestore document id)",
  name: "string",
  title: "string",
  photo: "{ url, alt } | null",
  quote: "string",
  bio: "string",
  order: "number",
  status: "draft | published | archived",
  createdAt: "Date",
  updatedAt: "Date",
};

export const leaderIndexes = [{ key: { status: 1, order: 1 } }];
