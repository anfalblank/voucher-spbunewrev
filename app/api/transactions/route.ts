import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { transactions, vouchers, outlets, users } from "@/lib/db/schema"
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
    const outletId = searchParams.get("outletId") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const offset = (page - 1) * limit

    let query = db
      .select({
        id: transactions.id,
        voucherId: transactions.voucherId,
        outletId: transactions.outletId,
        userId: transactions.userId,
        status: transactions.status,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
        voucher: {
          id: vouchers.id,
          code: vouchers.code,
          type: vouchers.type,
          value: vouchers.value,
        },
        outlet: {
          id: outlets.id,
          name: outlets.name,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(transactions)
      .leftJoin(vouchers, eq(transactions.voucherId, vouchers.id))
      .leftJoin(outlets, eq(transactions.outletId, outlets.id))
      .leftJoin(users, eq(transactions.userId, users.id))

    // Build conditions array
    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(vouchers.code, `%${search}%`)
        )
      )
    }
    if (status) {
      conditions.push(eq(transactions.status, status as any))
    }
    if (outletId) {
      conditions.push(eq(transactions.outletId, outletId))
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
            outletId: transactions.outletId,
            userId: transactions.userId,
            status: transactions.status,
            notes: transactions.notes,
            createdAt: transactions.createdAt,
            voucher: {
              id: vouchers.id,
              code: vouchers.code,
              type: vouchers.type,
              value: vouchers.value,
            },
            outlet: {
              id: outlets.id,
              name: outlets.name,
            },
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(transactions)
          .leftJoin(vouchers, eq(transactions.voucherId, vouchers.id))
          .leftJoin(outlets, eq(transactions.outletId, outlets.id))
          .leftJoin(users, eq(transactions.userId, users.id))
          .where(and(...conditions))
          .orderBy(desc(transactions.createdAt))
      : await db
          .select({
            id: transactions.id,
            voucherId: transactions.voucherId,
            outletId: transactions.outletId,
            userId: transactions.userId,
            status: transactions.status,
            notes: transactions.notes,
            createdAt: transactions.createdAt,
            voucher: {
              id: vouchers.id,
              code: vouchers.code,
              type: vouchers.type,
              value: vouchers.value,
            },
            outlet: {
              id: outlets.id,
              name: outlets.name,
            },
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(transactions)
          .leftJoin(vouchers, eq(transactions.voucherId, vouchers.id))
          .leftJoin(outlets, eq(transactions.outletId, outlets.id))
          .leftJoin(users, eq(transactions.userId, users.id))
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
      outletId,
      userId,
      status = "SUCCESS",
      notes,
    } = body

    if (!voucherId || !outletId || !userId) {
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

    // Create transaction
    const newTransaction = await db
      .insert(transactions)
      .values({
        id: nanoid(),
        voucherId,
        outletId,
        userId,
        status,
        notes,
      })
      .returning()

    // Update voucher status to USED
    await db
      .update(vouchers)
      .set({
        status: "USED",
      })
      .where(eq(vouchers.id, voucherId))

    return successResponse(newTransaction[0], "Transaction created successfully")
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
