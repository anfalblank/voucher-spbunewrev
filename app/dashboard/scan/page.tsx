"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Clock,
  Fuel,
  RefreshCw,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { signOut } from "@/lib/auth-client"

type ScanState = "idle" | "scanning" | "found" | "validating" | "success" | "error"

interface ShiftData {
  id: string
  operatorId: string
  operatorName: string
  outletId: string
  outletName: string
  startTime: string
  endTime?: string
  totalTransactions: number
  totalAmount: number
  status: "ACTIVE" | "CLOSED"
}

interface ScanTransaction {
  id: string
  voucherCode: string
  voucherType: string
  voucherValue: string
  scannedAt: string
}

export default function ScanPage() {
  const { data: session } = useSession()
  const user = session?.user as any

  const [scanState, setScanState] = useState<ScanState>("idle")
  const [voucherCode, setVoucherCode] = useState("")
  const [cameraActive, setCameraActive] = useState(false)
  const [manualInput, setManualInput] = useState(false)

  // Shift data
  const [shiftData, setShiftData] = useState<ShiftData | null>(null)
  const [shiftTransactions, setShiftTransactions] = useState<ScanTransaction[]>([])
  const [loadingShift, setLoadingShift] = useState(true)

  useEffect(() => {
    initializeShift()
  }, [])

  const initializeShift = () => {
    // Create active shift for operator
    const newShift: ShiftData = {
      id: `shift-${Date.now()}`,
      operatorId: user?.id || "1",
      operatorName: user?.name || "Operator",
      outletId: user?.outletId || "outlet-1",
      outletName: user?.outlet?.name || "SPBU 34-12345",
      startTime: new Date().toISOString(),
      totalTransactions: 0,
      totalAmount: 0,
      status: "ACTIVE",
    }
    setShiftData(newShift)
    setLoadingShift(false)
  }

  const startCamera = () => {
    setCameraActive(true)
    setManualInput(false)
    setScanState("scanning")
    // TODO: Implement actual camera access
  }

  const stopCamera = () => {
    setCameraActive(false)
    setScanState("idle")
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!voucherCode.trim()) return

    setScanState("validating")

    try {
      // Call API to validate voucher
      const response = await fetch("/api/vouchers/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucherCode,
          operatorId: user?.id,
          outletId: user?.outletId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const voucherData = result.data.voucher

        // Add to shift transactions
        const newTransaction: ScanTransaction = {
          id: `trx-${Date.now()}`,
          voucherCode: voucherData.code,
          voucherType: voucherData.type,
          voucherValue: voucherData.value,
          scannedAt: new Date().toISOString(),
        }

        setShiftTransactions((prev) => [newTransaction, ...prev])

        // Update shift totals
        const value = parseFloat(voucherData.value) || 0
        setShiftData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            totalTransactions: prev.totalTransactions + 1,
            totalAmount: prev.totalAmount + value,
          }
        })

        setScanState("success")
        setVoucherCode("")

        // Auto reset after 3 seconds
        setTimeout(() => {
          setScanState(cameraActive ? "scanning" : "idle")
        }, 3000)
      } else {
        setScanState("error")
      }
    } catch (err: any) {
      console.error("Scan error:", err)
      setScanState("error")
    }
  }

  const resetScan = () => {
    setVoucherCode("")
    setScanState(cameraActive ? "scanning" : "idle")
  }

  const handleEndShift = async () => {
    if (!confirm("Apakah Anda yakin ingin menyelesaikan shift ini?\n\n" +
      `Total Transaksi: ${shiftData?.totalTransactions}\n` +
      `Total: Rp ${(shiftData?.totalAmount || 0).toLocaleString("id-ID")}`)) {
      return
    }

    try {
      // Show shift summary
      const summary = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETTLEMENT SHIFT - ${shiftData?.outletName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Operator: ${shiftData?.operatorName}
Outlet: ${shiftData?.outletName}

Periode: ${new Date(shiftData?.startTime || "").toLocaleString("id-ID")}
s/d ${new Date().toLocaleString("id-ID")}

Total Transaksi: ${shiftData?.totalTransactions} voucher
Total Nilai: Rp ${(shiftData?.totalAmount || 0).toLocaleString("id-ID")}

Rincian Tipe:
${Object.entries(
  shiftTransactions.reduce((acc, trx) => {
    acc[trx.voucherType] = (acc[trx.voucherType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
).map(([type, count]) => `- ${type}: ${count}`).join("\n")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim()

      alert(summary)

      setShiftData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          status: "CLOSED",
          endTime: new Date().toISOString(),
        }
      })
    } catch (err) {
      console.error("Failed to end shift:", err)
    }
  }

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login"
        },
      },
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loadingShift) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Memuat data shift...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scan & Settlement</h1>
          <p className="text-gray-600 mt-1">
            {shiftData?.outletName} • {shiftData?.operatorName}
          </p>
        </div>
        <div className="flex gap-2">
          {shiftData?.status === "ACTIVE" && (
            <Button variant="destructive" onClick={handleEndShift}>
              <Clock className="h-4 w-4 mr-2" />
              Tutup Shift
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Scan Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Scan QR Voucher
              </CardTitle>
              <CardDescription>
                {shiftData?.status === "CLOSED"
                  ? "Shift sudah ditutup. Hubungi supervisor untuk membuka shift baru."
                  : "Scan kode QR voucher untuk validasi atau gunakan input manual"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scanState === "idle" && !manualInput && (
                <div className="space-y-3">
                  <Button
                    onClick={startCamera}
                    className="w-full"
                    size="lg"
                    disabled={shiftData?.status === "CLOSED"}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Mulai Scan QR
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">atau</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setManualInput(true)}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={shiftData?.status === "CLOSED"}
                  >
                    <QrCode className="h-5 w-5 mr-2" />
                    Input Manual
                  </Button>
                </div>
              )}

              {manualInput && scanState === "idle" && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="voucherCode">Kode Voucher</Label>
                    <Input
                      id="voucherCode"
                      type="text"
                      placeholder="Contoh: VOU-LX123456"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      autoFocus
                      className="uppercase"
                      disabled={shiftData?.status === "CLOSED"}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={shiftData?.status === "CLOSED"}>
                      Scan Voucher
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setManualInput(false)
                        setVoucherCode("")
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              )}

              {scanState === "scanning" && (
                <div className="space-y-4">
                  <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">Kamera aktif</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-4 border-white rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={stopCamera} variant="outline" className="flex-1">
                      <CameraOff className="h-4 w-4 mr-2" />
                      Stop Kamera
                    </Button>
                    <Button onClick={() => setManualInput(true)} variant="outline" className="flex-1">
                      Input Manual
                    </Button>
                  </div>
                </div>
              )}

              {scanState === "validating" && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Memvalidasi voucher...</span>
                </div>
              )}

              {scanState === "success" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Voucher Berhasil Validasi!</p>
                      <p className="text-sm text-green-700 mt-1">
                        {shiftTransactions[0]?.voucherCode || voucherCode}
                      </p>
                      <p className="text-sm text-green-700">
                        {shiftTransactions[0]?.voucherType === "FIXED"
                          ? formatCurrency(parseFloat(shiftTransactions[0]?.voucherValue || "0"))
                          : shiftTransactions[0]?.voucherType === "CREDIT"
                          ? `${shiftTransactions[0]?.voucherValue} Liter`
                          : `${shiftTransactions[0]?.voucherValue}%`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {scanState === "error" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Voucher Tidak Valid</p>
                      <p className="text-sm text-red-700 mt-1">
                        Voucher tidak ditemukan, sudah digunakan, atau sudah expired.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(scanState === "success" || scanState === "error") && (
                <Button onClick={resetScan} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Scan Lagi
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Shift Ini</CardTitle>
              <CardDescription>
                {shiftTransactions.length} transaksi dalam shift ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {shiftTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada transaksi</p>
              ) : (
                <div className="space-y-3">
                  {shiftTransactions.map((trx) => (
                    <div
                      key={trx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{trx.voucherCode}</p>
                          <p className="text-sm text-gray-500">
                            {trx.voucherType} • {new Date(trx.scannedAt).toLocaleTimeString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {trx.voucherType === "FIXED"
                            ? formatCurrency(parseFloat(trx.voucherValue))
                            : trx.voucherType === "CREDIT"
                            ? `${trx.voucherValue} Liter`
                            : `${trx.voucherValue}%`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shift Settlement Sidebar */}
        <div className="space-y-6">
          {/* Shift Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status Shift
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    shiftData?.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {shiftData?.status === "ACTIVE" ? "Aktif" : "Ditutup"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mulai</span>
                <span className="text-sm font-medium">
                  {shiftData?.startTime
                    ? new Date(shiftData.startTime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </div>

              {shiftData?.endTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Selesai</span>
                  <span className="text-sm font-medium">
                    {new Date(shiftData.endTime).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              <hr />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transaksi</span>
                  <span className="text-lg font-bold text-gray-900">
                    {shiftData?.totalTransactions || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Nilai</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(shiftData?.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {shiftData?.status === "ACTIVE" && (
                <Button
                  onClick={handleEndShift}
                  className="w-full mt-4"
                  variant="destructive"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Tutup Shift
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Info Shift
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Operator</p>
                <p className="text-sm font-medium">{shiftData?.operatorName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Outlet</p>
                <p className="text-sm font-medium">{shiftData?.outletName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-sm font-medium">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Voucher Type Summary */}
          {shiftTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Tipe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(() => {
                  const summary = shiftTransactions.reduce(
                    (acc, trx) => {
                      acc[trx.voucherType] = (acc[trx.voucherType] || 0) + 1
                      return acc
                    },
                    {} as Record<string, number>
                  )

                  return Object.entries(summary).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
