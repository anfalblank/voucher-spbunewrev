"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, QrCode, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewVoucherPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [outlets, setOutlets] = useState<any[]>([])
  const [loadingOutlets, setLoadingOutlets] = useState(true)
  const [formData, setFormData] = useState({
    type: "FIXED",
    value: "",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    outletId: "",
    quantity: "1",
  })

  // Fetch outlets on mount
  useEffect(() => {
    fetchOutlets()
  }, [])

  const fetchOutlets = async () => {
    try {
      setLoadingOutlets(true)
      const response = await fetch("/api/outlets")
      const result = await response.json()

      if (result.success) {
        setOutlets(result.data.outlets || [])
      }
    } catch (err) {
      console.error("Failed to fetch outlets:", err)
    } finally {
      setLoadingOutlets(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const payload = {
        type: formData.type,
        value: formData.value,
        expiryDate: formData.expiryDate,
        outletId: formData.outletId,
        createdBy: "admin", // TODO: Get from session
        quantity: parseInt(formData.quantity),
      }

      const response = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        router.push("/dashboard/vouchers")
        router.refresh()
      } else {
        setError(result.error || "Gagal membuat voucher")
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: string) => {
    if (!amount) return "Rp 0"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vouchers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buat Voucher Baru</h1>
          <p className="text-gray-600 mt-1">Generate voucher bahan bakar untuk outlet SPBU</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voucher Type */}
            <Card>
              <CardHeader>
                <CardTitle>Tipe Voucher</CardTitle>
                <CardDescription>Pilih tipe voucher yang akan dibuat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <label
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.type === "FIXED"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="type"
                        value="FIXED"
                        checked={formData.type === "FIXED"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Voucher Fixed</p>
                        <p className="text-sm text-gray-500">Nilai tetap dalam rupiah (mis: Rp 100.000)</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.type === "CREDIT"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="type"
                        value="CREDIT"
                        checked={formData.type === "CREDIT"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Voucher Credit (Liter)</p>
                        <p className="text-sm text-gray-500">Nilai tetap dalam liter (mis: 10 liter)</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.type === "DISCOUNT"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="type"
                        value="DISCOUNT"
                        checked={formData.type === "DISCOUNT"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Voucher Discount</p>
                        <p className="text-sm text-gray-500">Diskon persentase (mis: 20%)</p>
                      </div>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Voucher Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Voucher</CardTitle>
                <CardDescription>Isi nilai dan masa berlaku voucher</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="value">
                      Nilai Voucher {formData.type === "FIXED" ? "(Rp)" : formData.type === "CREDIT" ? "(Liter)" : "(%)"}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder={formData.type === "FIXED" ? "100000" : formData.type === "CREDIT" ? "10" : "20"}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiryDate">Masa Berlaku Sampai</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="quantity">Jumlah Voucher</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Maksimal 100 voucher sekaligus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outlet Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Outlet</CardTitle>
                <CardDescription>Pilih outlet SPBU tempat voucher berlaku</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOutlets ? (
                  <p className="text-sm text-gray-500">Memuat outlet...</p>
                ) : (
                  <div>
                    <Label htmlFor="outletId">Outlet SPBU</Label>
                    <select
                      id="outletId"
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.outletId}
                      onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
                      required
                    >
                      <option value="">Pilih Outlet</option>
                      {outlets.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                          {outlet.name} - {outlet.code}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipe Voucher</span>
                    <span className="font-medium">{formData.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nilai</span>
                    <span className="font-medium">
                      {formData.type === "FIXED"
                        ? formatCurrency(formData.value)
                        : formData.type === "CREDIT"
                        ? `${formData.value} Liter`
                        : `${formData.value}%`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jumlah</span>
                    <span className="font-medium">{formData.quantity} voucher</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Voucher</span>
                    <span className="text-blue-600">{formData.quantity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Generate Voucher
                  </>
                )}
              </Button>
              <Link href="/dashboard/vouchers">
                <Button type="button" variant="outline" className="w-full">
                  Batal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
