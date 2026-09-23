import { getDb } from "@/lib/firebase";
import { docsToItems } from "@/lib/firestoreHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
