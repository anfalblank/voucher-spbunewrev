"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [outlets, setOutlets] = useState<any[]>([])
  const [loadingOutlets, setLoadingOutlets] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "OPERATOR",
    outletId: "",
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
      toast.error("Gagal mengambil daftar outlet.")
    } finally {
      setLoadingOutlets(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validations
    if (formData.password.length < 6) {
      toast.error("Password minimal harus 6 karakter")
      return
    }
    if ((formData.role === "OPERATOR" || formData.role === "OWNER") && !formData.outletId) {
      toast.error("Silakan pilih outlet tempat pengguna ditugaskan")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = { ...formData }
      // ADMIN doesn't necessarily need an outlet
      if (formData.role === "ADMIN") {
        payload.outletId = ""
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Berhasil menambahkan akun ${formData.name}!`)
        router.push("/dashboard/users")
        router.refresh()
      } else {
        toast.error(result.error || "Gagal membuat pengguna")
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan koneksi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Tambah Pengguna
          </h1>
          <p className="text-gray-600 mt-1">Buat akun untuk Admin, Owner, maupun Operator baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Masukkan detil akun otentikasi untuk login ke sistem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Contoh: Budi Susanto"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="budi@spbu.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Kata Sandi Akses <span className="text-red-500">*</span></Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peran & Penempatan</CardTitle>
              <CardDescription>Tugas dan Hak Akses Pengguna</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="role">Role (Akses Level) <span className="text-red-500">*</span></Label>
                  <select
                    id="role"
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value })
                    }}
                    required
                  >
                    <option value="OPERATOR">OPERATOR (Hanya Scan Voucher)</option>
                    <option value="OWNER">OWNER (Lihat Laporan Khusus Cabang)</option>
                    <option value="ADMIN">ADMIN (Akses Penuh Pusat)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="outletId">Cabang Outlet Penugasan</Label>
                  {loadingOutlets ? (
                    <div className="flex h-10 w-full rounded-md border border-input items-center px-3 bg-gray-50 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Memuat data outlet...
                    </div>
                  ) : (
                    <select
                      id="outletId"
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      value={formData.outletId}
                      onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
                      required={formData.role !== "ADMIN"}
                      disabled={formData.role === "ADMIN"}
                    >
                      <option value="">Pilih Cabang Tempat Bekerja</option>
                      {outlets.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                          {outlet.name} - {outlet.code}
                        </option>
                      ))}
                    </select>
                  )}
                  {formData.role === "ADMIN" && (
                    <p className="text-xs text-blue-600 mt-1">Role ADMIN memiliki akses ke semua cabang, penempatan dihiraukan.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2 pb-12">
            <Link href="/dashboard/users">
              <Button type="button" variant="outline" size="lg">
                Batal
              </Button>
            </Link>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Pengguna
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
