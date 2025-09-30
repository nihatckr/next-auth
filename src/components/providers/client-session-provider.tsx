"use client"

import { SessionProvider } from "next-auth/react"
import { SessionTimeoutWarning } from "@/components/session-timeout-warning"

interface ClientSessionProviderProps {
  children: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
}

// Client-side session provider wrapper
export const ClientSessionProvider = ({ children, session }: ClientSessionProviderProps) => {
  return (
    <SessionProvider session={session}>
      {children}
      <SessionTimeoutWarning />
    </SessionProvider>
  )
}
