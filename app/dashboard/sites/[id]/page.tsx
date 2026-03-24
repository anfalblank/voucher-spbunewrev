"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  MapPin,
  Phone,
  Users,
  Ticket,
  Activity,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import Link from "next/link"

export default function SiteDetailPage() {
  // Mock data - will be replaced with API call
  const site = {
    id: "1",
    name: "SPBU 34-12345",
    code: "34-12345",
    address: "Jl. Jendral Sudirman No. 123, Jakarta Pusat",
    phone: "021-1234567",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    _count: {
      users: 5,
      vouchers: 156,
      transactions: 78,
    },
    users: [
      { id: "1", name: "Ahmad Supriadi", role: "SITE_ADMIN", email: "ahmad@spbu.co.id" },
      { id: "2", name: "Budi Santoso", role: "OPERATOR", email: "budi@spbu.co.id" },
      { id: "3", name: "Sari Wulandari", role: "OPERATOR", email: "sari@spbu.co.id" },
      { id: "4", name: "Dedi Kurniawan", role: "OPERATOR", email: "dedi@spbu.co.id" },
      { id: "5", name: "Rina Marlina", role: "OPERATOR", email: "rina@spbu.co.id" },
    ],
    recentTransactions: [
      { id: "1", code: "VOU-LX123", operator: "Budi Santoso", time: "2 menit lalu", amount: "Rp 100.000" },
      { id: "2", code: "VOU-LX124", operator: "Sari Wulandari", time: "10 menit lalu", amount: "10 Liter" },
      { id: "3", code: "VOU-LX125", operator: "Dedi Kurniawan", time: "25 menit lalu", amount: "Rp 50.000" },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sites">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
            <p className="text-gray-600 mt-1">{site.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant={site.isActive ? "destructive" : "default"}>
            {site.isActive ? (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Nonaktifkan
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4 mr-2" />
                Aktifkan
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Site Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Site</CardTitle>
            <CardDescription>Detail lokasi dan kontak SPBU</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{site.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Telepon</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{site.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    site.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {site.isActive ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              <p>Dibuat: 1 Januari 2024</p>
              <p>Diupdate: 15 Januari 2024</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Operator</p>
                  <p className="text-lg font-bold text-gray-900">{site._count.users}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Voucher Aktif</p>
                  <p className="text-lg font-bold text-gray-900">{site._count.vouchers}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transaksi</p>
                  <p className="text-lg font-bold text-gray-900">{site._count.transactions}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operators */}
      <Card>
        <CardHeader>
          <CardTitle>Operator Site</CardTitle>
          <CardDescription>Daftar operator yang bertugas di site ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {site.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === "SITE_ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role === "SITE_ADMIN" ? "Admin Site" : "Operator"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>Aktivitas transaksi di site ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {site.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tx.code}</p>
                  <p className="text-xs text-gray-500">{tx.operator} • {tx.time}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{tx.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
