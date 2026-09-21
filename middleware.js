import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const ALWAYS_PROTECTED = ["/api/upload", "/api/users", "/api/revalidate"];
const SUPER_ADMIN_ONLY = ["/api/users", "/api/settings"];

// Public GET (product/gallery/leader/settings reads) stay open; every
// mutating verb on those same routes, plus /admin/* and always-protected
// API routes, requires a session.
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = await getToken({ req });
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api/");
  if (!isApi) return NextResponse.next();

  const needsAuth =
    ALWAYS_PROTECTED.some((p) => pathname.startsWith(p)) ||
    (req.method !== "GET" &&
      [
        "/api/products",
        "/api/gallery",
        "/api/leaders",
        "/api/settings",
        "/api/partners",
        "/api/cabinet",
        "/api/voices",
        "/api/success-stories",
      ].some((p) => pathname.startsWith(p))) ||
    // Membership requests: POST (public submit) stays open, GET (admin inbox)
    // and PATCH (status change) both require a session.
    (pathname.startsWith("/api/membership") && req.method !== "POST");

  if (!needsAuth) return NextResponse.next();

  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requiresSuperAdmin = SUPER_ADMIN_ONLY.some((p) => pathname.startsWith(p));
  if (requiresSuperAdmin && token.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/products/:path*",
    "/api/gallery/:path*",
    "/api/leaders/:path*",
    "/api/settings",
    "/api/partners/:path*",
    "/api/membership/:path*",
    "/api/cabinet/:path*",
    "/api/voices/:path*",
    "/api/success-stories/:path*",
    "/api/upload/:path*",
    "/api/users/:path*",
    "/api/revalidate",
  ],
};
