import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/", "/dashboard", "/inventory"];
const publicRoutes = ["/login"];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    const sessionCookie = request.cookies.get("session")?.value;

    let isValidSession = false;
    if (sessionCookie) {
        try {
            const secretKey = process.env.JWT_SECRET || "default-secret-key-change-this";
            const key = new TextEncoder().encode(secretKey);
            await jwtVerify(sessionCookie, key, { algorithms: ["HS256"] });
            isValidSession = true;
        } catch {
            isValidSession = false;
        }
    }

    // Redirect to login if accessing protected route without valid session
    if (isProtectedRoute && !isValidSession) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    // Redirect to home if accessing login page with valid session
    if (isPublicRoute && isValidSession) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
