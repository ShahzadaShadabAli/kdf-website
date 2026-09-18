export const MembershipRequestShape = {
  _id: "string (Firestore document id)",
  fullName: "string",
  guardianRelation: "S/O | D/O",
  guardianName: "string", // father's name
  gender: "Male | Female | Other",
  email: "string",
  phone: "string",
  cnic: "string", // 13-digit Pakistani CNIC
  profession: "string",
  homeAddress: "string",
  province: "string",
  district: "string",
  city: "string",
  membershipType: "honorary | permanent",
  disability: "string", // required when membershipType is 'permanent'
  message: "string",
  status: "new | contacted | closed",
  ipHash: "string", // hashed, not raw IP
  createdAt: "Date",
};

export const membershipRequestIndexes = [{ key: { status: 1, createdAt: -1 } }];
