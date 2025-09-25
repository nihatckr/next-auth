"use server"

import * as z from 'zod'
import  bcrypt from 'bcryptjs'
import { NewPasswordSchema } from '@/schemas'
import { getUserByEmail } from '../data/user'
import { getPasswordResetTokenByToken } from '../data/password-reset-token'
import db from '@/lib/db'
import { sendPasswordChangedEmail } from '@/lib/mail'

// Yeni şifre belirleme işlemini yapan server action
export const newPasswordAction = async (values: z.infer<typeof NewPasswordSchema>, token: string | null) => {

  if(!token) {
    return { error: 'Geçersiz veya süresi dolmuş token' }
  }

  const validatedFields = NewPasswordSchema.safeParse(values)

  if (!validatedFields.success) {
    return {error: 'Geçersiz giriş' }
  }
 const { password } = validatedFields.data

 const existingToken = await getPasswordResetTokenByToken(token)

 if (!existingToken) {
  return { error: 'Geçersiz veya süresi dolmuş token' }
 }

 console.log("🔍 Token doğrulaması:")
 console.log("- Token süresi:", existingToken.expires)
 console.log("- Şu anki zaman:", new Date())
 console.log("- Token kullanıldı mı:", existingToken.used)

 const hasExpired = new Date(existingToken.expires) < new Date()
 console.log("- Süresi doldu mu:", hasExpired)

 if (hasExpired) {
  return { error: 'Token\'ın süresi dolmuş' }
 }

 if (existingToken.used) {
  return { error: 'Token zaten kullanılmış' }
 }
const existingUser = await getUserByEmail(existingToken.email)

if (!existingUser) {
  return { error: 'Kullanıcı bulunamadı' }
}

const hashedPassword = await bcrypt.hash(password, 10)

await db.user.update({
  where: { id: existingUser.id },
  data: { password: hashedPassword }
})

try {
  // Token'ı kullanıldı olarak işaretle (silmek yerine)
  await db.passwordResetToken.update({
    where: { id: existingToken.id },
    data: { used: true }
  })

  console.log('✅ Şifre başarıyla güncellendi ve token kullanıldı olarak işaretlendi')

  // Şifre değiştirildi bildirimi gönder (background'da)
  if (existingUser.name) {
    sendPasswordChangedEmail(existingUser.email!, existingUser.name)
      .catch(err => console.log('⚠️ Password changed notification failed (non-critical):', err))
  }

  return { success: 'Şifre başarıyla güncellendi!' }

} catch (error) {
  console.error('❌ Şifre güncelleme hatası:', error)
  return { error: 'Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.' }
}

}
