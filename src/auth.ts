import NextAuth  from "next-auth"

import {PrismaAdapter } from "@auth/prisma-adapter"

import db from "@/lib/db"
import authConfig from "./auth.config"
import { getUserById } from "./data/user"



export const { handlers , auth,signIn,signOut,unstable_update  } = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',

  },
  events: {
    async linkAccount({ user, account }) {
      // Handle linking accounts here
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(db as any),
  ...authConfig,
  callbacks: {

      async signIn({ user,account }) {
        //Allow OAuth wihout email verification

        if(account?.provider !== 'credentials') return true

        // Prevent sign in if email is not verified
        if (!user.id) return false

        const existingUser = await getUserById(user.id)

        if(!existingUser?.emailVerified) return false


        //ToDo: Add 2FA check here

         return true
      },

  async session({ session, token }) {

     if(token.sub && session.user) {
       session.user.id = token.sub}

      if(token.role && session.user) {
        session.user.role = token.role
      }
      if(session.user) {
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },

  async jwt({ token, user }) {

    if (!token.sub) return token

    const existingUser = await getUserById(token.sub)

    if (!existingUser) return token

    token.email = existingUser.email
    token.name = existingUser.name
    token.role = existingUser.role
    return token
  },
  }

})
