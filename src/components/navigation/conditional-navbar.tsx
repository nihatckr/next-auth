"use client"

import { useSession } from "next-auth/react"
import { SimpleNavbar } from "./simple-navbar"

interface ConditionalNavbarProps {
  children?: React.ReactNode
}

export function ConditionalNavbar({ children }: ConditionalNavbarProps) {
  const { data: session, status } = useSession()

  // Loading state
  if (status === "loading") {
    return (
      <SimpleNavbar
        brandName="Auth Boilerplate"
        showAuthButtons={false}
        showUserMenu={false}
      />
    )
  }

  // Not authenticated - show login/register buttons
  if (!session?.user) {
    return (
      <SimpleNavbar
        brandName="Auth Boilerplate"
        showAuthButtons={true}
        showUserMenu={false}
      />
    )
  }

  // Authenticated - show user menu and notifications
  return (
    <SimpleNavbar
      brandName="Auth Boilerplate"
      showAuthButtons={false}
      showUserMenu={true}
      userInfo={{
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || ""
      }}
    />
  )
}
