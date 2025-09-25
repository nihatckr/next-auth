import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import db from '@/lib/db'
import * as z from 'zod'

// Profile güncelleme şeması
const ProfileUpdateSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir').max(100, 'İsim çok uzun'),
  image: z.string().url('Geçerli URL gereklidir').optional().or(z.literal('')),
})

// Kullanıcı profilini getir
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Kullanıcı profilini güncelle
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = ProfileUpdateSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({
        error: 'Geçersiz veri',
        details: validatedData.error.errors
      }, { status: 400 })
    }

    const { name, image } = validatedData.data

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(image !== undefined && { image: image || null }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profil başarıyla güncellendi'
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 })
  }
}
