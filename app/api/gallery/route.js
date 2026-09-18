import { getDb, admin } from "@/lib/firebase";
import { docsToItems, isValidId } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { galleryItemSchema } from "@/lib/validation/galleryItem";
import { writeAuditLog } from "@/models/AuditLog";
import { triggerRevalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 6, 24);
  const cursor = searchParams.get("cursor");
  const category = searchParams.get("category");
  const isAdminReq = searchParams.get("admin") === "1";

  const session = isAdminReq ? await getServerSession(authOptions) : null;

  const db = await getDb();
  let ref = db.collection("galleryItems");
  if (!(isAdminReq && session)) ref = ref.where("status", "==", "published");

  const snapshot = await ref.orderBy("createdAt", "asc").orderBy(admin.firestore.FieldPath.documentId()).get();
  let items = docsToItems(snapshot);
  if (category && category !== "all") items = items.filter((i) => i.category === category);

  let startIndex = 0;
  if (cursor && isValidId(cursor)) {
    const idx = items.findIndex((i) => i._id === cursor);
    if (idx >= 0) startIndex = idx + 1;
  }

  const page = items.slice(startIndex, startIndex + limit + 1);
  const hasMore = page.length > limit;
  const trimmed = hasMore ? page.slice(0, limit) : page;

  const headers = isAdminReq
    ? { "Cache-Control": "no-store" }
    : { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" };

  return Response.json(
    { items: trimmed, nextCursor: hasMore ? trimmed[trimmed.length - 1]._id : null },
    { headers }
  );
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = galleryItemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = await getDb();
  const now = new Date();
  const doc = { ...parsed.data, createdAt: now, updatedAt: now };
  const ref = await db.collection("galleryItems").add(doc);

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "gallery.create",
    targetId: ref.id,
    diff: parsed.data,
  });

  await triggerRevalidate();

  return Response.json({ item: { _id: ref.id, ...doc } }, { status: 201 });
}
