import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"
import { relations } from "drizzle-orm"

// ============================================================================
// USERS TABLE - Authentication & User Management
// ============================================================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  phone: text("phone"),
  role: text("role", {
    enum: ["ADMIN", "OWNER", "OPERATOR"]
  }).notNull().default("OPERATOR"),
  outletId: text("outlet_id").references(() => outlets.id, { onDelete: "set null" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// ============================================================================
// OUTLETS TABLE - SPBU Locations
// ============================================================================

export const outlets = sqliteTable("outlets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  address: text("address").notNull(),
  phone: text("phone"),
  status: text("status", {
    enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"]
  }).notNull().default("ACTIVE"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// ============================================================================
// VOUCHERS TABLE - Voucher Management
// ============================================================================

export const vouchers = sqliteTable("vouchers", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type", {
    enum: ["FIXED", "CREDIT", "DISCOUNT"]
  }).notNull(),
  value: text("value").notNull(), // Decimal as string
  status: text("status", {
    enum: ["ACTIVE", "USED", "EXPIRED", "CANCELLED"]
  }).notNull().default("ACTIVE"),
  expiryDate: integer("expiry_date", { mode: "timestamp" }).notNull(),
  outletId: text("outlet_id").notNull().references(() => outlets.id, { onDelete: "restrict" }),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  qrCodeUrl: text("qr_code_url").notNull(),
  metadata: text("metadata"), // JSON string for additional info
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// ============================================================================
// TRANSACTIONS TABLE - Transaction History
// ============================================================================

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  voucherId: text("voucher_id").notNull().references(() => vouchers.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "restrict" }), // Operator
  outletId: text("outlet_id").notNull().references(() => outlets.id, { onDelete: "restrict" }),
  status: text("status", {
    enum: ["SUCCESS", "FAILED", "PENDING"]
  }).notNull().default("SUCCESS"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// ============================================================================
// VOUCHER REDEMPTIONS TABLE - Track scan/redemption history
// ============================================================================

export const voucherRedemptions = sqliteTable("voucher_redemptions", {
  id: text("id").primaryKey(),
  voucherId: text("voucher_id").notNull().references(() => vouchers.id, { onDelete: "cascade" }),
  transactionId: text("transaction_id").references(() => transactions.id, { onDelete: "set null" }),
  outletId: text("outlet_id").notNull().references(() => outlets.id, { onDelete: "restrict" }),
  operatorId: text("operator_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  status: text("status", {
    enum: ["SUCCESS", "FAILED", "PENDING", "EXPIRED", "ALREADY_USED", "INVALID"]
  }).notNull(),
  failureReason: text("failure_reason"),
  qrCodeData: text("qr_code_data"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// ============================================================================
// BETTER AUTH TABLES (Required for authentication)
// ============================================================================

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// ============================================================================
// RELATIONSHIPS
// ============================================================================

export const usersRelations = relations(users, ({ many, one }) => ({
  outlet: one(outlets, {
    fields: [users.outletId],
    references: [outlets.id],
  }),
  vouchersCreated: many(vouchers),
  transactions: many(transactions),
  redemptions: many(voucherRedemptions),
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const outletsRelations = relations(outlets, ({ many }) => ({
  users: many(users),
  vouchers: many(vouchers),
  transactions: many(transactions),
  redemptions: many(voucherRedemptions),
}))

export const vouchersRelations = relations(vouchers, ({ one, many }) => ({
  outlet: one(outlets, {
    fields: [vouchers.outletId],
    references: [outlets.id],
  }),
  creator: one(users, {
    fields: [vouchers.createdBy],
    references: [users.id],
  }),
  transactions: many(transactions),
  redemptions: many(voucherRedemptions),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  voucher: one(vouchers, {
    fields: [transactions.voucherId],
    references: [vouchers.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  outlet: one(outlets, {
    fields: [transactions.outletId],
    references: [outlets.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const voucherRedemptionsRelations = relations(voucherRedemptions, ({ one }) => ({
  voucher: one(vouchers, {
    fields: [voucherRedemptions.voucherId],
    references: [vouchers.id],
  }),
  transaction: one(transactions, {
    fields: [voucherRedemptions.transactionId],
    references: [transactions.id],
  }),
  outlet: one(outlets, {
    fields: [voucherRedemptions.outletId],
    references: [outlets.id],
  }),
  operator: one(users, {
    fields: [voucherRedemptions.operatorId],
    references: [users.id],
  }),
}))
