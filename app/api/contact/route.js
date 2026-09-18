import { getDb } from "@/lib/firebase";
import { docsToItems } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contactSubmitSchema } from "@/lib/validation/contact";
import { toPlainText } from "@/lib/sanitize";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { hashIp } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`contact:${ip}`);
  if (!allowed) {
    return Response.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = contactSubmitSchema.safeParse(body);
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
    email: toPlainText(parsed.data.email),
    message: toPlainText(parsed.data.message),
    status: "new",
    ipHash: hashIp(ip),
    createdAt: new Date(),
  };
  const ref = await db.collection("contactMessages").add(doc);

  return Response.json({ item: { _id: ref.id, ...doc } }, { status: 201 });
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const status = searchParams.get("status");

  const db = await getDb();
  let ref = db.collection("contactMessages");
  if (status && status !== "all") ref = ref.where("status", "==", status);
  const snapshot = await ref.orderBy("createdAt", "desc").limit(limit).get();

  return Response.json({ items: docsToItems(snapshot) }, { headers: { "Cache-Control": "no-store" } });
}
