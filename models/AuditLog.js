export const AuditLogShape = {
  _id: "string (Firestore document id)",
  actorId: "string",
  actorEmail: "string",
  action: "string", // e.g. "product.update"
  targetId: "string | null",
  diff: "object | null",
  createdAt: "Date",
};

export async function writeAuditLog(db, { actorId, actorEmail, action, targetId, diff }) {
  await db.collection("auditLog").add({
    actorId,
    actorEmail,
    action,
    targetId: targetId ?? null,
    diff: diff ?? null,
    createdAt: new Date(),
  });
}
