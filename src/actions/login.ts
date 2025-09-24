"use server"
import * as z from 'zod'
import { AuthError } from 'next-auth'

import { signIn } from '@/auth'
import { LoginSchema } from '@/schemas'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { generateVerificationToken } from '@/lib/tokens'

import { sendVerificationEmail } from '@/lib/mail'
import { getUserByEmail } from '@/data/user'

// Kullanıcı giriş işlemini yürüten server action
export const loginAction = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string) => {

  // Giriş verilerini doğrula
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
    return {error: 'Geçersiz alanlar!' }
    }
    const { email, password } = validatedFields.data

    const existingUser = await getUserByEmail(email)

    if(!existingUser || !existingUser.email || !existingUser.password) {
      return { error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı' }
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
        return { error: 'Geçersiz kullanıcı bilgileri' }
      }

      return { success: 'Giriş başarılı!' }

    } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: 'Geçersiz kullanıcı bilgileri' }
        default:
          return { error: 'Bir şeyler ters gitti' }
      }
    }
    throw error;
  }
}
