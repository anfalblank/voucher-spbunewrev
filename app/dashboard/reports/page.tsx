"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Fuel,
  Ticket,
  BarChart3,
} from "lucide-react"

export default function ReportsPage() {
  const [period, setPeriod] = useState("month")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Mock data - will be replaced with API calls
  const stats = {
    totalTransactions: 456,
    totalVolume: 4560,
    totalValue: 32045000,
    averagePerTransaction: 70285,
    growth: 15.5,
  }

  const siteStats = [
    { site: "SPBU 34-12345", transactions: 156, volume: 1560, value: 10920000 },
    { site: "SPBU 34-12346", transactions: 124, volume: 1240, value: 8680000 },
    { site: "SPBU 34-12347", transactions: 98, volume: 980, value: 6860000 },
    { site: "SPBU 34-12348", transactions: 78, volume: 780, value: 5583000 },
  ]

  const voucherTypeStats = [
    { type: "RUPIAH", count: 234, percentage: 51, value: 18520000 },
    { type: "LITER", count: 156, percentage: 34, value: 10452000 },
    { type: "FLAT", count: 66, percentage: 15, value: 3073000 },
  ]

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-600 mt-1">Analisis penggunaan voucher bahan bakar</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Laporan
        </Button>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>Periode</Label>
              <select
                className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="quarter">Quarter Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="custom">Custom</option>
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
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Generate Laporan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(stats.totalTransactions)}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.growth}% dari bulan lalu
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(stats.totalVolume)} L</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.growth}% dari bulan lalu
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Fuel className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Nilai</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.growth}% dari bulan lalu
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.averagePerTransaction)}</p>
                <p className="text-xs text-gray-500 mt-1">Per transaksi</p>
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
            <CardDescription>Perbandingan penggunaan voucher per lokasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {siteStats.map((site, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{site.site}</span>
                    <span className="text-gray-600">{formatCurrency(site.value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(site.value / stats.totalValue) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{site.transactions} transaksi</span>
                    <span>{site.volume} liter</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voucher Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Tipe Voucher</CardTitle>
            <CardDescription>Proporsi penggunaan berdasarkan tipe voucher</CardDescription>
          </CardHeader>
          <CardContent>
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
                        className="bg-blue-600 h-2 rounded-full"
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
          </CardContent>
        </Card>

        {/* Usage Trend Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Penggunaan</CardTitle>
            <CardDescription>Grafik penggunaan voucher dalam periode terpilih</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Grafik akan ditampilkan di sini</p>
                <p className="text-sm">(Menggunakan Recharts)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Laporan</CardTitle>
          <CardDescription>Unduh laporan dalam berbagai format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
