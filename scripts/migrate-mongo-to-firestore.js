// One-off migration: copies every document from the existing MongoDB Atlas
// database into Firestore, preserving each document's original Mongo _id
// string as the new Firestore document ID (critical for cabinetMembers'
// parentId string references and siteSettings' fixed "singleton" id — both
// keep working with zero remapping).
//
// Run once manually: node scripts/migrate-mongo-to-firestore.js
// Never part of build/start — this is not automatic seeding.
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const COLLECTIONS = [
  "siteSettings",
  "adminUsers",
  "products",
  "galleryItems",
  "leaders",
  "voices",
  "cabinetMembers",
  "partners",
  "membershipRequests",
  "contactMessages",
  "auditLog",
];

const BATCH_SIZE = 500;

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!mongoUri) throw new Error("Set MONGODB_URI in .env.local to read the source data");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local");
  }

  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const mongoDb = mongoClient.db("kdf");

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
  const firestore = getFirestore();

  const summary = {};

  for (const name of COLLECTIONS) {
    const docs = await mongoDb.collection(name).find({}).toArray();
    let written = 0;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const chunk = docs.slice(i, i + BATCH_SIZE);
      const batch = firestore.batch();
      for (const doc of chunk) {
        const { _id, ...data } = doc;
        const ref = firestore.collection(name).doc(_id.toString());
        batch.set(ref, data);
      }
      await batch.commit();
      written += chunk.length;
    }

    summary[name] = written;
    console.log(`${name}: migrated ${written} document(s).`);
  }

  await mongoClient.close();

  console.log("\nMigration complete:");
  console.table(summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
