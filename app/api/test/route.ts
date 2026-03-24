import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { outlets, users, vouchers } from "@/lib/db/schema"

export async function GET() {
  try {
    // Test database connection
    const outletCount = await db.select().from(outlets)
    const userCount = await db.select().from(users)
    const voucherCount = await db.select().from(vouchers)

    return NextResponse.json({
      success: true,
      data: {
        outlets: outletCount.length,
        users: userCount.length,
        vouchers: voucherCount.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
