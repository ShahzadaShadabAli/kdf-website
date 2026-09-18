import crypto from "crypto";
import { getDb } from "@/lib/firebase";
import { docsToItems } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userInviteSchema } from "@/lib/validation/user";
import { writeAuditLog } from "@/models/AuditLog";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "super_admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = await getDb();
  const snapshot = await db.collection("adminUsers").orderBy("createdAt", "desc").get();
  const items = docsToItems(snapshot).map(({ passwordHash: _omit, ...safe }) => safe);

  return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "super_admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = userInviteSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = await getDb();
  const email = parsed.data.email.toLowerCase().trim();
  const existingSnap = await db.collection("adminUsers").where("email", "==", email).limit(1).get();
  if (!existingSnap.empty) return Response.json({ error: "Email already invited" }, { status: 409 });

  // Temporary random password — a real deployment emails a set-password
  // link (Resend/SMTP) instead of this placeholder hash.
  const tempPassword = crypto.randomBytes(24).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const doc = {
    email,
    name: parsed.data.name,
    role: parsed.data.role,
    passwordHash,
    isActive: true,
    lastLoginAt: null,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
  };
  const ref = await db.collection("adminUsers").add(doc);

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "user.invite",
    targetId: ref.id,
    diff: { email, role: parsed.data.role },
  });

  const { passwordHash: _omit, ...safeDoc } = doc;
  return Response.json({ item: { _id: ref.id, ...safeDoc } }, { status: 201 });
}
