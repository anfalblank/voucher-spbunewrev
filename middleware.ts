import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function hasSessionCookie(req: NextRequest): boolean {
  const cookies = req.cookies.getAll()
  return cookies.some(cookie =>
    cookie.name.includes("session_token")
  )
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const hasSession = hasSessionCookie(req)

  const isAuthPage = path === "/login" || path.startsWith("/login/")
  const isDashboardPage = path === "/dashboard" || path.startsWith("/dashboard/")
  const isApiAuthPage = path.startsWith("/api/auth")
  const isApiPage = path.startsWith("/api/") && !isApiAuthPage

  // Redirect to dashboard if already logged in and trying to access login
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Handle protected pages
  if (!hasSession) {
    if (isDashboardPage) {
      const loginUrl = new URL("/login", req.url)
      return NextResponse.redirect(loginUrl)
    }
    
    if (isApiPage) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      )
    }
    
    // In case there are other protected web routes
    if (!isAuthPage && path !== "/" && !isApiAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
