import { getDb } from "@/lib/firebase";
import { listByStatus } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { successStorySchema } from "@/lib/validation/successStory";
import { writeAuditLog } from "@/models/AuditLog";
import { triggerRevalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isAdminReq = searchParams.get("admin") === "1";
  const session = isAdminReq ? await getServerSession(authOptions) : null;

  const db = await getDb();
  const items = await listByStatus(db.collection("successStories"), {
    isAdmin: isAdminReq && !!session,
    orderByField: "order",
  });

  const headers = isAdminReq
    ? { "Cache-Control": "no-store" }
    : { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" };

  return Response.json({ items }, { headers });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = successStorySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = await getDb();
  const now = new Date();
  const doc = { ...parsed.data, createdAt: now, updatedAt: now };
  const ref = await db.collection("successStories").add(doc);

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "successStory.create",
    targetId: ref.id,
    diff: parsed.data,
  });
  await triggerRevalidate();

  return Response.json({ item: { _id: ref.id, ...doc } }, { status: 201 });
}
