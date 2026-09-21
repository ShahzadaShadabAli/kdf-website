import { revalidatePath } from "next/cache";

// Called by every admin save. Revalidating the root layout refreshes all
// public pages (and their metadata, e.g. the favicon) on the next visit.
export async function triggerRevalidate() {
  revalidatePath("/", "layout");
}

export function hashIp(ip, salt = process.env.NEXTAUTH_SECRET || "kdf-salt") {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
