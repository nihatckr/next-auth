import { UserRole } from "@/lib/generated/prisma"
import * as z from "zod"
import { _email } from "zod/v4/core"

// Şifre sıfırlama için schema
export const ResetSchema = z.object({
  email: z.string().min(1, "E-posta adresi gerekli").email("Geçersiz e-posta adresi"),

})

// Yeni şifre belirleme için schema
export const NewPasswordSchema = z.object({
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
})

// Giriş yapmak için schema
export const LoginSchema = z.object({
  email: z.string().min(1, "E-posta adresi gerekli").email("Geçersiz e-posta adresi"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
})

// Kayıt olmak için schema
export const RegisterSchema = z.object({
  email: z.string().min(1, "E-posta adresi gerekli").email("Geçersiz e-posta adresi"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  name: z.string().min(1, "İsim gerekli"),
})

// Kullanıcı ayarları için schema - tüm alanlar isteğe bağlı
export const SettingsSchema = z.object({
  name: z.optional(z.string()),
  email: z.optional(z.string().email("Geçersiz e-posta adresi")),
  role: z.optional(z.enum([UserRole.ADMIN, UserRole.USER])),
  password: z.optional(z.string()),
  newPassword: z.optional(z.string()),
})
.refine((data) => {
  // Sadece şifre alanları doldurulmuşsa validation yap
  const hasPassword = data.password && data.password.trim() !== ""
  const hasNewPassword = data.newPassword && data.newPassword.trim() !== ""

  // Eğer ikisinden biri boşsa ve diğeri doluysa hata ver
  if (hasPassword && !hasNewPassword) {
    return false
  }
  return true;
}, {
  message: "Şifre değiştirirken yeni şifre gerekli",
  path: ["newPassword"],
})
.refine((data) => {
  const hasPassword = data.password && data.password.trim() !== ""
  const hasNewPassword = data.newPassword && data.newPassword.trim() !== ""

  if (hasNewPassword && !hasPassword) {
    return false
  }
  return true;
}, {
  message: "Yeni şifre belirlerken mevcut şifre gerekli",
  path: ["password"],
})
.refine((data) => {
  // Şifre minimum uzunluk kontrolü - sadece doldurulmuşsa
  const hasPassword = data.password && data.password.trim() !== ""
  if (hasPassword && data.password!.trim().length < 6) {
    return false
  }
  return true;
}, {
  message: "Mevcut şifre en az 6 karakter olmalı",
  path: ["password"],
})
.refine((data) => {
  // Yeni şifre minimum uzunluk kontrolü - sadece doldurulmuşsa
  const hasNewPassword = data.newPassword && data.newPassword.trim() !== ""
  if (hasNewPassword && data.newPassword!.trim().length < 6) {
    return false
  }
  return true;
}, {
  message: "Yeni şifre en az 6 karakter olmalı",
  path: ["newPassword"],
})
