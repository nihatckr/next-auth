"use server"

import * as z from 'zod'
import { ResetSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'
import  {sendPasswordResetEmail} from '@/lib/mail'
import { generatePasswordResetToken } from '@/lib/tokens'

// Şifre sıfırlama e-postası gönderen server action
export const resetAction = async (values: z.infer<typeof ResetSchema>) => {

  const validatedFields = ResetSchema.safeParse(values)

  if (!validatedFields.success) {
    return {error: 'Geçersiz e-posta adresi' }
  }

  const { email } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    return {error: 'Kullanıcı bulunamadı' }
  }

  const passwordResetToken = await generatePasswordResetToken(email)
console.log('✅ Şifre sıfırlama token\'ı oluşturuldu:', passwordResetToken)
  await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)


  return { success: 'Şifre sıfırlama e-postası gönderildi' }
}
