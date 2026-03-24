"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface Voucher {
  id: string
  code: string
  type: string
  value: string
  status: string
  expiryDate: string
  outletId: string
  createdBy: string
  qrCodeUrl: string
  createdAt: string
  outlet: {
    id: string
    name: string
    code: string
  }
  creator: {
    id: string
    name: string
    email: string
  }
}

export default function VouchersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch vouchers from API
  useEffect(() => {
    fetchVouchers()
  }, [searchQuery, statusFilter])

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (statusFilter) params.append("status", statusFilter)

      const response = await fetch(`/api/vouchers?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setVouchers(result.data.vouchers)
      } else {
        setError(result.error || "Gagal mengambil data voucher")
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700", icon: CheckCircle },
      USED: { label: "Digunakan", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
      EXPIRED: { label: "Expired", color: "bg-red-100 text-red-700", icon: XCircle },
      CANCELLED: { label: "Dibatalkan", color: "bg-gray-100 text-gray-700", icon: XCircle },
    }
    const config = statusConfig[status] || statusConfig.ACTIVE
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(value))
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Voucher</h1>
          <p className="text-gray-600 mt-1">Kelola semua voucher bahan bakar</p>
        </div>
        <Link href="/dashboard/vouchers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Voucher
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>Cari voucher berdasarkan kode, status, atau outlet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Cari Voucher</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Masukkan kode voucher..."
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
                <option value="ACTIVE">Aktif</option>
                <option value="USED">Digunakan</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="flex-1" onClick={fetchVouchers}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Memuat data...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="ml-2 text-red-600">{error}</span>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-500">Tidak ada voucher ditemukan</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kode Voucher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe & Nilai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outlet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Masa Berlaku
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vouchers.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{voucher.code}</div>
                          <div className="text-xs text-gray-500">Dibuat: {formatDate(voucher.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{voucher.type}</div>
                          <div className="text-xs text-gray-500">
                            {voucher.type === "FIXED"
                              ? formatCurrency(voucher.value)
                              : voucher.type === "CREDIT"
                              ? `${voucher.value} Liter`
                              : `${voucher.value}% Diskon`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{voucher.outlet?.name || "-"}</div>
                          <div className="text-xs text-gray-500">{voucher.outlet?.code || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-900">
                            Hingga: {formatDate(voucher.expiryDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(voucher.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link href={`/dashboard/vouchers/${voucher.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Menampilkan {vouchers.length} voucher
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
