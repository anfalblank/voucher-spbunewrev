import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { vouchers, outlets, users, voucherRedemptions } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { successResponse, errorResponse } from "@/lib/api-utils"
import { nanoid } from "nanoid"

// POST /api/vouchers/scan - Scan and validate voucher
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, operatorId, outletId } = body

    // Validate required fields
    if (!code || !operatorId || !outletId) {
      return errorResponse("Missing required fields: code, operatorId, outletId")
    }

    // Find voucher by code
    const voucherList = await db
      .select()
      .from(vouchers)
      .where(eq(vouchers.code, code.toUpperCase()))
      .limit(1)

    if (!voucherList || voucherList.length === 0) {
      // Cannot log non-existent voucher due to foreign key constraint
      return errorResponse("Voucher tidak ditemukan", 404)
    }

    const voucher = voucherList[0]

    // Check if voucher is for this outlet
    if (voucher.outletId !== outletId) {
      await db.insert(voucherRedemptions).values({
        id: nanoid(),
        voucherId: voucher.id,
        transactionId: null,
        outletId: outletId,
        operatorId: operatorId,
        status: "FAILED",
        failureReason: "Voucher not valid for this outlet",
        qrCodeData: code,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      })

      return errorResponse("Voucher tidak valid untuk outlet ini")
    }

    // Check if voucher is expired
    const now = new Date()
    if (voucher.expiryDate && new Date(voucher.expiryDate) < now) {
      // Update voucher status to expired
      await db.update(vouchers)
        .set({ status: "EXPIRED" })
        .where(eq(vouchers.id, voucher.id))

      await db.insert(voucherRedemptions).values({
        id: nanoid(),
        voucherId: voucher.id,
        transactionId: null,
        outletId: outletId,
        operatorId: operatorId,
        status: "EXPIRED",
        failureReason: "Voucher has expired",
        qrCodeData: code,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      })

      return errorResponse("Voucher sudah expired")
    }

    // Check if voucher is already used
    if (voucher.status === "USED") {
      await db.insert(voucherRedemptions).values({
        id: nanoid(),
        voucherId: voucher.id,
        transactionId: null,
        outletId: outletId,
        operatorId: operatorId,
        status: "ALREADY_USED",
        failureReason: "Voucher already used",
        qrCodeData: code,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      })

      return errorResponse("Voucher sudah digunakan")
    }

    // Check if voucher is active
    if (voucher.status !== "ACTIVE") {
      return errorResponse(`Voucher tidak aktif. Status: ${voucher.status}`)
    }

    // Get voucher details with relations
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

    // Log successful scan and mark voucher as used
    await db.insert(voucherRedemptions).values({
      id: nanoid(),
      voucherId: voucher.id,
      transactionId: null,
      outletId: outletId,
      operatorId: operatorId,
      status: "SUCCESS",
      qrCodeData: code,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    })

    // Mark voucher as used
    await db.update(vouchers)
      .set({ status: "USED", updatedAt: new Date() })
      .where(eq(vouchers.id, voucher.id))

    return successResponse({
      voucher: voucherDetails[0],
      message: "Voucher berhasil divalidasi",
    })
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
