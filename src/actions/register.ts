"use server"
import * as z from 'zod'
import bcrypt from 'bcryptjs'
import { RegisterSchema } from '@/schemas'
import db from '@/lib/db'
import { getUserByEmail } from '@/data/user'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/mail'

// Yeni kullanıcı kaydı yapan server action
export const registerAction = async (values: z.infer<typeof RegisterSchema>) => {

 const validatedFields = RegisterSchema.safeParse(values)

 if (!validatedFields.success) {
  return {error: 'Geçersiz giriş' }
  }

  const { email, name, password,   } = validatedFields.data

  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await getUserByEmail(email);

  if (existingUser !== null && existingUser !== undefined) {
    return { error: 'Bu e-posta adresi zaten kullanımda!' }
  }

  try {
    await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    })

    // Doğrulama token'ı oluştur
    const verificationToken = await generateVerificationToken(email)
    console.log('✅ Doğrulama token\'ı oluşturuldu:', verificationToken)

    // Doğrulama e-postası gönder (veya geliştirme ortamında simüle et)
    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      )
      return { success: "Doğrulama e-postası gönderildi! Konsolu kontrol edin." }
    } catch (emailError) {
      console.error('📧 E-posta gönderilemedi, ancak kullanıcı oluşturuldu:', emailError)
      return { success: "Kullanıcı kaydedildi! Doğrulama bağlantısı için konsolu kontrol edin." }
    }
  } catch (error) {
    console.error('❌ Kayıt hatası:', error)
    return { error: "Kayıt başarısız. Lütfen tekrar deneyin." }
  }
}
