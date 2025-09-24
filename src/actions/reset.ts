"use server"

import * as z from 'zod'
import { ResetSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'
import  {sendPasswordResetEmail} from '@/lib/mail'
import { generatePasswordResetToken } from '@/lib/tokens'

export const resetAction = async (values: z.infer<typeof ResetSchema>) => {

  const validatedFields = ResetSchema.safeParse(values)

  if (!validatedFields.success) {
    return {error: 'Invalid Email' }
  }

  const { email } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    return {error: 'User not found' }
  }

  const passwordResetToken = await generatePasswordResetToken(email)
console.log('✅ Password reset token created:', passwordResetToken)
  await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)


  return { success: 'Password reset email sent' }
}
