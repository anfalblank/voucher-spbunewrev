import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // Enable automatic session fetching
  fetchOptions: {
    credentials: "include",
  },
})

export const { signIn, signOut, signUp, useSession } = authClient
