import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import db from '@/lib/db'

// Admin statistics API
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Admin kontrolü
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 })
    }

    // Paralel olarak istatistikleri al
    const [
      totalUsers,
      verifiedUsers,
      newUsersToday,
      adminUsers,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { emailVerified: { not: null } } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      db.user.count({ where: { role: 'ADMIN' } }),
    ])

    const stats = {
      totalUsers,
      verifiedUsers,
      newUsersToday,
      adminUsers,
      verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      securityScore: 96, // Sabit değer, daha sonra hesaplanabilir
      systemStatus: 'online' as const,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'İstatistik alınamadı' }, { status: 500 })
  }
}
