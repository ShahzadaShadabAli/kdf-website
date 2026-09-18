export async function triggerRevalidate(paths = ["/", "/shop", "/gallery"]) {
  const secret = process.env.REVALIDATE_SECRET;
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  if (!secret) return;

  try {
    await fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, paths }),
    });
  } catch {
    // Revalidation is best-effort — ISR's timed revalidate() is the fallback.
  }
}

export function hashIp(ip, salt = process.env.NEXTAUTH_SECRET || "kdf-salt") {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
