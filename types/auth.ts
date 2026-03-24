import type { User, Session } from "better-auth/types"

export interface SPBUUser extends User {
  role: string
  siteId: string | null
  phone: string | null
  isActive: boolean
}

export interface SPBUSession extends Session {
  user: SPBUUser
}
