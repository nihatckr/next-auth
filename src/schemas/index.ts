import { UserRole } from "@/lib/generated/prisma"
import * as z from "zod"
import { _email } from "zod/v4/core"

export const ResetSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),

})

export const NewPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
})
export const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const RegisterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
})

// Base schema - her zaman geçerli alanlar
export const SettingsSchema = z.object({
  name: z.optional(z.string()),
  email: z.optional(z.string().email("Invalid email address")),
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
  message: "New password is required when changing password",
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
  message: "Current password is required when setting a new password",
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
  message: "Current password must be at least 6 characters",
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
  message: "New password must be at least 6 characters",
  path: ["newPassword"],
})
