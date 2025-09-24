"use server"
import * as z from 'zod'
import bcrypt from 'bcryptjs'
import { RegisterSchema } from '@/schemas'
import db from '@/lib/db'
import { getUserByEmail } from '@/data/user'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/mail'


export const registerAction = async (values: z.infer<typeof RegisterSchema>) => {

 const validatedFields = RegisterSchema.safeParse(values)

 if (!validatedFields.success) {
  return {error: 'Invalid input' }
  }

  const { email, name, password,   } = validatedFields.data

  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await getUserByEmail(email);

  if (existingUser !== null && existingUser !== undefined) {
    return { error: 'User already exists!' }
  }

  try {
    await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    })

    // Generate verification token
    const verificationToken = await generateVerificationToken(email)
    console.log('✅ Verification token created:', verificationToken)

    // Send verification email (or simulate in development)
    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      )
      return { success: "Confirmation email sent! Check console for verification link." }
    } catch (emailError) {
      console.error('📧 Email sending failed, but user created:', emailError)
      return { success: "User registered! Check console for verification link." }
    }
  } catch (error) {
    console.error('❌ Registration error:', error)
    return { error: "Registration failed. Please try again." }
  }
}
