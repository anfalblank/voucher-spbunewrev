import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { outlets } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { successResponse, errorResponse, requireRoles } from "@/lib/api-utils"

// GET /api/outlets - List all outlets
export async function GET(req: NextRequest) {
  try {
    const { session, error: authError } = await requireRoles(req, ["ADMIN", "OWNER"])
    if (authError) return authError
    const allOutlets = await db
      .select()
      .from(outlets)
      .orderBy(desc(outlets.createdAt))

    return successResponse({ outlets: allOutlets })
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
