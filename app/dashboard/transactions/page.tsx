"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, []) // Load on mount

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (statusFilter) params.append("status", statusFilter)
      if (dateFrom) params.append("dateFrom", dateFrom)
      // For dateTo to include the whole day end
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59)
        params.append("dateTo", to.toISOString())
      }

      params.append("limit", "100") // Set high limit for exporting convenience (or handle pagination)

      const response = await fetch(`/api/transactions?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        // Format properties early for UI & Export safety
        const formatted = result.data.transactions.map((tx: any) => {
          let rupiahValue = "--"
          let literValue = "--"
          const val = parseFloat(tx.voucher?.value || "0")

          if (tx.voucher?.type === "CREDIT") {
            literValue = `${val} Liter`
            rupiahValue = formatCurrency(val * 10000) // Assumed estimate
          } else {
            rupiahValue = formatCurrency(val)
          }

          return {
            ...tx,
            literalAmount: literValue,
            rupiahAmount: rupiahValue,
            timeFormatted: formatDate(tx.createdAt),
          }
        })

        setTransactions(formatted)
      } else {
        setError(result.error || "Gagal mengambil data transaksi")
      }
    } catch (err: any) {
      setError("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    exportToPDF(
      "Laporan Riwayat Transaksi",
      transactions,
      [
        { header: "Kode", key: "voucher.code" },
        { header: "Outlet", key: "outlet.name" },
        { header: "Operator", key: "user.name" },
        { header: "Tipe", key: "voucher.type" },
        { header: "Liter", key: "literalAmount" },
        { header: "Nominal", key: "rupiahAmount" },
        { header: "Status", key: "status" },
        { header: "Waktu", key: "timeFormatted" },
      ],
      `Transaksi_SPBU_${new Date().getTime()}`
    )
  }

  const handleExportExcel = () => {
    exportToExcel(
      transactions,
      [
        { header: "Kode Voucher", key: "voucher.code" },
        { header: "Outlet Pelaksana", key: "outlet.name" },
        { header: "Operator Shift", key: "user.name" },
        { header: "Jenis Kuota", key: "voucher.type" },
        { header: "Volume Liter", key: "literalAmount" },
        { header: "Nilai Nominal (Estimasi Rp)", key: "rupiahAmount" },
        { header: "Status Transaksi", key: "status" },
        { header: "Waktu Validasi", key: "timeFormatted" },
      ],
      `Transaksi_SPBU_${new Date().getTime()}`
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, any> = {
      SUCCESS: { label: "Selesai", color: "bg-green-100 text-green-700", icon: CheckCircle },
      CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-700", icon: XCircle },
      DISPUTED: { label: "Dispute", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
    }
    const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700", icon: CheckCircle }
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600 mt-1">Semua transaksi voucher bahan bakar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF} disabled={loading || transactions.length === 0}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel} disabled={loading || transactions.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>Cari transaksi berdasarkan berbagai kriteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <Label htmlFor="search">Cari Kode</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="VOU-..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="SUCCESS">Selesai</option>
                <option value="DISPUTED">Dispute</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dateFrom">Dari</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Sampai</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={fetchTransactions} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              Terapkan Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
             <div className="flex items-center justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
               <span className="ml-2 text-gray-600">Memuat riwayat transaksi...</span>
             </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-red-500">{error}</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-gray-500">Tidak ada riwayat transaksi yang ditemukan.</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voucher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lokasi & Shift
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimasi Rp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu Validasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tx.voucher?.code || "-"}</div>
                          <div className="text-xs text-gray-500">{tx.voucher?.type || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tx.outlet?.name || "-"}</div>
                          <div className="text-xs text-gray-500">{tx.user?.name || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tx.literalAmount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tx.rupiahAmount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tx.timeFormatted}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(tx.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Menampilkan total {transactions.length} transaksi yg dimuat.
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
