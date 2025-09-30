import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import db from "@/lib/db"
import authConfig from "./auth.config"
import { getUserById } from "./data/user"

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  events: {
    async linkAccount({ user }) {
      // Handle linking accounts here
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(db as any),
  ...authConfig
})
