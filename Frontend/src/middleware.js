import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/forgot-password"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Static assets aur DevTools bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/.well-known") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isRoot = pathname === "/";

  // Root handling
  if (isRoot) {
    return NextResponse.redirect(new URL(token ? "/billing" : "/login", request.url));
  }

  // Bina token ke protected route par jaana mana hai
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in hai aur login page khol raha hai
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/billing", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};