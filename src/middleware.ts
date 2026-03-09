import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token and role from cookies
    const token = request.cookies.get("auth_token")?.value;
    const role = request.cookies.get("user_role")?.value;

    // 1. If user is trying to access auth pages (login/signup) and is already logged in,
    // redirect them to the home page or admin page.
    if (pathname.startsWith("/login") && token) {
        if (role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. If user is trying to access PROTECTED admin pages and is NOT an admin,
    // redirect them to the home page.
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. If user is trying to access protected pages and is NOT logged in,
    // redirect them to the login page.
    // Exceptions: public files, api routes, icons
    const isPublicPage = pathname.startsWith("/login") || pathname.includes(".");

    if (!token && !isPublicPage && pathname !== "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Special case for root: redirect to login if no token
    if (pathname === "/" && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
