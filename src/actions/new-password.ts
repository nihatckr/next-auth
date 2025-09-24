"use server"

import * as z from 'zod'
import  bcrypt from 'bcryptjs'
import { NewPasswordSchema } from '@/schemas'
import { getUserByEmail } from '../data/user'
import { getPasswordResetTokenByToken } from '../data/password-reset-token'
import db from '@/lib/db'




export const newPasswordAction = async (values: z.infer<typeof NewPasswordSchema>, token: string | null) => {


  if(!token) {
    return { error: 'Invalid or expired token' }
  }

  const validatedFields = NewPasswordSchema.safeParse(values)

  if (!validatedFields.success) {
    return {error: 'Invalid input' }
  }
 const { password } = validatedFields.data

 const existingToken = await getPasswordResetTokenByToken(token)

 if (!existingToken) {
  return { error: 'Invalid or expired token' }
 }

 console.log("🔍 Token validation:")
 console.log("- Token expires:", existingToken.expires)
 console.log("- Current time:", new Date())
 console.log("- Token used:", existingToken.used)

 const hasExpired = new Date(existingToken.expires) < new Date()
 console.log("- Has expired:", hasExpired)

 if (hasExpired) {
  return { error: 'Token has expired' }
 }

 if (existingToken.used) {
  return { error: 'Token has already been used' }
 }
const existingUser = await getUserByEmail(existingToken.email)

if (!existingUser) {
  return { error: 'User not found' }
}

const hashedPassword = await bcrypt.hash(password, 10)

await db.user.update({
  where: { id: existingUser.id },
  data: { password: hashedPassword }
})

// Token'ı used olarak işaretle (silmek yerine)
await db.passwordResetToken.update({
  where: { id: existingToken.id },
  data: { used: true }
})
return { success: 'Password successfully updated!' }

}
