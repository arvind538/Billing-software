import { NextResponse } from "next/server";

// Ye routes bina login ke accessible honge
const publicRoutes = ["/login", "/register"];

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.includes(pathname);

  // Login nahi hai aur protected route khol raha hai → login page pe bhejo
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname); // login ke baad wapas yahi bhejne ke liye
    return NextResponse.redirect(loginUrl);
  }

  // Login hai lekin login/register page pe ja raha hai → billing pe bhej do
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/billing", request.url));
  }

  return NextResponse.next();
}

// Matcher — kaunse paths pe ye middleware chalega
export const config = {
  matcher: [
    /*
     * Sab paths pe chalega EXCEPT:
     * - api routes
     * - static files (_next, favicon, images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};