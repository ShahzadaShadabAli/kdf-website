import bcrypt from "bcryptjs";
import { getDb } from "@/lib/firebase";
import { getById } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation/user";
import { writeAuditLog } from "@/models/AuditLog";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = await getDb();
  const users = db.collection("adminUsers");
  const user = await getById(users, session.user.id);
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return Response.json(
      { error: { fieldErrors: { currentPassword: ["Current password is incorrect"] } } },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await users.doc(user._id).update({ passwordHash });

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "user.change_password",
    targetId: session.user.id,
    diff: null,
  });

  return Response.json({ ok: true });
}
