import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes (routes that don't require authentication)
  const publicPaths = ["/admin/login", "/admin"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Check for token in cookies
  const token = request.cookies.get("token")?.value;

  // If accessing protected admin route without token, redirect to login
  if (pathname.startsWith("/admin/dashboard") && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // If accessing login page with valid token, redirect to dashboard
  if (pathname === "/admin/login" && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
