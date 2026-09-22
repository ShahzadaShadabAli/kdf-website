const isDev = process.env.NODE_ENV !== "production";

// next/font self-hosts Google fonts under /_next/static/media on this origin,
// so font-src needs 'self' — https://fonts.gstatic.com is unused now (kept
// harmless in case a component ever links a font directly) but 'self' is
// what actually serves next/font/google's files.
// script-src needs 'unsafe-eval' only in dev (webpack's eval-based HMR); the
// production bundle never eval()s, so it stays out of the prod policy.
const csp = [
  "default-src 'self'",
  // i.ytimg.com serves success-story video thumbnails; blob: is the admin
  // crop step's local preview of a photo before it is uploaded.
  "img-src 'self' https://res.cloudinary.com https://i.ytimg.com data: blob:",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // The admin uploader posts the file straight to Cloudinary's upload API
  // from the browser (see lib/uploadImage.js) — connect-src must allow it.
  "connect-src 'self' https://api.cloudinary.com",
  // Success-story videos embed straight from YouTube — no video file ever
  // touches our own server/storage.
  "frame-src https://www.google.com https://www.youtube-nocookie.com",
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
