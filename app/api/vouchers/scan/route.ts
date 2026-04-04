import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { vouchers, outlets, users, voucherRedemptions, transactions } from "@/lib/db/schema"
import { eq, and, or } from "drizzle-orm"
import { successResponse, errorResponse, getSessionAndUser } from "@/lib/api-utils"
import { nanoid } from "nanoid"

// POST /api/vouchers/scan - Scan and validate voucher
export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authentication & Identity
    const session = await getSessionAndUser(req)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const authUser = session.user as any
    const operatorId = authUser.id
    // If the user has an assigned outlet, force usage of it
    const operatorOutletId = authUser.outletId
    const operatorRole = authUser.role || "OPERATOR"

    const body = await req.json()
    const { code } = body

    // Validate required fields
    if (!code) {
      return errorResponse("Missing required fields: code")
    }

    // Capture metadata about the request for logging
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    // Find voucher by code or by direct QR ID
    const voucherList = await db
      .select()
      .from(vouchers)
      .where(
        or(
          eq(vouchers.code, code.toUpperCase()),
          eq(vouchers.id, code)
        )
      )
      .limit(1)

    if (!voucherList || voucherList.length === 0) {
      return errorResponse("Voucher tidak ditemukan", 404)
    }

    const voucher = voucherList[0]

    // Determine the outlet where this scan is taking place
    const scanOutletId = operatorOutletId || voucher.outletId

    // Check if voucher is for the outlet the operator is assigned to
    if (operatorOutletId && voucher.outletId !== operatorOutletId) {
      await db.insert(voucherRedemptions).values({
        id: nanoid(),
        voucherId: voucher.id,
        transactionId: null,
        outletId: scanOutletId,
        operatorId: operatorId,
        status: "FAILED",
        failureReason: "Voucher not valid for this operator's outlet",
        qrCodeData: code,
        ipAddress,
        userAgent,
      })
      return errorResponse("Voucher tidak valid untuk outlet Anda")
    }

    // Check if voucher is expired
    const now = new Date()
    if (voucher.expiryDate && new Date(voucher.expiryDate) < now) {
      await db.update(vouchers)
        .set({ status: "EXPIRED" })
        .where(eq(vouchers.id, voucher.id))

      await db.insert(voucherRedemptions).values({
        id: nanoid(),
        voucherId: voucher.id,
        transactionId: null,
        outletId: scanOutletId,
        operatorId: operatorId,
        status: "EXPIRED",
        failureReason: "Voucher has expired",
        qrCodeData: code,
        ipAddress,
        userAgent,
      })
      return errorResponse("Voucher sudah expired")
    }

    // Check if voucher is already used
    if (voucher.status === "USED") {
      await db.insert(voucherRedemptions).values({
        id: nanoid(),
        voucherId: voucher.id,
        transactionId: null,
        outletId: scanOutletId,
        operatorId: operatorId,
        status: "ALREADY_USED",
        failureReason: "Voucher already used",
        qrCodeData: code,
        ipAddress,
        userAgent,
      })
      return errorResponse("Voucher sudah digunakan")
    }

    // Check if voucher is active
    if (voucher.status !== "ACTIVE") {
      return errorResponse(`Voucher tidak aktif. Status: ${voucher.status}`)
    }

    // Atomic Transaction:
    // 1. Update Voucher to USED
    // 2. Create Transaction
    // 3. Create Voucher Redemption log
    const transactionId = nanoid()
    const redemptionId = nanoid()

    db.transaction((tx) => {
      // Mark voucher as used
      tx.update(vouchers)
        .set({ status: "USED", updatedAt: new Date() })
        .where(eq(vouchers.id, voucher.id))
        .run()

      // Create transaction record
      tx.insert(transactions).values({
        id: transactionId,
        voucherId: voucher.id,
        userId: operatorId,
        outletId: scanOutletId,
        status: "SUCCESS",
        notes: "Auto-generated upon scan",
      }).run()

      // Create redemption log pointing to transaction
      tx.insert(voucherRedemptions).values({
        id: redemptionId,
        voucherId: voucher.id,
        transactionId: transactionId,
        outletId: scanOutletId,
        operatorId: operatorId,
        status: "SUCCESS",
        qrCodeData: code,
        ipAddress,
        userAgent,
      }).run()
    })

    // Get final voucher details for client response
    const voucherDetails = await db
      .select({
        id: vouchers.id,
        code: vouchers.code,
        type: vouchers.type,
        value: vouchers.value,
        status: vouchers.status,
        expiryDate: vouchers.expiryDate,
        outletId: vouchers.outletId,
        outlet: {
          id: outlets.id,
          name: outlets.name,
          code: outlets.code,
          address: outlets.address,
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
      .where(eq(vouchers.id, voucher.id))
      .limit(1)

    return successResponse({
      voucher: voucherDetails[0],
      transactionId,
      message: "Voucher berhasil divalidasi",
    })
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
