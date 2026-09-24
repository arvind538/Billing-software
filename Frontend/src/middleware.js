import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Ye routes bina login ke accessible honge
const publicRoutes = ["/login", "/register", "/forgot-password"];

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

// Token verify function
async function isTokenValid(token) {
  if (!token) return false;

  const secretKey = process.env.JWT_SECRET;

  // Agar env me JWT_SECRET nahi mila toh warning dega
  if (!secretKey) {
    console.warn("⚠️ Warning: JWT_SECRET environment variable is missing!");
    // Agar secret nahi hai toh sirf token check karega (emergency fallback)
    return Boolean(token);
  }

  try {
    const secret = new TextEncoder().encode(secretKey);
    await jwtVerify(token, secret);
    return true;
  } catch (err) {
    console.error("Middleware JWT Verification Error:", err.message);
    return false;
  }
}

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const pathname = normalizePath(request.nextUrl.pathname);

  const isPublicRoute = publicRoutes.includes(pathname);
  const isRoot = pathname === "/";

  const validToken = await isTokenValid(token);

  // 1. Root ("/") par aaye toh
  if (isRoot) {
    const destination = validToken ? "/billing" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 2. Token nahi hai aur protected route access kar raha hai
  if (!validToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);

    // Sirf tab delete karo agar galat token present tha
    if (token) {
      response.cookies.delete("token");
    }
    return response;
  }

  // 3. Valid token hai aur login/register par ja raha hai -> /billing bhejo
  if (validToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/billing", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};