import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { users, outlets } from "@/lib/db/schema"
import { eq, desc, or, like, and } from "drizzle-orm"
import { nanoid } from "nanoid"
import bcrypt from "bcryptjs"
import { successResponse, errorResponse, requireRoles } from "@/lib/api-utils"

// GET /api/users - List all users
export async function GET(req: NextRequest) {
  try {
    const { session, error: authError } = await requireRoles(req, ["ADMIN"])
    if (authError) return authError
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""

    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        outletId: users.outletId,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)

    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      )
    }
    if (role) {
      conditions.push(eq(users.role, role as any))
    }

    const allUsers = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(users.createdAt))
      : await query.orderBy(desc(users.createdAt))

    // Get outlet info for each user
    const usersWithOutlets = await Promise.all(
      allUsers.map(async (user) => {
        let outlet = null
        if (user.outletId) {
          outlet = await db.query.outlets.findFirst({
            where: eq(outlets.id, user.outletId),
          })
        }
        return {
          ...user,
          outlet,
        }
      })
    )

    return successResponse({ users: usersWithOutlets })
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}

// POST /api/users - Create new user
export async function POST(req: NextRequest) {
  try {
    const { session, error: authError } = await requireRoles(req, ["ADMIN"])
    if (authError) return authError

    const body = await req.json()
    const { name, email, phone, password, role, outletId } = body

    if (!name || !email || !password || !role) {
      return errorResponse("Missing required fields")
    }

    // Check if email already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existing) {
      return errorResponse("Email already exists", 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await db
      .insert(users)
      .values({
        id: nanoid(),
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        outletId,
        isActive: true,
      })
      .returning()

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser[0]

    return successResponse(userWithoutPassword, "User created successfully")
  } catch (error: any) {
    return errorResponse(error?.message || "Internal server error", 500)
  }
}
