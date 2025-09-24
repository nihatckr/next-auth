
import NextAuth, { type DefaultSession } from "next-auth"


export type ExtendedUser =  DefaultSession["user"] & {
  role: "USER" | "ADMIN"
  emailVerified?: Date | null
  isTwoFactorEnabled?: boolean
}

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user:  ExtendedUser
  }
}

import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    role?: "USER" | "ADMIN"
  }
}
