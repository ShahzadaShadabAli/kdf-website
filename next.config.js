const isDev = process.env.NODE_ENV !== "production";

// next/font self-hosts Google fonts under /_next/static/media on this origin,
// so font-src needs 'self' — https://fonts.gstatic.com is unused now (kept
// harmless in case a component ever links a font directly) but 'self' is
// what actually serves next/font/google's files.
// script-src needs 'unsafe-eval' only in dev (webpack's eval-based HMR); the
// production bundle never eval()s, so it stays out of the prod policy.
const csp = [
  "default-src 'self'",
  "img-src 'self' https://res.cloudinary.com data:",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // The admin uploader posts the file straight to Cloudinary's upload API
  // from the browser (see lib/uploadImage.js) — connect-src must allow it.
  "connect-src 'self' https://api.cloudinary.com",
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
