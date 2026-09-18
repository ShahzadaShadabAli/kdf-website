import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// Internal, secret-protected — called by admin mutations (and by
// lib/cache.js's triggerRevalidate) to bust ISR immediately instead of
// waiting out the timed revalidate() window.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret || body.secret !== secret) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  const paths = Array.isArray(body.paths) && body.paths.length ? body.paths : ["/"];
  paths.forEach((path) => revalidatePath(path));

  return Response.json({ revalidated: true, paths });
}
