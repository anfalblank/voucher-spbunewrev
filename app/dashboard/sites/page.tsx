"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Users,
  Ticket,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import Link from "next/link"

export default function SitesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - will be replaced with API calls
  const sites = [
    {
      id: "1",
      name: "SPBU 34-12345",
      code: "34-12345",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      phone: "021-1234567",
      isActive: true,
      createdAt: "2024-01-01",
      _count: {
        users: 5,
        vouchers: 156,
        transactions: 78,
      },
    },
    {
      id: "2",
      name: "SPBU 34-12346",
      code: "34-12346",
      address: "Jl. Gatot Subroto No. 456, Jakarta Selatan",
      phone: "021-7654321",
      isActive: true,
      createdAt: "2024-01-05",
      _count: {
        users: 4,
        vouchers: 120,
        transactions: 65,
      },
    },
    {
      id: "3",
      name: "SPBU 34-12347",
      code: "34-12347",
      address: "Jl. Daan Mogot No. 789, Jakarta Barat",
      phone: "021-9876543",
      isActive: false,
      createdAt: "2024-01-10",
      _count: {
        users: 3,
        vouchers: 45,
        transactions: 20,
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Site SPBU</h1>
          <p className="text-gray-600 mt-1">Kelola semua lokasi SPBU</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Site
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari site berdasarkan nama atau kode..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <Card key={site.id} className={site.isActive ? "" : "opacity-60"}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <CardDescription className="mt-1">{site.code}</CardDescription>
                </div>
                <button
                  className={`p-1 rounded-lg transition-colors ${
                    site.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}
                  title={site.isActive ? "Aktif" : "Tidak Aktif"}
                >
                  {site.isActive ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 line-clamp-2">{site.address}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">{site.phone}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{site._count.users}</p>
                  <p className="text-xs text-gray-500">Operator</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{site._count.vouchers}</p>
                  <p className="text-xs text-gray-500">Voucher</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{site._count.transactions}</p>
                  <p className="text-xs text-gray-500">Transaksi</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Link href={`/dashboard/sites/${site.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
