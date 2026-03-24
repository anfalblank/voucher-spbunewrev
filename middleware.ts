import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function hasSessionCookie(req: NextRequest): boolean {
  const cookies = req.cookies.getAll()
  return cookies.some(cookie =>
    cookie.name.startsWith("better-auth.session_token")
  )
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const hasSession = hasSessionCookie(req)

  const isAuthPage = path === "/login" || path.startsWith("/login/")
  const isDashboardPage = path === "/dashboard" || path.startsWith("/dashboard/")
  const isPublicPage = path === "/"

  // Redirect to dashboard if already logged in and trying to access login
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect to login if not logged in and trying to access dashboard
  if (isDashboardPage && !hasSession) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match root and auth pages
    "/",
    "/login",
    "/login/:path*",

    // Match dashboard and all dashboard routes
    "/dashboard",
    "/dashboard/:path*",

    // Admin routes
    "/admin/:path*",

    // Other protected routes
    "/sites/:path*",
    "/vouchers/:path*",
    "/transactions/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/scan/:path*",
    "/operators/:path*",
  ],
}
