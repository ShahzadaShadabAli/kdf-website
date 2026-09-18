import { admin } from "@/lib/firebase";

// Firestore Timestamps -> JS Date, so callers that expect Mongo-style Date
// fields (new Date(x.createdAt).toLocaleDateString(), JSON serialization,
// etc.) keep working unchanged.
export function normalizeDates(data) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = value instanceof admin.firestore.Timestamp ? value.toDate() : value;
  }
  return out;
}

// Mirrors the Mongo shape every route/component already expects: `_id` plus
// the rest of the document fields.
export function docToItem(doc) {
  return { _id: doc.id, ...normalizeDates(doc.data()) };
}

export function docsToItems(snapshot) {
  return snapshot.docs.map(docToItem);
}

// Replaces ObjectId.isValid(x) — Firestore document IDs are just non-empty
// strings (max 1500 bytes, no "/").
export function isValidId(id) {
  return typeof id === "string" && id.length > 0 && id.length <= 1500 && !id.includes("/");
}

// Mirrors Mongo's findOne({_id}) — used by every [id]/route.js GET handler.
export async function getById(collectionRef, id) {
  if (!isValidId(id)) return null;
  const doc = await collectionRef.doc(id).get();
  return doc.exists ? docToItem(doc) : null;
}

// Mirrors Mongo's findOneAndUpdate({_id}, {$set: data}, {returnDocument:"after"})
// — used by every [id]/route.js PATCH/DELETE(soft) handler. Returns null if
// the document doesn't exist (same 404 signal the old code relied on).
export async function updateById(collectionRef, id, data) {
  if (!isValidId(id)) return null;
  const ref = collectionRef.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.update(data);
  const updated = await ref.get();
  return docToItem(updated);
}

// Shared "list, optionally admin-unfiltered, sorted by a single field" query
// used by leaders/partners/voices/cabinetMembers — the only difference
// between them is the collection name and sort field.
export async function listByStatus(collectionRef, { isAdmin, orderByField }) {
  let ref = collectionRef;
  if (!isAdmin) ref = ref.where("status", "==", "published");
  const snapshot = await ref.orderBy(orderByField).get();
  return docsToItems(snapshot);
}

// Shared cursor pagination for products/galleryItems: sort by createdAt with
// the document id as a tiebreaker (Firestore's own auto-IDs aren't
// time-ordered the way Mongo ObjectIds were, so createdAt is the stable key).
export async function paginateByCreatedAt(collectionRef, { limit, cursorId }) {
  let query = collectionRef.orderBy("createdAt", "asc").orderBy(admin.firestore.FieldPath.documentId());

  if (cursorId) {
    const cursorSnap = await collectionRef.doc(cursorId).get();
    if (cursorSnap.exists) {
      query = query.startAfter(cursorSnap);
    }
  }

  const snapshot = await query.limit(limit + 1).get();
  return snapshot.docs;
}
