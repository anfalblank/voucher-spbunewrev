import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./auth"

export function handleApiError(error: any) {
  console.error("API error:", error)
  return NextResponse.json(
    { error: error.message || "Internal server error" },
    { status: error.status || 500 }
  )
}

export function successResponse(data: any, message?: string) {
  return NextResponse.json({ success: true, data, message })
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function getSessionAndUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  return session
}

export async function requireRoles(req: NextRequest, allowedRoles: string[]) {
  const session = await getSessionAndUser(req)
  if (!session || !session.user) {
    return {
      session: null,
      error: errorResponse("Unauthorized", 401)
    }
  }

  // user.role is added in auth.ts as additionalFields
  const userRole = (session.user as any).role || "OPERATOR"
  
  if (!allowedRoles.includes(userRole)) {
    return {
      session,
      error: errorResponse("Forbidden: Insufficient permissions", 403)
    }
  }

  return { session, error: null }
}
