"use server"

import db from '@/lib/db'
import { getUserByEmail } from '@/data/user'
import { getVerificationTokenByToken } from '@/data/verification-token'

// E-posta doğrulama işlemini yapan server action
export const newVerificationAction = async (token: string) => {

  const existingToken = await getVerificationTokenByToken(token)

  if (!existingToken) {
    return { error: 'Token mevcut değil' }
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: 'Token\'ın süresi dolmuş!' }
  }

  const existingUser = await getUserByEmail(existingToken.email)

  if (!existingUser) {
    return { error: 'E-posta adresi bulunamadı!' }
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email
    }
  })

  await db.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return { success: 'E-posta başarıyla doğrulandı!' }
}
