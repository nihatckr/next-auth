import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { LoginSchema } from "./schemas"
import { getUserByEmail } from "./data/user"
import bcrypt from "bcryptjs"



export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await getUserByEmail(email);
          if (!user || !user?.password) return null;

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (passwordMatch) return user;
          return null;
        }
        return null;
      }
    }),
  ],
  // Session güvenlik ayarları
  session: {
    strategy: "jwt", // JWT tabanlı session
    maxAge: 24 * 60 * 60, // 24 saat session süresi
    updateAge: 60 * 60, // Her 1 saatte bir session güncelle
  },
  // JWT güvenlik ayarları
  jwt: {
    maxAge: 24 * 60 * 60, // 24 saat JWT süresi
  },
  // Sayfa ayarları
  pages: {
    signIn: "/auth/login", // Özel giriş sayfası
    error: "/auth/error", // Hata sayfası
  },
  // Güvenlik ayarları
  callbacks: {
    async signIn({ user, account, profile }) {
      // Kullanıcı giriş yaptıktan sonra nereye gideceğini belirle
      return true
    },
    async redirect({ url, baseUrl }) {
      // Giriş yaptıktan sonra yönlendirme
      // Eğer url "/" ile başlıyorsa (relative path), baseUrl ile birleştir
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Eğer url aynı origin'den geliyorsa, direkt döndür
      else if (new URL(url).origin === baseUrl) return url
      // Diğer durumlarda ana sayfaya yönlendir
      return `${baseUrl}/`
    },
    async jwt({ token, user }) {
      // Kullanıcı bilgilerini token'a ekle
      if (user) {
        token.id = user.id
        token.role = (user as { role?: "ADMIN" | "USER" }).role // Type assertion for role
        token.emailVerified = (user as { emailVerified?: Date }).emailVerified
      }

      return token
    },
    async session({ session, token }) {
      // Token bilgilerini session'a aktar
      if (token && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "USER"
        session.user.emailVerified = token.emailVerified as Date
      }
      return session
    },
  },
} satisfies NextAuthConfig
