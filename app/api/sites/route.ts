import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { sites, users, vouchers, transactions } from "@/lib/db/schema"
import { eq, desc, sql, or, like } from "drizzle-orm"
import { nanoid } from "nanoid"
import { successResponse, errorResponse } from "@/lib/api-utils"

// GET /api/sites - List all sites
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const allSites = search
      ? await db
          .select({
            id: sites.id,
            name: sites.name,
            code: sites.code,
            address: sites.address,
            phone: sites.phone,
            isActive: sites.isActive,
            createdAt: sites.createdAt,
            updatedAt: sites.updatedAt,
          })
          .from(sites)
          .where(
            or(
              like(sites.name, `%${search}%`),
              like(sites.code, `%${search}%`)
            )
          )
          .orderBy(desc(sites.createdAt))
      : await db
          .select({
            id: sites.id,
            name: sites.name,
            code: sites.code,
            address: sites.address,
            phone: sites.phone,
            isActive: sites.isActive,
            createdAt: sites.createdAt,
            updatedAt: sites.updatedAt,
          })
          .from(sites)
          .orderBy(desc(sites.createdAt))

    // Get counts for each site
    const sitesWithCounts = await Promise.all(
      allSites.map(async (site) => {
        const [userCount, voucherCount, transactionCount] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(eq(users.siteId, site.id)),
          db
            .select({ count: sql<number>`count(*)` })
            .from(vouchers)
            .where(eq(vouchers.siteId, site.id)),
          db
            .select({ count: sql<number>`count(*)` })
            .from(transactions)
            .where(eq(transactions.siteId, site.id)),
        ])

        return {
          ...site,
          _count: {
            users: Number(userCount[0]?.count || 0),
            vouchers: Number(voucherCount[0]?.count || 0),
            transactions: Number(transactionCount[0]?.count || 0),
          },
        }
      })
    )

    return successResponse({ sites: sitesWithCounts })
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}

// POST /api/sites - Create new site
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, code, address, phone } = body

    if (!name || !code || !address) {
      return errorResponse("Missing required fields")
    }

    // Check if code already exists
    const existing = await db.query.sites.findFirst({
      where: eq(sites.code, code),
    })

    if (existing) {
      return errorResponse("Site code already exists", 400)
    }

    const newSite = await db
      .insert(sites)
      .values({
        id: nanoid(),
        name,
        code,
        address,
        phone,
        isActive: true,
      })
      .returning()

    return successResponse(newSite[0], "Site created successfully")
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
