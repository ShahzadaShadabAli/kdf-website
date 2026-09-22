// Run once against a fresh database: npm run seed
// Creates the first super_admin account and the siteSettings singleton.
// (Composite indexes are managed via firestore.indexes.json, not here —
// Firestore has no createIndex() call from application code.)
require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const bcrypt = require("bcryptjs");

const { SITE_SETTINGS_ID } = require("../models/SiteSettings");

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local before seeding"
    );
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
  const db = getFirestore();

  const email = process.env.SEED_ADMIN_EMAIL || "admin@kdf.org.pk";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const existingSnap = await db.collection("adminUsers").where("email", "==", email).limit(1).get();

  if (existingSnap.empty) {
    const passwordHash = await bcrypt.hash(password, 12);
    await db.collection("adminUsers").add({
      email,
      name: "Super Admin",
      role: "super_admin",
      passwordHash,
      isActive: true,
      lastLoginAt: null,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
    });
    console.log(`Created super_admin ${email} — CHANGE THIS PASSWORD after first login.`);
  } else {
    console.log(`Admin ${email} already exists, skipping.`);
  }

  const settingsRef = db.collection("siteSettings").doc(SITE_SETTINGS_ID);
  const settingsDoc = await settingsRef.get();
  if (!settingsDoc.exists) {
    await settingsRef.set({
      heroHeadline: "Every thread carries a name.",
      heroSubtext:
        "Karakoram Disability Forum is a persons-with-disabilities organisation working across Baltistan on rights, independent living, and economic empowerment.",
      logo: null,
      heroImage: null,
      storyImage: null,
      whatsappNumber: process.env.WHATSAPP_NUMBER || "923469225580",
      contactEmail: "kdf_dpo.skardu@hotmail.com",
      address: "Skardu Independent Living Centre (ILC), Near SCO Mess, RHQ Hospital, Opp. Boys High School No.1, Skardu, GB",
      mapLat: null,
      mapLng: null,
      bankAccounts: [],
      bankName: "",
      accountTitle: "",
      accountNumber: "",
      iban: "",
      branchName: "",
      facebookUrl: "",
      instagramUrl: "",
      whatsappUrl: "",
      linkedinUrl: "",
      tiktokUrl: "",
      updatedAt: new Date(),
      updatedBy: "seed",
    });
    console.log("Created siteSettings singleton.");
  } else {
    console.log("siteSettings already exists, skipping.");
  }

  const voiceCountSnap = await db.collection("voices").count().get();
  if (voiceCountSnap.data().count === 0) {
    const now = new Date();
    const batch = db.batch();
    [
      {
        quote:
          "KDF helped me get an assistive device I'd been asking about for years, and put me in touch with others who understood.",
        personName: "Fatima",
        personRole: "Member since 2019",
        vignetteTitle: "Loom Corner",
        vignetteCaption: "Weaving Programme, Skardu bazaar",
        image: null,
        order: 1,
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        quote:
          "Speaking at a union council meeting felt impossible before. The forum trained me and stood behind me.",
        personName: "Ali",
        personRole: "Advocacy Volunteer",
        vignetteTitle: "Advocacy Training",
        vignetteCaption: "Skill-building for union-council speakers",
        image: null,
        order: 2,
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        quote:
          "I sold my first shawl through the shop. My neighbours didn't know I could weave until then.",
        personName: "Zainab",
        personRole: "Weaver",
        vignetteTitle: "Finished Shawls",
        vignetteCaption: "Ready for the shop shelf",
        image: null,
        order: 3,
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
    ].forEach((doc) => batch.set(db.collection("voices").doc(), doc));
    await batch.commit();
    console.log("Seeded 3 default voices.");
  } else {
    console.log("voices already has content, skipping.");
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
