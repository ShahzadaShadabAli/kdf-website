import { getDb } from "@/lib/firebase";
import { getById, updateById } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { galleryItemUpdateSchema } from "@/lib/validation/galleryItem";
import { writeAuditLog } from "@/models/AuditLog";
import { triggerRevalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const db = await getDb();
  const item = await getById(db.collection("galleryItems"), params.id);
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ item });
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = galleryItemUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = await getDb();
  const item = await updateById(db.collection("galleryItems"), params.id, {
    ...parsed.data,
    updatedAt: new Date(),
  });
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "gallery.update",
    targetId: params.id,
    diff: parsed.data,
  });
  await triggerRevalidate();

  return Response.json({ item });
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const item = await updateById(db.collection("galleryItems"), params.id, {
    status: "archived",
    updatedAt: new Date(),
  });
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "gallery.archive",
    targetId: params.id,
  });
  await triggerRevalidate();

  return Response.json({ item });
}
