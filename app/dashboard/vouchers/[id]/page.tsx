"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  QrCode,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import QRCode from "qrcode"
import jsPDF from "jspdf"

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
  const [qrDataUrl, setQrDataUrl] = useState<string>("")

  useEffect(() => {
    if (params.id) {
      fetchVoucher(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (voucher?.id) {
      // Generate real QR code image representation of voucher ID or Code
      // Depends on backend verification architecture, id is safer.
      QRCode.toDataURL(voucher.id, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      }).then((url: string) => {
        setQrDataUrl(url)
      }).catch((err: any) => {
        console.error("Failed to generate QR", err)
      })
    }
  }, [voucher])

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
        toast.error("Gagal memuat detail voucher")
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
      toast.error("Terjadi error pada koneksi")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPNG = () => {
    if (!qrDataUrl || !voucher) return
    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = `Voucher-${voucher.code}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Gambar QR berhasil diunduh")
  }

  const handlePrintPDF = () => {
    if (!qrDataUrl || !voucher) return
    try {
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(22)
      doc.setTextColor(41, 128, 185)
      doc.text("SPBU VOUCHER PASS", 105, 30, { align: "center" })

      // Voucher Code
      doc.setFontSize(14)
      doc.setTextColor(100, 100, 100)
      doc.text(`KODE: ${voucher.code}`, 105, 42, { align: "center" })

      // QR Code Image
      doc.addImage(qrDataUrl, "PNG", 65, 50, 80, 80)

      // Value & Logic
      let nominalText = ""
      if (voucher.type === "FIXED") nominalText = formatCurrency(voucher.value)
      else if (voucher.type === "CREDIT") nominalText = `${voucher.value} Liter`
      else nominalText = `${voucher.value}% Diskon`

      doc.setFontSize(26)
      doc.setTextColor(0, 0, 0)
      doc.text(nominalText, 105, 145, { align: "center" })

      // Meta Info
      doc.setFontSize(12)
      doc.setTextColor(80, 80, 80)
      doc.text(`Outlet: ${voucher.outlet?.name || "Semua Cabang"}`, 105, 160, { align: "center" })
      doc.text(`Masa Berlaku: ${formatDate(voucher.expiryDate)}`, 105, 168, { align: "center" })
      doc.text(`Status: ${voucher.status}`, 105, 176, { align: "center" })

      // Footer
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text("Tunjukkan kode QR ini ke petugas saat melakukan transaksi.", 105, 200, { align: "center" })

      doc.save(`Voucher-${voucher.code}.pdf`)
      toast.success("Voucher PDF berhasil diekspor")
    } catch (err) {
      console.error(err)
      toast.error("Gagal mambuat dokumen PDF")
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
          <Card className="lg:row-span-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-2">
              <CardTitle>QR Code Validasi</CardTitle>
              <CardDescription>Scan menggunakan kamera web/scanner</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-4">
              <div className="bg-white p-2 rounded-xl border-4 border-gray-100 shadow-sm relative">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 object-contain" />
                ) : (
                  <div className="w-56 h-56 flex bg-gray-50 items-center justify-center rounded-lg">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold tracking-widest text-gray-900 bg-gray-100 px-4 py-1 rounded inline-block">{voucher.code}</p>
                <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wide">Kode Referensi</p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button variant="outline" className="w-full flex" onClick={handleDownloadPNG}>
                  <Download className="h-4 w-4 mr-2" />
                  Simpan PNG
                </Button>
                <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrintPDF}>
                  <Printer className="h-4 w-4 mr-2" />
                  Unduh PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voucher Details */}
        <Card className={showQrCode ? "lg:col-span-2" : "col-span-3"}>
          <CardHeader>
            <CardTitle>Informasi Voucher</CardTitle>
            <CardDescription>Detail lengkap voucher bahan bakar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Status Live</p>
                <div>{getStatusBadge(voucher.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tipe Kuota</p>
                <p className="text-xl font-bold text-gray-900 px-3 py-1 bg-gray-100 rounded inline-block">{voucher.type}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 pb-4 border-b">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Nominal Efektif</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">
                  {voucher.type === "FIXED"
                    ? formatCurrency(voucher.value)
                    : voucher.type === "CREDIT"
                    ? `${voucher.value} Liter`
                    : `${voucher.value}%`}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Batas Masa Berlaku</p>
                <p className="text-lg font-medium text-red-600 mt-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {formatDate(voucher.expiryDate)}
                </p>
              </div>
            </div>

            <div className="pb-4 border-b">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Ditugaskan pada Outlet</p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-base font-bold text-gray-900">{voucher.outlet?.name || "Global (Seluruh Cabang)"}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">{voucher.outlet?.code || "GLOBAL-ALL"}</p>
                <p className="text-sm text-gray-500 mt-1">{voucher.outlet?.address || "Berlaku di semua stasiun SPBU terafiliasi"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Penerbit Voucher</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  {voucher.creator?.name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{voucher.creator?.name || "System Administrator"}</p>
                  <p className="text-xs text-gray-500">{voucher.creator?.email || "system@spbu.co.id"}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-xs text-gray-400 mt-6 pt-4 border-t border-dashed">
              <div>
                <p>Waktu Pembuatan: {new Date(voucher.createdAt).toLocaleString("id-ID")}</p>
              </div>
              <div className="md:text-right">
                <p>Validasi Terakhir: {new Date(voucher.updatedAt).toLocaleString("id-ID")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
