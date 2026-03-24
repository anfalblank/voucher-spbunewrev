import { db } from "./index"
import { users, outlets, vouchers, transactions } from "./schema"
import { nanoid } from "nanoid"
import { auth } from "../auth"
import { eq } from "drizzle-orm"

async function seed() {
  console.log("🌱 Seeding database...")

  // Create Outlets (8 outlets)
  console.log("Creating outlets...")
  const outletData = [
    { id: nanoid(), name: "SPBU 34-12345", code: "34-12345", address: "Jl. Sudirman No. 123, Jakarta Pusat", phone: "021-1234567", status: "ACTIVE" },
    { id: nanoid(), name: "SPBU 34-12346", code: "34-12346", address: "Jl. Gatot Subroto No. 456, Jakarta Selatan", phone: "021-2345678", status: "ACTIVE" },
    { id: nanoid(), name: "SPBU 34-12347", code: "34-12347", address: "Jl. Tomang No. 789, Jakarta Barat", phone: "021-3456789", status: "ACTIVE" },
    { id: nanoid(), name: "SPBU 34-12348", code: "34-12348", address: "Jl. Pemuda No. 321, Jakarta Timur", phone: "021-4567890", status: "ACTIVE" },
    { id: nanoid(), name: "SPBU 34-12349", code: "34-12349", address: "Jl. Fatmawati No. 654, Jakarta Selatan", phone: "021-5678901", status: "ACTIVE" },
    { id: nanoid(), name: "SPBU 34-12350", code: "34-12350", address: "Jl. Daan Mogot No. 987, Jakarta Barat", phone: "021-6789012", status: "ACTIVE" },
    { id: nanoid(), name: "SPBU 34-12351", code: "34-12351", address: "Jl. Panjang No. 246, Jakarta Barat", phone: "021-7890123", status: "ACTIVE" },
    { id: nanoid(), name: "SPBU 34-12352", code: "34-12352", address: "Jl. Pramuka No. 135, Jakarta Pusat", phone: "021-8901234", status: "ACTIVE" },
  ]

  const createdOutlets = await db.insert(outlets).values(outletData).returning()
  console.log(`✅ Created ${createdOutlets.length} outlets`)

  // Create Users using better-auth API
  console.log("Creating users...")

  const adminResult = await auth.api.signUpEmail({
    body: {
      email: "admin@spbu.co.id",
      password: "password123",
      name: "Admin SPBU",
    },
    headers: new Headers({
      "x-better-auth-origin": "http://localhost:3000",
    }),
  })

  let adminId = adminResult?.user?.id || nanoid()
  if (adminResult?.user) {
    await db.update(users).set({
      phone: "08123456789",
      outletId: null,
    }).where(eq(users.id, adminResult.user.id))
    // Update role using SQL
    await db.run(`UPDATE users SET role = 'ADMIN' WHERE id = '${adminResult.user.id}'`)
  }

  const ownerResult = await auth.api.signUpEmail({
    body: {
      email: "budi@spbu.co.id",
      password: "password123",
      name: "Budi Santoso",
    },
    headers: new Headers({
      "x-better-auth-origin": "http://localhost:3000",
    }),
  })

  let ownerId = ownerResult?.user?.id || nanoid()
  if (ownerResult?.user) {
    await db.update(users).set({
      phone: "08123456780",
      outletId: createdOutlets[0].id,
    }).where(eq(users.id, ownerResult.user.id))
    await db.run(`UPDATE users SET role = 'OWNER' WHERE id = '${ownerResult.user.id}'`)
  }

  const operator1Result = await auth.api.signUpEmail({
    body: {
      email: "ahmad@spbu.co.id",
      password: "password123",
      name: "Ahmad Operator",
    },
    headers: new Headers({
      "x-better-auth-origin": "http://localhost:3000",
    }),
  })

  let operator1Id = operator1Result?.user?.id || nanoid()
  if (operator1Result?.user) {
    await db.update(users).set({
      phone: "08123456781",
      outletId: createdOutlets[0].id,
    }).where(eq(users.id, operator1Result.user.id))
    // Default role is already OPERATOR, no need to update
  }

  const operator2Result = await auth.api.signUpEmail({
    body: {
      email: "siti@spbu.co.id",
      password: "password123",
      name: "Siti Operator",
    },
    headers: new Headers({
      "x-better-auth-origin": "http://localhost:3000",
    }),
  })

  let operator2Id = operator2Result?.user?.id || nanoid()
  if (operator2Result?.user) {
    await db.update(users).set({
      phone: "08123456782",
      outletId: createdOutlets[1].id,
    }).where(eq(users.id, operator2Result.user.id))
  }

  console.log(`✅ Created 4 users with better-auth`)

  // Create Vouchers
  console.log("Creating vouchers...")
  const now = new Date()
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const voucherData = [
    // Active vouchers - FIXED type
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "FIXED",
      value: "100000",
      status: "ACTIVE",
      expiryDate: nextMonth,
      outletId: createdOutlets[0].id,
      createdBy: adminId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "FIXED",
      value: "50000",
      status: "ACTIVE",
      expiryDate: nextMonth,
      outletId: createdOutlets[0].id,
      createdBy: adminId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "FIXED",
      value: "75000",
      status: "ACTIVE",
      expiryDate: nextMonth,
      outletId: createdOutlets[1].id,
      createdBy: ownerId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    // CREDIT type vouchers
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "CREDIT",
      value: "10",
      status: "ACTIVE",
      expiryDate: nextMonth,
      outletId: createdOutlets[0].id,
      createdBy: adminId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "CREDIT",
      value: "20",
      status: "ACTIVE",
      expiryDate: nextMonth,
      outletId: createdOutlets[1].id,
      createdBy: ownerId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    // DISCOUNT type vouchers
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "DISCOUNT",
      value: "20",
      status: "ACTIVE",
      expiryDate: nextMonth,
      outletId: createdOutlets[0].id,
      createdBy: adminId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    // Used vouchers
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "FIXED",
      value: "100000",
      status: "USED",
      expiryDate: nextMonth,
      outletId: createdOutlets[0].id,
      createdBy: adminId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "CREDIT",
      value: "10",
      status: "USED",
      expiryDate: nextMonth,
      outletId: createdOutlets[0].id,
      createdBy: adminId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    // Expired vouchers
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "FIXED",
      value: "50000",
      status: "EXPIRED",
      expiryDate: lastMonth,
      outletId: createdOutlets[0].id,
      createdBy: adminId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
    {
      id: nanoid(),
      code: `VOU-${nanoid(6).toUpperCase()}`,
      type: "DISCOUNT",
      value: "15",
      status: "EXPIRED",
      expiryDate: lastMonth,
      outletId: createdOutlets[0].id,
      createdBy: adminId,
      qrCodeUrl: `/api/qr/${nanoid(6)}`,
    },
  ]

  const createdVouchers = await db.insert(vouchers).values(voucherData).returning()
  console.log(`✅ Created ${createdVouchers.length} vouchers`)

  // Create sample transactions
  console.log("Creating transactions...")
  const usedVouchers = createdVouchers.filter((v) => v.status === "USED")

  for (const voucher of usedVouchers) {
    await db.insert(transactions).values({
      id: nanoid(),
      voucherId: voucher.id,
      userId: operator1Id,
      outletId: voucher.outletId,
      status: "SUCCESS",
      notes: "Voucher berhasil digunakan",
    })
  }

  console.log(`✅ Created ${usedVouchers.length} transactions`)

  console.log("\n🎉 Database seeded successfully!")
  console.log("\n📧 Login credentials:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("🔐 Admin")
  console.log("   Email: admin@spbu.co.id")
  console.log("   Password: password123")
  console.log("")
  console.log("🔐 Owner")
  console.log("   Email: budi@spbu.co.id")
  console.log("   Password: password123")
  console.log("")
  console.log("🔐 Operator")
  console.log("   Email: ahmad@spbu.co.id")
  console.log("   Password: password123")
  console.log("   Email: siti@spbu.co.id")
  console.log("   Password: password123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("\n⛽ Created Resources:")
  console.log(`   - ${createdOutlets.length} Outlets`)
  console.log(`   - 4 Users (1 Admin, 1 Owner, 2 Operators)`)
  console.log(`   - ${createdVouchers.length} Vouchers`)
  console.log(`   - ${usedVouchers.length} Transactions`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

seed().catch(console.error)
