import { getDb } from "@/lib/firebase";
import { docToItem } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { settingsUpdateSchema } from "@/lib/validation/settings";
import { SITE_SETTINGS_ID } from "@/models/SiteSettings";
import { writeAuditLog } from "@/models/AuditLog";
import { triggerRevalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const doc = await db.collection("siteSettings").doc(SITE_SETTINGS_ID).get();
  const settings = doc.exists ? docToItem(doc) : null;
  return Response.json(
    { settings },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } }
  );
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "super_admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = await getDb();
  const ref = db.collection("siteSettings").doc(SITE_SETTINGS_ID);
  await ref.set(
    { ...parsed.data, updatedAt: new Date(), updatedBy: session.user.email },
    { merge: true }
  );
  const settings = docToItem(await ref.get());

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "settings.update",
    diff: parsed.data,
  });
  await triggerRevalidate();

  return Response.json({ settings });
}
