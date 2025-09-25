"use server"

import * as z from "zod"
import { SettingsSchema } from "@/schemas"
import { getUserById } from "@/data/user"
import { currentUser } from "@/lib/auth"
import db from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import bcrypt from "bcryptjs"


export const settingAction = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser()

  if (!user) {
    return { error: "You must be logged in to update settings." }
  }

  if (!user.id) {
    return { error: "User ID is missing." }
  }

  const existingUser = await getUserById(user.id)

  if (!existingUser) {
    return { error: "User not found." }
  }

  console.log("🔍 User info:")
  console.log("- User ID:", existingUser.id)
  console.log("- User email:", existingUser.email)

  if( values.email && values.email !== existingUser.email) {

    const existingUser = await db.user.findUnique({
      where: { email: values.email },
    })

    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email is already taken." }
    }

    const verificationToken = await generateVerificationToken(  values.email)

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )
    return { success: "Verification email sent to new email address. Please verify to update your email." }
  }

  // Sadece değişen alanları topla
  const updateData: any = {}

  // İsim güncellemesi
  if (values.name && values.name !== existingUser.name) {
    updateData.name = values.name
    console.log("📝 Name will be updated:", values.name)
  }

  // Role güncellemesi (admin işlemi)
  if (values.role && values.role !== existingUser.role) {
    updateData.role = values.role
    console.log("👑 Role will be updated:", values.role)
  }

  // Şifre değiştirme işlemi
  if (values.password && values.newPassword) {
    // Şifre kontrolü için password field'ı dahil edip user'ı tekrar sorgula
    const userWithPassword = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        password: true
      }
    })

    // OAuth kullanıcıları için şifre değiştirme desteklenmiyor
    if (!userWithPassword?.password) {
      return { error: "Şifre değiştirme OAuth hesapları için desteklenmiyor. Bu hesap Google/GitHub ile oluşturulmuş." }
    }

    console.log("🔍 Password change attempt:")
    console.log("- Input password:", values.password)
    console.log("- Has stored password:", !!userWithPassword.password)

    const passwordMatch = await bcrypt.compare(values.password, userWithPassword.password)

    if (!passwordMatch) {
      return { error: "Mevcut şifre yanlış." }
    }

    const hashedNewPassword = await bcrypt.hash(values.newPassword, 10)
    updateData.password = hashedNewPassword
    console.log("🔐 Password will be updated")
  }

  // Eğer hiçbir alan değişmemişse
  if (Object.keys(updateData).length === 0) {
    return { success: "Herhangi bir değişiklik algılanmadı." }
  }

  console.log("🔄 Güncellenecek alanlar:", Object.keys(updateData))

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: updateData,
  })

  console.log("✅ Kullanıcı başarıyla güncellendi")

  return {
    success: "Ayarlar başarıyla güncellendi.",
    updatedFields: Object.keys(updateData)
  }
}
