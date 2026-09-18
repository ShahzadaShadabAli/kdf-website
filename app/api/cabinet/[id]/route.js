import { getDb } from "@/lib/firebase";
import { getById, updateById, isValidId } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cabinetMemberUpdateSchema } from "@/lib/validation/cabinetMember";
import { writeAuditLog } from "@/models/AuditLog";
import { triggerRevalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = cabinetMemberUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.parentId) {
    if (!isValidId(parsed.data.parentId)) {
      return Response.json({ error: "Invalid parentId" }, { status: 400 });
    }
    if (parsed.data.parentId === params.id) {
      return Response.json({ error: "A member cannot be their own parent" }, { status: 400 });
    }
  }

  const db = await getDb();
  const item = await updateById(db.collection("cabinetMembers"), params.id, {
    ...parsed.data,
    updatedAt: new Date(),
  });
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "cabinet.update",
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
  const collection = db.collection("cabinetMembers");

  // Re-parent any direct children to this member's own parent, rather than
  // orphaning a whole subtree when one node in the middle is archived.
  const current = await getById(collection, params.id);
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });

  const childrenSnap = await collection.where("parentId", "==", params.id).get();
  const batch = db.batch();
  childrenSnap.docs.forEach((childDoc) => {
    batch.update(childDoc.ref, { parentId: current.parentId ?? null });
  });
  batch.update(collection.doc(params.id), { status: "archived", updatedAt: new Date() });
  await batch.commit();

  const item = await getById(collection, params.id);

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "cabinet.archive",
    targetId: params.id,
  });
  await triggerRevalidate();

  return Response.json({ item });
}
