"use server"
import * as z from 'zod'
import { AuthError } from 'next-auth'

import { signIn } from '@/auth'
import { LoginSchema } from '@/schemas'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { generateVerificationToken } from '@/lib/tokens'

import { sendVerificationEmail } from '@/lib/mail'
import { getUserByEmail } from '@/data/user'

export const loginAction = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string) => {

  // Validate input
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
    return {error: 'Invalid Fields!' }
    }
    const { email, password } = validatedFields.data

    const existingUser = await getUserByEmail(email)

    if(!existingUser || !existingUser.email || !existingUser.password) {
      return { error: 'Email does not exist' }
    }


    if(!existingUser.emailVerified) {

      const verificationToken = await generateVerificationToken(existingUser.email)

      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      )
      return { success: 'Confirmation email sent!' }
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Redirect'i devre dışı bırak
      })

      if (result?.error) {
        return { error: 'Invalid credentials' }
      }

      return { success: 'Login successful!' }

    } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: 'Invalid credentials' }
        default:
          return { error: 'Something went wrong' }
      }
    }
    throw error;
  }
}
