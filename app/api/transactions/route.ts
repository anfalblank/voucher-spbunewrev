import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { transactions, vouchers, sites, users } from "@/lib/db/schema"
import { eq, desc, and, gte, lte, or, like } from "drizzle-orm"
import { nanoid } from "nanoid"
import { successResponse, errorResponse } from "@/lib/api-utils"

// GET /api/transactions - List all transactions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const siteId = searchParams.get("siteId") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const offset = (page - 1) * limit

    let query = db
      .select({
        id: transactions.id,
        voucherId: transactions.voucherId,
        siteId: transactions.siteId,
        operatorId: transactions.operatorId,
        vehiclePlate: transactions.vehiclePlate,
        literAmount: transactions.literAmount,
        rupiahAmount: transactions.rupiahAmount,
        odometer: transactions.odometer,
        status: transactions.status,
        validatedAt: transactions.validatedAt,
        metadata: transactions.metadata,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        voucher: {
          id: vouchers.id,
          code: vouchers.code,
          type: vouchers.type,
          value: vouchers.value,
        },
        site: {
          id: sites.id,
          name: sites.name,
          code: sites.code,
        },
        operator: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(transactions)
      .leftJoin(vouchers, eq(transactions.voucherId, vouchers.id))
      .leftJoin(sites, eq(transactions.siteId, sites.id))
      .leftJoin(users, eq(transactions.operatorId, users.id))

    // Build conditions array
    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(vouchers.code, `%${search}%`),
          like(transactions.vehiclePlate, `%${search}%`)
        )
      )
    }
    if (status) {
      conditions.push(eq(transactions.status, status as any))
    }
    if (siteId) {
      conditions.push(eq(transactions.siteId, siteId))
    }
    if (dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(dateFrom)))
    }
    if (dateTo) {
      conditions.push(lte(transactions.createdAt, new Date(dateTo)))
    }

    // Execute query with or without filters
    const allTransactions = conditions.length > 0
      ? await db
          .select({
            id: transactions.id,
            voucherId: transactions.voucherId,
            siteId: transactions.siteId,
            operatorId: transactions.operatorId,
            vehiclePlate: transactions.vehiclePlate,
            literAmount: transactions.literAmount,
            rupiahAmount: transactions.rupiahAmount,
            odometer: transactions.odometer,
            status: transactions.status,
            validatedAt: transactions.validatedAt,
            metadata: transactions.metadata,
            createdAt: transactions.createdAt,
            updatedAt: transactions.updatedAt,
            voucher: {
              id: vouchers.id,
              code: vouchers.code,
              type: vouchers.type,
              value: vouchers.value,
            },
            site: {
              id: sites.id,
              name: sites.name,
              code: sites.code,
            },
            operator: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(transactions)
          .leftJoin(vouchers, eq(transactions.voucherId, vouchers.id))
          .leftJoin(sites, eq(transactions.siteId, sites.id))
          .leftJoin(users, eq(transactions.operatorId, users.id))
          .where(and(...conditions))
          .orderBy(desc(transactions.createdAt))
      : await db
          .select({
            id: transactions.id,
            voucherId: transactions.voucherId,
            siteId: transactions.siteId,
            operatorId: transactions.operatorId,
            vehiclePlate: transactions.vehiclePlate,
            literAmount: transactions.literAmount,
            rupiahAmount: transactions.rupiahAmount,
            odometer: transactions.odometer,
            status: transactions.status,
            validatedAt: transactions.validatedAt,
            metadata: transactions.metadata,
            createdAt: transactions.createdAt,
            updatedAt: transactions.updatedAt,
            voucher: {
              id: vouchers.id,
              code: vouchers.code,
              type: vouchers.type,
              value: vouchers.value,
            },
            site: {
              id: sites.id,
              name: sites.name,
              code: sites.code,
            },
            operator: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(transactions)
          .leftJoin(vouchers, eq(transactions.voucherId, vouchers.id))
          .leftJoin(sites, eq(transactions.siteId, sites.id))
          .leftJoin(users, eq(transactions.operatorId, users.id))
          .orderBy(desc(transactions.createdAt))

    const total = allTransactions.length
    const paginatedTransactions = allTransactions.slice(offset, offset + limit)

    return successResponse({
      transactions: paginatedTransactions,
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

// POST /api/transactions - Create new transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      voucherId,
      siteId,
      operatorId,
      vehiclePlate,
      literAmount,
      rupiahAmount,
      odometer,
      status = "COMPLETED",
    } = body

    if (!voucherId || !siteId || !operatorId || !literAmount || !rupiahAmount) {
      return errorResponse("Missing required fields")
    }

    // Verify voucher exists and is valid
    const voucher = await db.query.vouchers.findFirst({
      where: eq(vouchers.id, voucherId),
    })

    if (!voucher) {
      return errorResponse("Voucher not found", 404)
    }

    if (voucher.status !== "ACTIVE") {
      return errorResponse("Voucher is not active", 400)
    }

    if (voucher.currentUsage >= voucher.usageLimit) {
      return errorResponse("Voucher usage limit reached", 400)
    }

    // Create transaction
    const newTransaction = await db
      .insert(transactions)
      .values({
        id: nanoid(),
        voucherId,
        siteId,
        operatorId,
        vehiclePlate,
        literAmount: literAmount.toString(),
        rupiahAmount: rupiahAmount.toString(),
        odometer,
        status,
        validatedAt: new Date(),
      })
      .returning()

    // Update voucher status and usage
    await db
      .update(vouchers)
      .set({
        transactionId: newTransaction[0].id,
        currentUsage: voucher.currentUsage + 1,
        status: voucher.currentUsage + 1 >= voucher.usageLimit ? "USED" : "ACTIVE",
        updatedAt: new Date(),
      })
      .where(eq(vouchers.id, voucherId))

    return successResponse(newTransaction[0], "Transaction created successfully")
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
