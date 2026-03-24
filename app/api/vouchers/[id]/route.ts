import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { vouchers, outlets, users, transactions } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { successResponse, errorResponse } from "@/lib/api-utils"

// GET /api/vouchers/[id] - Get voucher by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voucher = await db
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
          address: outlets.address,
          phone: outlets.phone,
          status: outlets.status,
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
      .where(eq(vouchers.id, params.id))
      .limit(1)

    if (!voucher || voucher.length === 0) {
      return errorResponse("Voucher not found", 404)
    }

    return successResponse(voucher[0])
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}

// PATCH /api/vouchers/[id] - Update voucher
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { status, metadata } = body

    const updated = await db
      .update(vouchers)
      .set({
        status,
        metadata,
        updatedAt: new Date(),
      })
      .where(eq(vouchers.id, params.id))
      .returning()

    if (!updated || updated.length === 0) {
      return errorResponse("Voucher not found", 404)
    }

    return successResponse(updated[0], "Voucher updated successfully")
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}

// DELETE /api/vouchers/[id] - Delete voucher
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await db
      .delete(vouchers)
      .where(eq(vouchers.id, params.id))
      .returning()

    if (!deleted || deleted.length === 0) {
      return errorResponse("Voucher not found", 404)
    }

    return successResponse(deleted[0], "Voucher deleted successfully")
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
