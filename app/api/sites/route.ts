import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { outlets, users, vouchers, transactions } from "@/lib/db/schema"
import { eq, desc, sql, or, like } from "drizzle-orm"
import { nanoid } from "nanoid"
import { successResponse, errorResponse } from "@/lib/api-utils"

// GET /api/sites - List all sites (outlets)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const allOutlets = search
      ? await db
          .select({
            id: outlets.id,
            name: outlets.name,
            address: outlets.address,
            phone: outlets.phone,
            manager: outlets.manager,
            createdAt: outlets.createdAt,
          })
          .from(outlets)
          .where(like(outlets.name, `%${search}%`))
          .orderBy(desc(outlets.createdAt))
      : await db
          .select({
            id: outlets.id,
            name: outlets.name,
            address: outlets.address,
            phone: outlets.phone,
            manager: outlets.manager,
            createdAt: outlets.createdAt,
          })
          .from(outlets)
          .orderBy(desc(outlets.createdAt))

    // Get counts for each outlet
    const outletsWithCounts = await Promise.all(
      allOutlets.map(async (outlet) => {
        const [userCount, voucherCount, transactionCount] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(eq(users.outletId, outlet.id)),
          db
            .select({ count: sql<number>`count(*)` })
            .from(vouchers)
            .where(eq(vouchers.outletId, outlet.id)),
          db
            .select({ count: sql<number>`count(*)` })
            .from(transactions)
            .where(eq(transactions.outletId, outlet.id)),
        ])

        return {
          ...outlet,
          _count: {
            users: Number(userCount[0]?.count || 0),
            vouchers: Number(voucherCount[0]?.count || 0),
            transactions: Number(transactionCount[0]?.count || 0),
          },
        }
      })
    )

    return successResponse({ sites: outletsWithCounts })
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}

// POST /api/sites - Create new site (outlet)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, address, latitude, longitude, phone, manager } = body

    if (!name || !address) {
      return errorResponse("Missing required fields")
    }

    const newOutlet = await db
      .insert(outlets)
      .values({
        id: nanoid(),
        name,
        address,
        latitude: latitude || null,
        longitude: longitude || null,
        phone: phone || null,
        manager: manager || null,
      })
      .returning()

    return successResponse(newOutlet[0], "Outlet created successfully")
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
