"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Fuel,
  Ticket,
  BarChart3,
  Loader2,
  AlertCircle
} from "lucide-react"
import { exportMultiSheetExcel, exportMultiTablePDF } from "@/lib/export-utils"

export default function ReportsPage() {
  const [period, setPeriod] = useState("month")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    totalValue: 0,
    averagePerTransaction: 0,
    growth: 0,
  })

  const [siteStats, setSiteStats] = useState<any[]>([])
  const [voucherTypeStats, setVoucherTypeStats] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
  }, []) // Initial Load

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError("")

      // Simulasi loading network
      await new Promise(resolve => setTimeout(resolve, 800))

      // ---- DUMMY DATA INJECTION ----
      const dummyStats = {
        totalTransactions: 12450,
        totalVolume: 55430.5,
        totalValue: 554305000,
        averagePerTransaction: 44522.48,
        growth: 12.5,
      }

      const dummySiteStats = [
        { site: "SPBU 34-12345 (Sudirman)", transactions: 5200, volume: 22000, value: 220000000 },
        { site: "SPBU 34-12346 (Gatot Subroto)", transactions: 3100, volume: 15500, value: 155000000 },
        { site: "SPBU 34-12347 (Daan Mogot)", transactions: 4150, volume: 17930.5, value: 179305000 },
      ]

      const dummyVoucherTypeStats = [
        { type: "FIXED (Rupiah)", percentage: 45, value: 249437250, count: 5602 },
        { type: "CREDIT (Liter)", percentage: 35, value: 194006750, count: 4358 },
        { type: "DISCOUNT (%)", percentage: 20, value: 110861000, count: 2490 },
      ]

      setStats(dummyStats)
      setSiteStats(dummySiteStats)
      setVoucherTypeStats(dummyVoucherTypeStats)
      // -----------------------------

    } catch (err: any) {
      setError("Server error saat mengambil laporan.")
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    const siteData = siteStats.map(s => ({
      ...s,
      volumeFormatted: `${formatNumber(s.volume)} L`,
      valueFormatted: formatCurrency(s.value)
    }))

    const voucherData = voucherTypeStats.map(v => ({
      ...v,
      percentageFormatted: `${v.percentage}%`,
      valueFormatted: formatCurrency(v.value)
    }))

    const summaryData = [{
      totalTransactions: formatNumber(stats.totalTransactions),
      totalVolume: `${formatNumber(stats.totalVolume)} L`,
      totalValue: formatCurrency(stats.totalValue),
      averagePerTransaction: formatCurrency(stats.averagePerTransaction),
      growth: `${stats.growth}%`
    }]

    exportMultiSheetExcel([
      {
        sheetName: "Ringkasan Global",
        data: summaryData,
        columns: [
          { header: "Total Transaksi", key: "totalTransactions" },
          { header: "Total Volume", key: "totalVolume" },
          { header: "Total Nilai (Rp)", key: "totalValue" },
          { header: "Rataan Transaksi", key: "averagePerTransaction" },
          { header: "Pertumbuhan (%)", key: "growth" }
        ]
      },
      {
        sheetName: "Per Cabang SPBU",
        data: siteData,
        columns: [
          { header: "Nama Outlet", key: "site" },
          { header: "Total Transaksi", key: "transactions" },
          { header: "Volume (Liter)", key: "volumeFormatted" },
          { header: "Estimasi Nilai (Rp)", key: "valueFormatted" }
        ]
      },
      {
        sheetName: "Distribusi Tipe Voucher",
        data: voucherData,
        columns: [
          { header: "Tipe Voucher", key: "type" },
          { header: "Persentase", key: "percentageFormatted" },
          { header: "Jumlah Voucher", key: "count" },
          { header: "Estimasi Nilai (Rp)", key: "valueFormatted" }
        ]
      }
    ], `Laporan_Komprehensif_SPBU_${new Date().getTime()}`)
  }

  const handleExportPDF = () => {
    const siteData = siteStats.map(s => ({
      ...s,
      volumeFormatted: `${formatNumber(s.volume)} L`,
      valueFormatted: formatCurrency(s.value)
    }))

    const voucherData = voucherTypeStats.map(v => ({
      ...v,
      percentageFormatted: `${v.percentage}%`,
      valueFormatted: formatCurrency(v.value)
    }))

    const summaryData = [{
      totalTransactions: formatNumber(stats.totalTransactions),
      totalVolume: `${formatNumber(stats.totalVolume)} L`,
      totalValue: formatCurrency(stats.totalValue),
      averagePerTransaction: formatCurrency(stats.averagePerTransaction)
    }]

    exportMultiTablePDF(
      "Laporan Kinerja Komprehensif SPBU",
      [
        {
          title: "Ringkasan Global",
          data: summaryData,
          columns: [
            { header: "Total Trx", key: "totalTransactions" },
            { header: "Total Volume", key: "totalVolume" },
            { header: "Estimasi Nilai", key: "totalValue" },
            { header: "Rataan / Trx", key: "averagePerTransaction" }
          ]
        },
        {
          title: "Rincian Transaksi Per Cabang SPBU",
          data: siteData,
          columns: [
            { header: "Nama Outlet / Cabang", key: "site" },
            { header: "Total TX", key: "transactions" },
            { header: "Volume (L)", key: "volumeFormatted" },
            { header: "Nilai Tukar (Rp)", key: "valueFormatted" }
          ]
        },
        {
          title: "Statistik Penggunaan Tipe Voucher",
          data: voucherData,
          columns: [
            { header: "Jenis Voucher", key: "type" },
            { header: "Persentase", key: "percentageFormatted" },
            { header: "Kuantitas", key: "count" },
            { header: "Nilai Kumulatif", key: "valueFormatted" }
          ]
        }
      ],
      `Laporan_SPBU_${new Date().getTime()}`
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-600 mt-1">Analisis penggunaan voucher bahan bakar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF} disabled={loading || siteStats.length === 0}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel} disabled={loading || siteStats.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>Periode</Label>
              <select
                className="mt-1 flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="all">Semua Data</option>
                <option value="custom">Custom Tanggal</option>
              </select>
            </div>
            {period === "custom" && (
              <>
                <div>
                  <Label>Dari</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Sampai</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </>
            )}
            <Button onClick={fetchStats} disabled={loading}>
              <Calendar className="h-4 w-4 mr-2" />
              Terapkan
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <span className="ml-2 text-red-600">{error}</span>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-2" />
          <span>Memuat statistik...</span>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card 
              className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-1"
              onClick={() => document.getElementById("detail-table")?.scrollIntoView({ behavior: "smooth" })}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(stats.totalTransactions)}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-1"
              onClick={() => document.getElementById("detail-table")?.scrollIntoView({ behavior: "smooth" })}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Volume</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(stats.totalVolume)} L</p>
                  </div>
                  <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Fuel className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-1"
              onClick={() => document.getElementById("detail-table")?.scrollIntoView({ behavior: "smooth" })}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Nilai Estimasi</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-1"
              onClick={() => document.getElementById("detail-table")?.scrollIntoView({ behavior: "smooth" })}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rataan Per Transaksi</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.averagePerTransaction)}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Per-Site Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik per Site</CardTitle>
                <CardDescription>Perbandingan performa per lokasi SPBU</CardDescription>
              </CardHeader>
              <CardContent>
                {siteStats.length === 0 ? (
                  <p className="text-gray-500 py-4 text-center">Belum ada transaksi</p>
                ) : (
                  <div className="space-y-4">
                    {siteStats.map((site, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">{site.site}</span>
                          <span className="text-gray-600">{formatCurrency(site.value)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats.totalValue > 0 ? (site.value / stats.totalValue) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{site.transactions} transaksi</span>
                          <span>{site.volume} liter</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voucher Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Tipe Voucher</CardTitle>
                <CardDescription>Proporsi jenis tiket yang digunakan</CardDescription>
              </CardHeader>
              <CardContent>
                {voucherTypeStats.length === 0 ? (
                  <p className="text-gray-500 py-4 text-center">Belum ada data</p>
                ) : (
                  <div className="space-y-4">
                    {voucherTypeStats.map((item) => (
                      <div key={item.type} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">{item.type}</p>
                            <p className="text-sm font-bold text-gray-900">{item.percentage}%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(item.value)}</p>
                          <p className="text-xs text-gray-500">{item.count} voucher</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card id="detail-table" className="mt-6 scroll-mt-6">
            <CardHeader className="pb-3 border-b">
              <CardTitle>Detail Rekapitulasi per Outlet</CardTitle>
              <CardDescription>Rincian lengkap performa pemakaian kuota dan nilai transaksi di setiap cabang</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b">
                    <tr>
                      <th className="px-6 py-4">Nama Outlet / Cabang</th>
                      <th className="px-6 py-4">Total Tiket Tervalidasi</th>
                      <th className="px-6 py-4">Total Volume Liter</th>
                      <th className="px-6 py-4 text-right">Nilai Estimasi (IDR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteStats.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          Tidak ada transaksi pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      siteStats.map((site, index) => (
                        <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{site.site}</td>
                          <td className="px-6 py-4">{formatNumber(site.transactions)} Trx</td>
                          <td className="px-6 py-4">{formatNumber(site.volume)} L</td>
                          <td className="px-6 py-4 font-extrabold text-blue-600 text-right">{formatCurrency(site.value)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
