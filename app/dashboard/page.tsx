"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ticket, CheckCircle, Clock, AlertCircle, Users, MapPin, TrendingUp, TrendingDown, Loader2, Calendar, Download, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as any

  const [stats, setStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    usedVouchers: 0,
    expiredVouchers: 0,
    totalOutlets: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recentVouchers, setRecentVouchers] = useState<any[]>([])

  // Filter states
  const [periodFilter, setPeriodFilter] = useState("all") // all, today, week, month
  const [outletFilter, setOutletFilter] = useState("") // outlet ID
  const [statusFilter, setStatusFilter] = useState("") // status filter
  const [outlets, setOutlets] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
    fetchOutlets()
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [periodFilter, outletFilter, statusFilter])

  const fetchOutlets = async () => {
    try {
      const response = await fetch("/api/outlets")
      const result = await response.json()
      if (result.success) {
        setOutlets(result.data.outlets || [])
      }
    } catch (err) {
      console.error("Failed to fetch outlets:", err)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Build query params for filtering
      const params = new URLSearchParams()
      if (statusFilter) params.append("status", statusFilter)
      if (periodFilter !== "all") {
        const now = new Date()
        if (periodFilter === "today") {
          params.append("createdAfter", new Date(now.setHours(0, 0, 0, 0)).toISOString())
        } else if (periodFilter === "week") {
          params.append("createdAfter", new Date(now.setDate(now.getDate() - 7)).toISOString())
        } else if (periodFilter === "month") {
          params.append("createdAfter", new Date(now.setMonth(now.getMonth() - 1)).toISOString())
        }
      }

      // Fetch vouchers with filters
      const vouchersRes = await fetch(`/api/vouchers?${params.toString()}`)
      const vouchersResult = await vouchersRes.json()

      if (vouchersResult.success) {
        const vouchers = vouchersResult.data.vouchers
        setRecentVouchers(vouchers.slice(0, 5))

        const active = vouchers.filter((v: any) => v.status === "ACTIVE").length
        const used = vouchers.filter((v: any) => v.status === "USED").length
        const expired = vouchers.filter((v: any) => v.status === "EXPIRED").length

        setStats({
          totalVouchers: vouchers.length,
          activeVouchers: active,
          usedVouchers: used,
          expiredVouchers: expired,
          totalOutlets: 0,
          totalUsers: 0,
        })
      }

      // Fetch outlets and users
      const testRes = await fetch("/api/test")
      const testResult = await testRes.json()

      if (testResult.success) {
        setStats((prev) => ({
          ...prev,
          totalOutlets: testResult.data.outlets,
          totalUsers: testResult.data.users,
        }))
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const isAdmin = user?.role === "ADMIN"
  const isOwner = user?.role === "OWNER"

  const statsData = isAdmin
    ? [
        { title: "Total Voucher", value: stats.totalVouchers.toString(), icon: Ticket, description: `Aktif: ${stats.activeVouchers}` },
        { title: "Voucher Digunakan", value: stats.usedVouchers.toString(), icon: CheckCircle },
        { title: "Voucher Expired", value: stats.expiredVouchers.toString(), icon: AlertCircle },
        { title: "Outlet Aktif", value: stats.totalOutlets.toString(), icon: MapPin },
        { title: "Total User", value: stats.totalUsers.toString(), icon: Users },
      ]
    : [
        { title: "Total Voucher", value: stats.totalVouchers.toString(), icon: Ticket, description: `Aktif: ${stats.activeVouchers}` },
        { title: "Voucher Digunakan", value: stats.usedVouchers.toString(), icon: CheckCircle },
        { title: "Voucher Expired", value: stats.expiredVouchers.toString(), icon: AlertCircle },
      ]

  const getVoucherStatusChange = () => {
    // Simulate trend data (in real app, calculate from historical data)
    const total = stats.totalVouchers
    if (total > 15) return { trend: "up" as const, value: 12 }
    if (total < 10) return { trend: "down" as const, value: 5 }
    return { trend: "up" as const, value: 8 }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Selamat Datang, {session?.user?.name || "User"}!
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin || isOwner
              ? "Monitor semua aktivitas voucher dan outlet SPBU"
              : "Monitor aktivitas voucher di outlet Anda"}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Dashboard
          </CardTitle>
          <CardDescription>Atur tampilan data berdasarkan periode dan parameter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Periode Filter */}
            <div>
              <Label htmlFor="period">Periode</Label>
              <select
                id="period"
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
              </select>
            </div>

            {/* Outlet Filter */}
            {(isAdmin || isOwner) && (
              <div>
                <Label htmlFor="outlet">Outlet</Label>
                <select
                  id="outlet"
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={outletFilter}
                  onChange={(e) => setOutletFilter(e.target.value)}
                >
                  <option value="">Semua Outlet</option>
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <Label htmlFor="status">Status Voucher</Label>
              <select
                id="status"
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="USED">Digunakan</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPeriodFilter("all")
                  setOutletFilter("")
                  setStatusFilter("")
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statsData.map((stat) => (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                description={stat.description}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Voucher Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status Voucher</CardTitle>
                <CardDescription>Overview status voucher saat ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Active Vouchers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Aktif</span>
                      <span className="text-sm font-bold text-green-600">{stats.activeVouchers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalVouchers > 0 ? (stats.activeVouchers / stats.totalVouchers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Used Vouchers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Digunakan</span>
                      <span className="text-sm font-bold text-blue-600">{stats.usedVouchers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalVouchers > 0 ? (stats.usedVouchers / stats.totalVouchers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Expired Vouchers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Expired</span>
                      <span className="text-sm font-bold text-red-600">{stats.expiredVouchers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalVouchers > 0 ? (stats.expiredVouchers / stats.totalVouchers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voucher Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Tipe Voucher</CardTitle>
                <CardDescription>Breakdown berdasarkan tipe voucher</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const fixedCount = recentVouchers.filter((v: any) => v.type === "FIXED").length
                    const creditCount = recentVouchers.filter((v: any) => v.type === "CREDIT").length
                    const discountCount = recentVouchers.filter((v: any) => v.type === "DISCOUNT").length
                    const total = recentVouchers.length

                    return (
                      <>
                        {/* Fixed Type */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Fixed (Rupiah)</span>
                            <span className="text-sm font-bold text-purple-600">{fixedCount}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${total > 0 ? (fixedCount / total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Credit Type */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Credit (Liter)</span>
                            <span className="text-sm font-bold text-orange-600">{creditCount}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${total > 0 ? (creditCount / total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Discount Type */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Discount (%)</span>
                            <span className="text-sm font-bold text-teal-600">{discountCount}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full transition-all"
                              style={{ width: `${total > 0 ? (discountCount / total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Vouchers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Voucher Terbaru</CardTitle>
                  <CardDescription>5 voucher yang baru saja dibuat</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentVouchers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada voucher</p>
              ) : (
                <div className="space-y-4">
                  {recentVouchers.map((voucher) => (
                    <div key={voucher.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Ticket className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{voucher.code}</p>
                          <p className="text-sm text-gray-500">
                            {voucher.outlet?.name || "-"} • {voucher.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            voucher.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : voucher.status === "USED"
                              ? "bg-blue-100 text-blue-700"
                              : voucher.status === "EXPIRED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {voucher.status === "ACTIVE" ? "Aktif" : voucher.status === "USED" ? "Digunakan" : voucher.status === "EXPIRED" ? "Expired" : voucher.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {voucher.type === "FIXED"
                            ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(parseFloat(voucher.value))
                            : voucher.type === "CREDIT"
                            ? `${voucher.value} Liter`
                            : `${voucher.value}%`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
