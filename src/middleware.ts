import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Read session cookies.
    // access_token: HttpOnly — set by backend, readable here (server-side) but not by JS
    // user_role: non-HttpOnly — set by backend AND by login page JS as fallback
    const token = request.cookies.get("access_token")?.value;
    const role  = request.cookies.get("user_role")?.value;

    // A session is considered active if either cookie is present.
    // user_role alone is enough to route since it expires with the refresh token (7d).
    const hasSession = !!token || !!role;

    // Already logged in → bounce off login page
    if (pathname.startsWith("/login") && hasSession) {
        const dest = role === "ADMIN" ? "/admin/dashboard" : "/user";
        return NextResponse.redirect(new URL(dest, request.url));
    }

    // Non-admin trying to access admin pages → send to user dashboard
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/user", request.url));
    }

    // Unauthenticated trying to access protected page → send to login
    const isPublicPath = pathname.startsWith("/login") || pathname.includes(".");
    if (!hasSession && !isPublicPath && pathname !== "/") {
        const loginUrl = new URL("/login", request.url);
        // Preserve intended destination so we can redirect back after login if needed
        return NextResponse.redirect(loginUrl);
    }

    // Root redirect
    if (pathname === "/") {
        if (!hasSession) return NextResponse.redirect(new URL("/login", request.url));
        const dest = role === "ADMIN" ? "/admin/dashboard" : "/user";
        return NextResponse.redirect(new URL(dest, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
