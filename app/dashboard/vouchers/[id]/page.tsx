"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  QrCode,
  Download,
  Printer,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
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
  metadata: string | null
  createdAt: string
  updatedAt: string
  outlet: {
    id: string
    name: string
    code: string
    address: string
    phone: string
    status: string
  }
  creator: {
    id: string
    name: string
    email: string
  }
}

export default function VoucherDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [voucher, setVoucher] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showQrCode, setShowQrCode] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchVoucher(params.id as string)
    }
  }, [params.id])

  const fetchVoucher = async (id: string) => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/vouchers/${id}`)
      const result = await response.json()

      if (result.success) {
        setVoucher(result.data)
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Memuat data...</span>
      </div>
    )
  }

  if (error || !voucher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-600">{error || "Voucher tidak ditemukan"}</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vouchers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Voucher</h1>
            <p className="text-gray-600 mt-1">{voucher.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowQrCode(!showQrCode)}>
            <QrCode className="h-4 w-4 mr-2" />
            {showQrCode ? "Sembunyikan QR" : "Tampilkan QR"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* QR Code Card */}
        {showQrCode && (
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle>QR Code Voucher</CardTitle>
              <CardDescription>Scan untuk validasi voucher</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {/* Placeholder QR Code */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-gray-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{voucher.code}</p>
                <p className="text-sm text-gray-500 mt-1">Kode Voucher</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-1" />
                  PNG
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Printer className="h-4 w-4 mr-1" />
                  Cetak
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voucher Details */}
        <Card className={showQrCode ? "" : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle>Informasi Voucher</CardTitle>
            <CardDescription>Detail lengkap voucher bahan bakar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="mt-1">{getStatusBadge(voucher.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tipe Voucher</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{voucher.type}</p>
              </div>
            </div>

            <hr />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Nilai Voucher</p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {voucher.type === "FIXED"
                    ? formatCurrency(voucher.value)
                    : voucher.type === "CREDIT"
                    ? `${voucher.value} Liter`
                    : `${voucher.value}%`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Masa Berlaku</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(voucher.expiryDate)}
                </p>
              </div>
            </div>

            <hr />

            <div>
              <p className="text-sm text-gray-600">Outlet SPBU</p>
              <div className="mt-1">
                <p className="text-sm font-medium text-gray-900">{voucher.outlet?.name || "-"}</p>
                <p className="text-xs text-gray-500">{voucher.outlet?.code || "-"}</p>
                <p className="text-xs text-gray-500 mt-1">{voucher.outlet?.address || "-"}</p>
              </div>
            </div>

            <hr />

            <div>
              <p className="text-sm text-gray-600">Dibuat Oleh</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{voucher.creator?.name || "-"}</p>
              <p className="text-xs text-gray-500">{voucher.creator?.email || "-"}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-xs text-gray-500">
              <div>
                <p>Dibuat: {formatDate(voucher.createdAt)}</p>
              </div>
              <div>
                <p>Diupdate: {formatDate(voucher.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
