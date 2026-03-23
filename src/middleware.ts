import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Read from the HttpOnly-safe cookies the server sets on login.
    const token = request.cookies.get("access_token")?.value;
    const role  = request.cookies.get("user_role")?.value;

    // A session exists if there's either a valid access token OR a persisting user role (which matches refresh_token expiry)
    const hasSession = !!token || !!role;

    // Already logged in → redirect away from login page
    if (pathname.startsWith("/login") && hasSession) {
        const dest = role === "ADMIN" ? "/admin/dashboard" : "/user";
        return NextResponse.redirect(new URL(dest, request.url));
    }

    // Role-based protection: non-admin trying to reach admin pages
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/user", request.url));
    }

    // Unauthenticated user hitting a protected page
    const isPublicPath = pathname.startsWith("/login") || pathname.includes(".");
    if (!hasSession && !isPublicPath && pathname !== "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Root redirect mapping
    if (pathname === "/") {
        if (!hasSession) return NextResponse.redirect(new URL("/login", request.url));
        const dest = role === "ADMIN" ? "/admin/dashboard" : "/user";
        return NextResponse.redirect(new URL(dest, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
