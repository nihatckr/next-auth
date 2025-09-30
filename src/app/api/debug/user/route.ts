import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Veritabanından kullanıcı bilgilerini al
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true, name: true }
    })

    return NextResponse.json({
      session: {
        user: session.user,
        expires: session.expires
      },
      database: {
        user: user
      }
    })
  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
