"use client"

import { useState } from "react"
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
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react"

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Mock data - will be replaced with API calls
  const transactions = [
    {
      id: "1",
      voucherCode: "VOU-LX123456",
      voucherType: "RUPIAH",
      voucherValue: 100000,
      site: { name: "SPBU 34-12345", code: "34-12345" },
      operator: { name: "Ahmad Supriadi", email: "ahmad@spbu.co.id" },
      vehiclePlate: "B 1234 ABC",
      literAmount: 14.93,
      rupiahAmount: 100000,
      status: "COMPLETED",
      validatedAt: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      voucherCode: "VOU-LX123457",
      voucherType: "LITER",
      voucherValue: 10,
      site: { name: "SPBU 34-12346", code: "34-12346" },
      operator: { name: "Budi Santoso", email: "budi@spbu.co.id" },
      vehiclePlate: "B 5678 DEF",
      literAmount: 10,
      rupiahAmount: 67000,
      status: "COMPLETED",
      validatedAt: "2024-01-15T11:15:00Z",
      createdAt: "2024-01-15T11:15:00Z",
    },
    {
      id: "3",
      voucherCode: "VOU-LX123458",
      voucherType: "RUPIAH",
      voucherValue: 50000,
      site: { name: "SPBU 34-12345", code: "34-12345" },
      operator: { name: "Sari Wulandari", email: "sari@spbu.co.id" },
      vehiclePlate: "B 9012 GHI",
      literAmount: 7.46,
      rupiahAmount: 50000,
      status: "DISPUTED",
      validatedAt: "2024-01-15T12:00:00Z",
      createdAt: "2024-01-15T12:00:00Z",
    },
    {
      id: "4",
      voucherCode: "VOU-LX123459",
      voucherType: "FLAT",
      voucherValue: 6700,
      site: { name: "SPBU 34-12347", code: "34-12347" },
      operator: { name: "Dedi Kurniawan", email: "dedi@spbu.co.id" },
      vehiclePlate: "B 3456 JKL",
      literAmount: 15,
      rupiahAmount: 100500,
      status: "CANCELLED",
      validatedAt: "2024-01-15T12:30:00Z",
      createdAt: "2024-01-15T12:30:00Z",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { label: "Selesai", color: "bg-green-100 text-green-700", icon: CheckCircle },
      CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-700", icon: XCircle },
      DISPUTED: { label: "Dispute", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.COMPLETED
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600 mt-1">Semua transaksi voucher bahan bakar</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
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
              <Label htmlFor="search">Cari Transaksi</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Kode voucher, plat nomor..."
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
                <option value="COMPLETED">Selesai</option>
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
            <Button>
              <Filter className="h-4 w-4 mr-2" />
              Terapkan Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site & Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kendaraan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nilai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
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
                      <div className="text-sm font-medium text-gray-900">{tx.voucherCode}</div>
                      <div className="text-xs text-gray-500">{tx.voucherType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tx.site.name}</div>
                      <div className="text-xs text-gray-500">{tx.operator.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tx.vehiclePlate}</div>
                      <div className="text-xs text-gray-500">{tx.literAmount} Liter</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(tx.rupiahAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(tx.validatedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Menampilkan 1-4 dari 456 transaksi
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
