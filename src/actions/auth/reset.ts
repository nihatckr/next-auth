"use server"

import * as z from 'zod'
import { ResetSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'
import  {sendPasswordResetEmail} from '@/lib/mail'
import { generatePasswordResetToken } from '@/lib/tokens'
import { loginRateLimiter } from '@/lib/rate-limiter'

// Şifre sıfırlama e-postası gönderen server action
export const resetAction = async (values: z.infer<typeof ResetSchema>) => {

  const validatedFields = ResetSchema.safeParse(values)

  if (!validatedFields.success) {
    return {error: 'Geçersiz e-posta adresi' }
  }

  const { email } = validatedFields.data

  // Rate limiting kontrolü (şifre sıfırlama denemelerini sınırla)
  const rateLimitCheck = loginRateLimiter.checkAttempt(email)

  if (!rateLimitCheck.allowed) {
    const remainingTime = loginRateLimiter.getRemainingLockoutTime(email)
    const minutes = Math.ceil(remainingTime / 60)
    return {
      error: `Çok fazla şifre sıfırlama denemesi. ${minutes} dakika sonra tekrar deneyin.`
    }
  }

  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    // Güvenlik amacıyla başarısız deneme kaydet
    loginRateLimiter.recordFailedAttempt(email)
    return {error: 'E-posta adresi bulunamadı!' }
  }

  try {
    const passwordResetToken = await generatePasswordResetToken(email)
    console.log('✅ Şifre sıfırlama token\'ı oluşturuldu:', passwordResetToken)

    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token, existingUser.name || undefined)

    // Başarılı işlem - rate limit kayıtlarını temizle
    loginRateLimiter.clearAttempts(email)
    return { success: 'Şifre sıfırlama e-postası gönderildi!' }

  } catch (error) {
    console.error('❌ Şifre sıfırlama hatası:', error)
    // Başarısız deneme kaydet
    loginRateLimiter.recordFailedAttempt(email)
    return { error: 'Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.' }
  }
}
