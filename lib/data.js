import { getDb } from "@/lib/firebase";
import { docToItem, docsToItems, paginateByCreatedAt } from "@/lib/firestoreHelpers";
import { SITE_SETTINGS_ID } from "@/models/SiteSettings";

// Server-side data access for the public pages — used directly inside
// Server Components so the first page of each collection renders as part
// of the initial HTML (see build spec §6.1) rather than a client fetch.

export async function getSettings() {
  const db = await getDb();
  const doc = await db.collection("siteSettings").doc(SITE_SETTINGS_ID).get();
  return doc.exists ? JSON.parse(JSON.stringify(docToItem(doc))) : null;
}

export async function getFirstProducts(limit = 8) {
  const db = await getDb();
  const docs = await paginateByCreatedAt(db.collection("products").where("status", "==", "published"), {
    limit,
  });
  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const items = page.map(docToItem);
  return {
    items: JSON.parse(JSON.stringify(items)),
    nextCursor: hasMore ? items[items.length - 1]._id : null,
  };
}

export async function getFirstGalleryItems(limit = 6) {
  const db = await getDb();
  const docs = await paginateByCreatedAt(db.collection("galleryItems").where("status", "==", "published"), {
    limit,
  });
  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const items = page.map(docToItem);
  return {
    items: JSON.parse(JSON.stringify(items)),
    nextCursor: hasMore ? items[items.length - 1]._id : null,
  };
}

export async function getLeaders() {
  const db = await getDb();
  const snapshot = await db.collection("leaders").where("status", "==", "published").orderBy("order").get();
  return JSON.parse(JSON.stringify(docsToItems(snapshot)));
}

export async function getPartners() {
  const db = await getDb();
  const snapshot = await db
    .collection("partners")
    .where("status", "==", "published")
    .orderBy("sortOrder")
    .get();
  return JSON.parse(JSON.stringify(docsToItems(snapshot)));
}

export async function getCabinetMembers() {
  const db = await getDb();
  const snapshot = await db
    .collection("cabinetMembers")
    .where("status", "==", "published")
    .orderBy("order")
    .get();
  return JSON.parse(JSON.stringify(docsToItems(snapshot)));
}

export async function getVoices() {
  const db = await getDb();
  const snapshot = await db.collection("voices").where("status", "==", "published").orderBy("order").get();
  return JSON.parse(JSON.stringify(docsToItems(snapshot)));
}

export async function getSuccessStories() {
  const db = await getDb();
  const snapshot = await db
    .collection("successStories")
    .where("status", "==", "published")
    .orderBy("order")
    .get();
  return JSON.parse(JSON.stringify(docsToItems(snapshot)));
}
