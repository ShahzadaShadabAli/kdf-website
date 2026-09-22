import { getDb } from "@/lib/firebase";
import { updateById } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipUpdateSchema } from "@/lib/validation/membership";
import { writeAuditLog } from "@/models/AuditLog";
import { triggerRevalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

const AUDIT_ACTION = {
  accepted: "membership.accepted",
  rejected: "membership.rejected",
  new: "membership.reopened",
};

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = membershipUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { status } = parsed.data;
  const decided = status !== "new";
  const db = await getDb();
  const item = await updateById(db.collection("membershipRequests"), params.id, {
    status,
    decidedAt: decided ? new Date() : null,
    decidedBy: decided ? session.user.email : null,
  });
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  await writeAuditLog(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: AUDIT_ACTION[status],
    targetId: params.id,
    diff: { status },
  });

  // The homepage shows how many members have joined through the website.
  await triggerRevalidate();

  return Response.json({ item });
}
