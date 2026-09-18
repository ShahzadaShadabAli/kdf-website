import { getDb } from "@/lib/firebase";
import { updateById } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userUpdateSchema } from "@/lib/validation/user";
import { writeAuditLog } from "@/models/AuditLog";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "super_admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  if (params.id === session.user.id) {
    return Response.json({ error: "Cannot modify your own account here" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = await getDb();
  const item = await updateById(db.collection("adminUsers"), params.id, parsed.data);
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  const { passwordHash: _omit, ...safeItem } = item;

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "user.update",
    targetId: params.id,
    diff: parsed.data,
  });

  return Response.json({ item: safeItem });
}
