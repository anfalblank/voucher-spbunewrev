import { NextResponse } from "next/server"

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
