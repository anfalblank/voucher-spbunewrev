// Define enums directly since we're using Drizzle ORM
export type UserRole = "SUPER_ADMIN" | "SITE_ADMIN" | "OPERATOR"
export type VoucherType = "LITER" | "RUPIAH" | "FLAT"
export type VoucherStatus = "PENDING" | "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED"

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  role: UserRole
  siteId?: string | null
  site?: {
    id: string
    name: string
    code: string
  } | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Site {
  id: string
  name: string
  code: string
  address: string
  phone?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    users?: number
    vouchers?: number
    transactions?: number
  }
}

export interface Voucher {
  id: string
  code: string
  type: VoucherType
  value: number
  maxLiters?: number | null
  validFrom: Date
  validUntil: Date
  status: VoucherStatus
  siteId: string
  site?: {
    id: string
    name: string
    code: string
  }
  createdBy: string
  creator?: {
    id: string
    name: string
    email: string
  }
  qrCodeUrl: string
  usageLimit: number
  currentUsage: number
  transactionId?: string | null
  transaction?: Transaction
  metadata?: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  voucherId: string
  voucher?: {
    id: string
    code: string
    type: VoucherType
    value: number
  }
  siteId: string
  site?: {
    id: string
    name: string
    code: string
  }
  operatorId: string
  operator?: {
    id: string
    name: string
    email: string
  }
  vehiclePlate?: string | null
  literAmount: number
  rupiahAmount: number
  odometer?: number | null
  status: string
  validatedAt: Date
  metadata?: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalVouchers: number
  activeVouchers: number
  usedVouchers: number
  expiredVouchers: number
  todayTransactions: number
  todayVolume: number
  todayValue: number
  activeSites: number
  activeOperators: number
}

export interface VoucherFormData {
  type: VoucherType
  value: string
  maxLiters?: string
  validFrom: string
  validUntil: string
  siteId: string
  quantity?: number
  usageLimit?: number
}

export interface TransactionFormData {
  vehiclePlate?: string
  literAmount: string
  rupiahAmount: string
  odometer?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: VoucherStatus
  siteId?: string
  dateFrom?: string
  dateTo?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
