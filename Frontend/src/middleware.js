import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Ye routes bina login ke accessible honge
const publicRoutes = ["/login", "/register"];

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

// Token ka signature + expiry verify karta hai — sirf existence nahi
async function isTokenValid(token) {
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    // Signature galat, ya expire ho chuka, ya corrupt token
    return false;
  }
}

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const pathname = normalizePath(request.nextUrl.pathname);

  const isPublicRoute = publicRoutes.includes(pathname);
  const isRoot = pathname === "/";

  const validToken = await isTokenValid(token);

  // Root pe koi bhi aaye → seedha sahi jagah bhejo
  if (isRoot) {
    const destination = validToken ? "/billing" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Valid token nahi hai aur protected route khol raha hai → login page pe bhejo
  if (!validToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Stale/invalid cookie yahin se clear kar do, taaki dubara loop na bane
    response.cookies.delete("token");
    return response;
  }

  // Valid token hai lekin login/register page pe ja raha hai → billing pe bhej do
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






// import { NextResponse } from "next/server";

// // Ye routes bina login ke accessible honge
// const publicRoutes = ["/login", "/register"];

// function normalizePath(pathname) {
//   // trailing slash hata do (root "/" ko chhod kar) taaki "/login/" bhi match ho
//   if (pathname.length > 1 && pathname.endsWith("/")) {
//     return pathname.slice(0, -1);
//   }
//   return pathname;
// }

// export function middleware(request) {
//   const token = request.cookies.get("token")?.value;
//   const pathname = normalizePath(request.nextUrl.pathname);

//   const isPublicRoute = publicRoutes.includes(pathname);
//   const isRoot = pathname === "/";

//   // Root pe koi bhi aaye (mobile tab, desktop, fresh open) → seedha sahi jagah bhejo
//   if (isRoot) {
//     const destination = token ? "/billing" : "/login";
//     return NextResponse.redirect(new URL(destination, request.url));
//   }

//   // Login nahi hai aur protected route khol raha hai → login page pe bhejo
//   if (!token && !isPublicRoute) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirect", pathname); // login ke baad wapas yahi bhejne ke liye
//     return NextResponse.redirect(loginUrl);
//   }

//   // Login hai lekin login/register page pe ja raha hai → billing pe bhej do
//   if (token && isPublicRoute) {
//     return NextResponse.redirect(new URL("/billing", request.url));
//   }

//   return NextResponse.next();
// }

// // Matcher — kaunse paths pe ye middleware chalega
// export const config = {
//   matcher: [
//     /*
//      * Sab paths pe chalega EXCEPT:
//      * - api routes
//      * - static files (_next, favicon, images, common asset extensions)
//      */
//     "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
//   ],
// };