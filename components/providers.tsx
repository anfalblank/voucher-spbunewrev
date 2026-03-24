"use client"

import { authClient } from "@/lib/auth-client"

export function Providers({ children }: { children: React.ReactNode }) {
  // Better-auth client handles session internally
  return <>{children}</>
}
