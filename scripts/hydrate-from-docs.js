// One-off hydration script — populates real organizational data sourced from
// "Organizational Profile KDF 2023-2025.pdf" and "Strategic Plan KDF 2023-25
// Skardu.pdf". Run once: node scripts/hydrate-from-docs.js
//
// What this does NOT do: invent facts not in the source documents. Real
// person names for cabinet roles and the donation bank account number/IBAN
// are not in either document, so those fields are left blank/draft rather
// than fabricated — see the summary this script prints at the end.
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI in .env.local first");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("kdf");
  const now = new Date();

  // ---- Settings: real address + bank name (org profile confirms JS Bank
  // Skardu; no account number/IBAN is given anywhere in either document) ----
  await db.collection("siteSettings").updateOne(
    { _id: "singleton" },
    {
      $set: {
        address: "Skardu Independent Living Centre (ILC), Near SCO Mess, RHQ Hospital, Opp. Boys High School No.1, Skardu, GB",
        bankName: "JS Bank",
        branchName: "Skardu Branch, GB",
        updatedAt: now,
        updatedBy: "hydrate-from-docs",
      },
    }
  );
  console.log("Settings: address + bank name updated (account number/IBAN left blank — not in source docs).");

  // ---- Partners: real named partner organisations from the org profile ----
  const realPartners = [
    "CHIP (Civil Society HID Programme)",
    "AKRSP (Aga Khan Rural Support Programme)",
    "CBIDN Pakistan",
    "Sight Savers International",
    "National Forum of Women with Disabilities (NFWWDs)",
    "HANDS",
    "Pakistan Red Crescent (PRC) Skardu",
    "Social Welfare Department, Gilgit-Baltistan",
  ];
  for (let i = 0; i < realPartners.length; i++) {
    const name = realPartners[i];
    await db.collection("partners").updateOne(
      { name },
      {
        $set: { name, logo: null, websiteUrl: "", status: "published", sortOrder: (i + 1) * 10, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
  }
  console.log(`Partners: upserted ${realPartners.length} real partner organisations (published, no logo yet).`);

  // ---- Cabinet: archive the old fictional roster, replace with the real
  // organogram's role structure. Names are NOT in the source documents
  // (only role titles), so every node is seeded in "draft" status with an
  // empty name — the site will show nothing here publicly until real names
  // are filled in via /admin/cabinet and each node is published. The one
  // exception: "Muhammad Hassan, District Project Manager" is named on the
  // signature line of both documents. ----
  // Tag our own inserts so re-running this script cleans up its own prior
  // output (by this exact tag) rather than duplicating or archiving any real
  // edits an admin has since made through the CMS.
  const HYDRATION_TAG = "hydrate-from-docs-2023-25";
  const priorRun = await db.collection("cabinetMembers").deleteMany({ hydrationSource: HYDRATION_TAG });
  if (priorRun.deletedCount) {
    console.log(`Cabinet: removed ${priorRun.deletedCount} nodes from a previous run of this script.`);
  } else {
    await db.collection("cabinetMembers").updateMany({}, { $set: { status: "archived", updatedAt: now } });
  }

  async function insertCabinet(doc, parentId) {
    const result = await db.collection("cabinetMembers").insertOne({
      name: doc.name || "",
      role: doc.role,
      photo: null,
      parentId: parentId || null,
      order: doc.order || 0,
      status: "draft",
      hydrationSource: HYDRATION_TAG,
      createdAt: now,
      updatedAt: now,
    });
    return result.insertedId.toString();
  }

  const presidentId = await insertCabinet({ role: "President", order: 1 });
  await insertCabinet({ role: "Vice-President", order: 1 }, presidentId);
  await insertCabinet({ role: "General Secretary", order: 2 }, presidentId);
  await insertCabinet({ role: "Finance Secretary", order: 3 }, presidentId);
  await insertCabinet({ role: "Secretary, Communication", order: 4 }, presidentId);
  await insertCabinet({ role: "Office Secretary", order: 5 }, presidentId);

  const dpmId = await insertCabinet(
    { name: "Muhammad Hassan", role: "District Project Manager", order: 6 },
    presidentId
  );
  const projectStaff = [
    "ILC Trainer (Man)",
    "ILC Trainer (Woman)",
    "Braille Trainer",
    "Computer Instructor",
    "Master Trainer (VTC)",
    "Master Trainer (Arts)",
    "Office Attendant",
    "Driver",
  ];
  for (let i = 0; i < projectStaff.length; i++) {
    await insertCabinet({ role: projectStaff[i], order: i + 1 }, dpmId);
  }

  const wwPresidentId = await insertCabinet({ role: "President, Women's Wing", order: 2 });
  await insertCabinet({ role: "Vice-President, Women's Wing", order: 1 }, wwPresidentId);
  await insertCabinet({ role: "General Secretary, Women's Wing", order: 2 }, wwPresidentId);
  await insertCabinet({ role: "Finance Secretary, Women's Wing", order: 3 }, wwPresidentId);
  await insertCabinet({ role: "Secretary Communication, Women's Wing", order: 4 }, wwPresidentId);
  await insertCabinet({ role: "Office Secretary, Women's Wing", order: 5 }, wwPresidentId);

  console.log(
    "Cabinet: archived the old placeholder roster, seeded the real organogram (President branch, Women's Wing branch, Project Staff) as DRAFT — add real names via /admin/cabinet, then publish each node."
  );

  // ---- Leaders & Voices: the existing entries carry fabricated names and
  // quotes not sourced from either document. Rather than present invented
  // testimony as if it were real, archive them — replace with authentic
  // quotes/names once available. ----
  const leadersResult = await db
    .collection("leaders")
    .updateMany({ status: { $ne: "archived" } }, { $set: { status: "archived", updatedAt: now } });
  const voicesResult = await db
    .collection("voices")
    .updateMany({ status: { $ne: "archived" } }, { $set: { status: "archived", updatedAt: now } });
  console.log(
    `Leaders: archived ${leadersResult.modifiedCount} placeholder entries (fabricated quotes, not sourced from docs).`
  );
  console.log(
    `Voices: archived ${voicesResult.modifiedCount} placeholder entries (fabricated quotes, not sourced from docs).`
  );

  await client.close();
  console.log("\nHydration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
