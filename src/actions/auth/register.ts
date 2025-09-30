"use server"
import * as z from 'zod'
import bcrypt from 'bcryptjs'
import { RegisterSchema } from '@/schemas'
import db from '@/lib/db'
import { getUserByEmail } from '@/data/user'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/mail'
import { RateLimitingService } from '@/lib/rate-limiting-service'
import { devLog, devError } from '@/lib/env'

// Yeni kullanıcı kaydı yapan server action
export const registerAction = async (values: z.infer<typeof RegisterSchema>) => {

 const validatedFields = RegisterSchema.safeParse(values)

 if (!validatedFields.success) {
  return {error: 'Geçersiz giriş' }
  }

  const { email, name, password } = validatedFields.data

  // Rate limiting kontrolü (kayıt denemelerini de sınırla)
  const rateLimitCheck = RateLimitingService.checkEmailRateLimit(email, 'register')

  if (!rateLimitCheck.allowed) {
    return {
      error: rateLimitCheck.error
    }
  }

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
    devLog('✅ Doğrulama token\'ı oluşturuldu', verificationToken)

    // Doğrulama e-postası gönder
    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
        name
      )

      // Hoşgeldin emaili gönder (background'da, hata olsa da sorun yok)
      sendWelcomeEmail(email, name).catch(err => {
        devLog('⚠️ Welcome email failed (non-critical)', err)
      })

      // Başarılı kayıt - rate limit kayıtlarını temizle
      RateLimitingService.clearAttempts(email)
      return { success: "Doğrulama e-postası gönderildi! E-posta kutunu kontrol et." }
    } catch (emailError) {
      devError('📧 E-posta gönderilemedi, ancak kullanıcı oluşturuldu', emailError)
      // Başarılı kayıt - rate limit kayıtlarını temizle
      RateLimitingService.clearAttempts(email)
      return { success: "Kullanıcı kaydedildi! Doğrulama bağlantısı için konsolu kontrol edin." }
    }
  } catch (error) {
    devError('❌ Kayıt hatası', error)
    // Başarısız deneme kaydet
    RateLimitingService.recordFailedAttempt(email)
    return { error: "Kayıt başarısız. Lütfen tekrar deneyin." }
  }
}
