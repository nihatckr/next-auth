"use server"
import * as z from 'zod'
import { AuthError } from 'next-auth'

import { signIn } from '@/auth'
import { LoginSchema } from '@/schemas'

import { generateVerificationToken } from '@/lib/tokens'
import { RateLimitingService } from '@/lib/rate-limiting-service'

import { sendVerificationEmail } from '@/lib/mail'
import { getUserByEmail } from '@/data/user'

// Kullanıcı giriş işlemini yürüten server action
export async function login(values: z.infer<typeof LoginSchema>) {

  // Giriş verilerini doğrula
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
    return {error: 'Geçersiz alanlar!' }
    }
    const { email, password } = validatedFields.data

    // Rate limiting kontrolü
    const rateLimitCheck = RateLimitingService.checkEmailRateLimit(email, 'login')

    if (!rateLimitCheck.allowed) {
      return { error: rateLimitCheck.error }
    }

    const existingUser = await getUserByEmail(email)

    if(!existingUser || !existingUser.email || !existingUser.password) {
      // Başarısız deneme kaydet
      RateLimitingService.recordFailedAttempt(email)
      return { error: 'Geçersiz e-posta veya şifre!' }
    }

    // E-posta doğrulaması yapılmamışsa
    if(!existingUser.emailVerified) {

      const verificationToken = await generateVerificationToken(existingUser.email)

      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      )
      return { success: 'Doğrulama e-postası gönderildi!' }
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Yönlendirmeyi devre dışı bırak
      })

      if (result?.error) {
        // Başarısız deneme kaydet
        RateLimitingService.recordFailedAttempt(email)
        return { error: 'Geçersiz e-posta veya şifre!' }
      }

      // Başarılı giriş - rate limit kayıtlarını temizle
      RateLimitingService.clearAttempts(email)
      return { success: 'Giriş başarılı!' }

    } catch (error) {
    // Başarısız deneme kaydet
    RateLimitingService.recordFailedAttempt(validatedFields.data.email)

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: 'Geçersiz e-posta veya şifre!' }
        default:
          return { error: 'Giriş başarısız! Lütfen tekrar deneyin.' }
      }
    }
    throw error;
  }
}
