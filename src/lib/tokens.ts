import { randomBytes } from "crypto"
import db from "./db"
import { getVerificationTokenByEmail } from "@/data/verification-token"
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token"

// Güvenli token oluşturucu fonksiyon
const generateSecureToken = () => {
  return randomBytes(32).toString('hex')
}

export const generatePasswordResetToken = async (email:string) => {

 const token = generateSecureToken()
  const expires = new Date(new Date().getTime() + 60 * 60 * 1000) // 1 saat
  const existingToken = await getPasswordResetTokenByEmail(email);
  if (existingToken) {
    // Update the existing token
    await db.passwordResetToken.delete({
      where: { id: existingToken.id }
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: { email, token, expires, createdAt: new Date(), used: false },
  });

  return passwordResetToken;
}

export const generateVerificationToken = async (email:string) => {
 const token = generateSecureToken()

 const expires = new Date(new Date().getTime() + 30 * 60 * 1000) // 30 dakika

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    // Update the existing token
    await db.verificationToken.delete({
      where: { token: existingToken.token }
    });
  }
  const verificationToken = await db.verificationToken.create({
    data: { email, token, expires },
  });

 return verificationToken
}
