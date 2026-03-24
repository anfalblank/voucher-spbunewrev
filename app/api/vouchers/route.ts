import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { vouchers, outlets, users } from "@/lib/db/schema"
import { eq, and, desc, like } from "drizzle-orm"
import { nanoid } from "nanoid"
import { successResponse, errorResponse } from "@/lib/api-utils"

// GET /api/vouchers - List all vouchers with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const outletId = searchParams.get("outletId") || ""
    const offset = (page - 1) * limit

    // Build conditions
    const conditions = []
    if (search) {
      conditions.push(like(vouchers.code, `%${search}%`))
    }
    if (status) {
      conditions.push(eq(vouchers.status, status as any))
    }
    if (outletId) {
      conditions.push(eq(vouchers.outletId, outletId))
    }

    // Execute query
    const allVouchers = conditions.length > 0
      ? await db
          .select({
            id: vouchers.id,
            code: vouchers.code,
            type: vouchers.type,
            value: vouchers.value,
            status: vouchers.status,
            expiryDate: vouchers.expiryDate,
            outletId: vouchers.outletId,
            createdBy: vouchers.createdBy,
            qrCodeUrl: vouchers.qrCodeUrl,
            metadata: vouchers.metadata,
            createdAt: vouchers.createdAt,
            updatedAt: vouchers.updatedAt,
            outlet: {
              id: outlets.id,
              name: outlets.name,
              code: outlets.code,
            },
            creator: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(vouchers)
          .leftJoin(outlets, eq(vouchers.outletId, outlets.id))
          .leftJoin(users, eq(vouchers.createdBy, users.id))
          .where(and(...conditions))
          .orderBy(desc(vouchers.createdAt))
      : await db
          .select({
            id: vouchers.id,
            code: vouchers.code,
            type: vouchers.type,
            value: vouchers.value,
            status: vouchers.status,
            expiryDate: vouchers.expiryDate,
            outletId: vouchers.outletId,
            createdBy: vouchers.createdBy,
            qrCodeUrl: vouchers.qrCodeUrl,
            metadata: vouchers.metadata,
            createdAt: vouchers.createdAt,
            updatedAt: vouchers.updatedAt,
            outlet: {
              id: outlets.id,
              name: outlets.name,
              code: outlets.code,
            },
            creator: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(vouchers)
          .leftJoin(outlets, eq(vouchers.outletId, outlets.id))
          .leftJoin(users, eq(vouchers.createdBy, users.id))
          .orderBy(desc(vouchers.createdAt))

    const total = allVouchers.length
    const paginatedVouchers = allVouchers.slice(offset, offset + limit)

    return successResponse({
      vouchers: paginatedVouchers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}

// POST /api/vouchers - Create new voucher(s)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      type,
      value,
      expiryDate,
      outletId,
      createdBy,
      quantity = 1,
    } = body

    // Validate required fields
    if (!type || !value || !expiryDate || !outletId || !createdBy) {
      return errorResponse("Missing required fields")
    }

    // Verify outlet exists
    const outlet = await db.query.outlets.findFirst({
      where: eq(outlets.id, outletId),
    })

    if (!outlet) {
      return errorResponse("Outlet not found", 404)
    }

    // Create voucher(s)
    const newVouchers = []
    for (let i = 0; i < quantity; i++) {
      const code = `VOU-${nanoid(8).toUpperCase()}`
      const qrCodeUrl = `/api/qr/${code}`

      const newVoucher = await db
        .insert(vouchers)
        .values({
          id: nanoid(),
          code,
          type,
          value: value.toString(),
          expiryDate: new Date(expiryDate),
          status: "ACTIVE",
          outletId,
          createdBy,
          qrCodeUrl,
        })
        .returning()

      newVouchers.push(newVoucher[0])
    }

    return successResponse(
      { vouchers: newVouchers, created: newVouchers.length },
      `Successfully created ${newVouchers.length} voucher(s)`
    )
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
