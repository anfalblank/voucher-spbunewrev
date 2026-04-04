import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transactions, vouchers, outlets } from "@/lib/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { successResponse, errorResponse, requireRoles } from "@/lib/api-utils"

// GET /api/reports/stats
export async function GET(req: NextRequest) {
  try {
    const { session, error: authError } = await requireRoles(req, ["ADMIN", "OWNER"])
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Build conditions
    const conditions = []
    
    // Default to only SUCCESS transactions
    conditions.push(eq(transactions.status, "SUCCESS"))

    if (dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(dateFrom)))
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      conditions.push(lte(transactions.createdAt, to))
    }

    // Fetch all relevant transactions joined with vouchers and outlets
    const query = db
      .select({
        id: transactions.id,
        status: transactions.status,
        createdAt: transactions.createdAt,
        voucherType: vouchers.type,
        voucherValue: vouchers.value,
        outletId: outlets.id,
        outletName: outlets.name,
      })
      .from(transactions)
      .innerJoin(vouchers, eq(transactions.voucherId, vouchers.id))
      .innerJoin(outlets, eq(transactions.outletId, outlets.id))

    const txRecords = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query

    // Aggregations
    let totalTransactions = 0
    let totalVolume = 0 // for LITER
    let totalValue = 0 // for RUPIAH or FIXED (assuming RUPIAH = IDR, LITER is ignored in total value if not converted)
    
    const siteStatsMap = new Map<string, any>()
    const typeStatsMap = new Map<string, any>()

    for (const tx of txRecords) {
      totalTransactions++
      const val = parseFloat(tx.voucherValue || "0")

      // Metric calculations based on type
      let txValueRupiah = 0
      let txVolumeLiter = 0

      if (tx.voucherType === "CREDIT") {
        totalVolume += val
        txVolumeLiter = val
        // Assume 10000 per liter for totalValue estimation if purely needed
        txValueRupiah = val * 10000 
      } else if (tx.voucherType === "FIXED" || tx.voucherType === "DISCOUNT") {
        totalValue += val
        txValueRupiah = val
      } else {
        totalValue += val
        txValueRupiah = val
      }

      // Aggregate Site Stats
      const siteId = tx.outletId
      if (!siteStatsMap.has(siteId)) {
        siteStatsMap.set(siteId, {
          site: tx.outletName,
          transactions: 0,
          volume: 0,
          value: 0
        })
      }
      const siteStat = siteStatsMap.get(siteId)
      siteStat.transactions++
      siteStat.volume += txVolumeLiter
      siteStat.value += txValueRupiah

      // Aggregate Type Stats
      const type = tx.voucherType
      if (!typeStatsMap.has(type)) {
        typeStatsMap.set(type, {
          type: type,
          count: 0,
          value: 0
        })
      }
      const typeStat = typeStatsMap.get(type)
      typeStat.count++
      typeStat.value += txValueRupiah
    }

    // Format Voucher Type Stats with percentage
    const voucherTypeStats = Array.from(typeStatsMap.values()).map(stat => ({
      ...stat,
      percentage: totalTransactions > 0 ? Math.round((stat.count / totalTransactions) * 100) : 0
    }))

    // Format Response
    const stats = {
      totalTransactions,
      totalVolume,
      totalValue,
      averagePerTransaction: totalTransactions > 0 ? Math.round(totalValue / totalTransactions) : 0,
      growth: 0, // Placeholder
    }

    return successResponse({
      stats,
      siteStats: Array.from(siteStatsMap.values()),
      voucherTypeStats
    })
  } catch (err: any) {
    return errorResponse(err?.message || "Internal server error")
  }
}
