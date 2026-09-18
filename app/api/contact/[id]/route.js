import { getDb } from "@/lib/firebase";
import { updateById } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contactUpdateSchema } from "@/lib/validation/contact";
import { writeAuditLog } from "@/models/AuditLog";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = contactUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = await getDb();
  const item = await updateById(db.collection("contactMessages"), params.id, parsed.data);
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "contact.statusChange",
    targetId: params.id,
    diff: parsed.data,
  });

  return Response.json({ item });
}
