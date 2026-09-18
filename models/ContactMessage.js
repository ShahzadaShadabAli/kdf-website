export const ContactMessageShape = {
  _id: "string (Firestore document id)",
  fullName: "string",
  email: "string",
  message: "string",
  status: "new | contacted | closed",
  ipHash: "string", // hashed, not raw IP
  createdAt: "Date",
};

export const contactMessageIndexes = [{ key: { status: 1, createdAt: -1 } }];
