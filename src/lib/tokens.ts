import {v4 as uuidv4} from "uuid"
import db from "./db"
import { getVerificationTokenByEmail } from "@/data/verification-token"
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token"


export const generatePasswordResetToken = async (email:string) => {

 const token = uuidv4()
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000) // 1 hour from now
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
 const token = uuidv4()

 const expires = new Date(new Date().getTime() + 15 * 60 * 1000) // 15 minutes from now

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    // Update the existing token
    await db.verificationToken.delete({
      where: { id: existingToken.id }
    });
  }
  const verificationToken = await db.verificationToken.create({
    data: { email, token, expires },
  });

 return verificationToken
}
