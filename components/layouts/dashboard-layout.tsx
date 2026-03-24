"use client"

import { useSession, signOut, authClient } from "@/lib/auth-client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Ticket,
  MapPin,
  History,
  BarChart3,
  Users,
  QrCode,
  LogOut,
  Fuel,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "OWNER", "OPERATOR"] },
  { name: "Voucher", href: "/dashboard/vouchers", icon: Ticket, roles: ["ADMIN", "OWNER"] },
  { name: "Outlet SPBU", href: "/dashboard/sites", icon: MapPin, roles: ["ADMIN", "OWNER"] },
  { name: "Transaksi", href: "/dashboard/transactions", icon: History, roles: ["ADMIN", "OWNER"] },
  { name: "Laporan", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN", "OWNER"] },
  { name: "Pengguna", href: "/dashboard/users", icon: Users, roles: ["ADMIN"] },
  { name: "Scan QR & Settlement", href: "/dashboard/scan", icon: QrCode, roles: ["ADMIN", "OWNER", "OPERATOR"] },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const user = session?.user as any
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filter navigation based on user role
  const filteredNavigation = user?.role
    ? navigation.filter((item) => item.roles.includes(user.role))
    : navigation // Show all navigation if role not determined yet

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login"
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Fuel className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SPBU Voucher</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.name?.substring(0, 2).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {user?.site && (
              <div className="hidden sm:block text-sm text-gray-600">
                <span className="font-medium">{user.site.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
