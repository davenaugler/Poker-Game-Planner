import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/api/auth/login", "/api/auth/register"]

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      (request.nextUrl.pathname.startsWith("/api/games") && request.method === "GET"),
  )

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    // If accessing API, return 401
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Otherwise redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload) {
    // If accessing API, return 401
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Otherwise redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

