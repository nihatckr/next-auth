"use server"
import * as z from 'zod'
import bcrypt from 'bcryptjs'
import { RegisterSchema } from '@/schemas'
import db from '@/lib/db'
import { getUserByEmail } from '@/data/user'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/mail'
import { loginRateLimiter } from '@/lib/rate-limiter'

// Yeni kullanıcı kaydı yapan server action
export const registerAction = async (values: z.infer<typeof RegisterSchema>) => {

 const validatedFields = RegisterSchema.safeParse(values)

 if (!validatedFields.success) {
  return {error: 'Geçersiz giriş' }
  }

  const { email, name, password } = validatedFields.data

  // Rate limiting kontrolü (kayıt denemelerini de sınırla)
  const rateLimitCheck = loginRateLimiter.checkAttempt(email)

  if (!rateLimitCheck.allowed) {
    const remainingTime = loginRateLimiter.getRemainingLockoutTime(email)
    const minutes = Math.ceil(remainingTime / 60)
    return {
      error: `Çok fazla kayıt denemesi. ${minutes} dakika sonra tekrar deneyin.`
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
    console.log('✅ Doğrulama token\'ı oluşturuldu:', verificationToken)

    // Doğrulama e-postası gönder
    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
        name
      )

      // Hoşgeldin emaili gönder (background'da, hata olsa da sorun yok)
      sendWelcomeEmail(email, name).catch(err =>
        console.log('⚠️ Welcome email failed (non-critical):', err)
      )

      // Başarılı kayıt - rate limit kayıtlarını temizle
      loginRateLimiter.clearAttempts(email)
      return { success: "Doğrulama e-postası gönderildi! E-posta kutunu kontrol et." }
    } catch (emailError) {
      console.error('📧 E-posta gönderilemedi, ancak kullanıcı oluşturuldu:', emailError)
      // Başarılı kayıt - rate limit kayıtlarını temizle
      loginRateLimiter.clearAttempts(email)
      return { success: "Kullanıcı kaydedildi! Doğrulama bağlantısı için konsolu kontrol edin." }
    }
  } catch (error) {
    console.error('❌ Kayıt hatası:', error)
    // Başarısız deneme kaydet
    loginRateLimiter.recordFailedAttempt(email)
    return { error: "Kayıt başarısız. Lütfen tekrar deneyin." }
  }
}
