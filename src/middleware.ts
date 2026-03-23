import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Read from the HttpOnly-safe cookies the server sets on login.
    // access_token is HttpOnly so middleware can read it server-side,
    // but client JS cannot (XSS protection).
    // user_role is NOT HttpOnly so Next.js middleware (edge runtime) can route by role.
    const token = request.cookies.get("access_token")?.value;
    const role  = request.cookies.get("user_role")?.value;

    // Already logged in → redirect away from login page
    if (pathname.startsWith("/login") && token) {
        const dest = role === "ADMIN" ? "/admin/dashboard" : "/user";
        return NextResponse.redirect(new URL(dest, request.url));
    }

    // Non-admin trying to reach admin pages
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/user", request.url));
    }

    // Unauthenticated user hitting a protected page
    const isPublicPath = pathname.startsWith("/login") || pathname.includes(".");
    if (!token && !isPublicPath && pathname !== "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Root redirect
    if (pathname === "/") {
        if (!token) return NextResponse.redirect(new URL("/login", request.url));
        const dest = role === "ADMIN" ? "/admin/dashboard" : "/user";
        return NextResponse.redirect(new URL(dest, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
