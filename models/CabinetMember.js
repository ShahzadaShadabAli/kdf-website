// Flexible-depth org chart: each member optionally points at a parent by id,
// so the cabinet can be reshaped (add a level, move someone) without a schema
// change. Root members have parentId: null.

export const CabinetMemberShape = {
  _id: "string (Firestore document id)",
  name: "string",
  role: "string", // e.g. "Chairperson", "Regional Coordinator"
  photo: "{ url, alt } | null",
  parentId: "string (Firestore document id) | null",
  order: "number", // sibling order under the same parent
  status: "draft | published | archived",
  createdAt: "Date",
  updatedAt: "Date",
};

export const cabinetMemberIndexes = [{ key: { status: 1, parentId: 1, order: 1 } }];
