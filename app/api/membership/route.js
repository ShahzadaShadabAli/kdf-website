import { getDb } from "@/lib/firebase";
import { docsToItems } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipSubmitSchema, PENDING_MEMBERSHIP_STATUSES } from "@/lib/validation/membership";
import { toPlainText } from "@/lib/sanitize";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { hashIp } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`membership:${ip}`);
  if (!allowed) {
    return Response.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = membershipSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.companyWebsite) {
    // Honeypot tripped — pretend success, do nothing.
    return Response.json({ ok: true }, { status: 201 });
  }

  const db = await getDb();
  const doc = {
    fullName: toPlainText(parsed.data.fullName),
    guardianRelation: parsed.data.guardianRelation,
    guardianName: toPlainText(parsed.data.guardianName),
    gender: parsed.data.gender,
    email: toPlainText(parsed.data.email),
    phone: toPlainText(parsed.data.phone),
    cnic: toPlainText(parsed.data.cnic),
    profession: toPlainText(parsed.data.profession),
    homeAddress: toPlainText(parsed.data.homeAddress),
    province: parsed.data.province,
    district: toPlainText(parsed.data.district),
    city: toPlainText(parsed.data.city),
    membershipType: parsed.data.membershipType,
    disability: toPlainText(parsed.data.disability),
    message: toPlainText(parsed.data.message),
    status: "new",
    ipHash: hashIp(ip),
    createdAt: new Date(),
  };
  const ref = await db.collection("membershipRequests").add(doc);

  return Response.json({ item: { _id: ref.id, ...doc } }, { status: 201 });
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const status = searchParams.get("status");

  const db = await getDb();
  let ref = db.collection("membershipRequests");
  if (status === "pending") ref = ref.where("status", "in", PENDING_MEMBERSHIP_STATUSES);
  else if (status && status !== "all") ref = ref.where("status", "==", status);
  const snapshot = await ref.orderBy("createdAt", "desc").limit(limit).get();

  return Response.json({ items: docsToItems(snapshot) }, { headers: { "Cache-Control": "no-store" } });
}
