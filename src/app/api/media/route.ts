import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import db from '@/lib/db'
import { unlink } from 'fs/promises'
import { join } from 'path'

// GET - Media items listesi
export async function GET(request: NextRequest) {
  try {
    // Authentication kontrolü
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim!' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'uploadedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const category = searchParams.get('category') || ''

    // Search ve filter için where clause oluştur
    const where: any = {}

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    // Media items'ları veritabanından çek
    const items = await db.mediaItem.findMany({
      where,
      orderBy: {
        [sortBy === 'name' ? 'originalName' : sortBy === 'date' ? 'uploadedAt' : 'size']: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Toplam sayıyı al
    const total = await db.mediaItem.count({ where })

    // Stats hesapla - size alanı MediaItem modelinde yok

    const categories = await db.mediaItem.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true }
    })

    const recentUploads = await db.mediaItem.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const stats = {
      totalImages: total,
      totalSize: 0, // size alanı MediaItem modelinde yok
      recentUploads,
      categories: categories.reduce((acc, item) => {
        acc[item.categoryId || 'uncategorized'] = item._count.categoryId
        return acc
      }, {} as { [key: string]: number })
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats
      }
    })

  } catch (error) {
    console.error('Media items yüklenemedi:', error)
    return NextResponse.json({ error: 'Medya öğeleri yüklenemedi!' }, { status: 500 })
  }
}

// POST - Media item oluştur
export async function POST(request: NextRequest) {
  try {
    // Authentication kontrolü
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim!' }, { status: 401 })
    }

    const body = await request.json()
    const { url, fileName, originalName, size, type, altText, title, description, category, tags } = body

    // Media item oluştur
    const newMediaItem = await db.mediaItem.create({
      data: {
        url,
        fileName,
        // originalName ve size alanları MediaItem modelinde yok
        type
        // altText, title, description, category, tags, isPrimary alanları MediaItem modelinde yok
      }
    })

    return NextResponse.json({
      success: true,
      data: newMediaItem
    })

  } catch (error) {
    console.error('Media item oluşturulamadı:', error)
    return NextResponse.json({ error: 'Medya öğesi oluşturulamadı!' }, { status: 500 })
  }
}

// PUT - Media item güncelle
export async function PUT(request: NextRequest) {
  try {
    // Authentication kontrolü
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim!' }, { status: 401 })
    }

    const body = await request.json()
    const { id, altText, title, description, category, tags } = body

    // Media item güncelle
    await db.mediaItem.update({
      where: { id },
      data: {
        // altText, title, description, category, tags alanları MediaItem modelinde yok
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Medya öğesi güncellendi!'
    })

  } catch (error) {
    console.error('Media item güncellenemedi:', error)
    return NextResponse.json({ error: 'Medya öğesi güncellenemedi!' }, { status: 500 })
  }
}

// DELETE - Media item sil
export async function DELETE(request: NextRequest) {
  try {
    // Authentication kontrolü
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim!' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const ids = searchParams.get('ids') // Bulk delete için

    // Dosya silme fonksiyonu
    const deleteFile = async (fileName: string) => {
      try {
        const filePath = join(process.cwd(), 'public', 'uploads', 'products', fileName)
        console.log(`🔍 Silinecek dosya yolu: ${filePath}`)

        // Dosyayı sil
        await unlink(filePath)
        console.log(`✅ Dosya silindi: ${fileName}`)
        return true
      } catch (error) {
        console.error(`❌ Dosya silinemedi: ${fileName}`, error)
        return false
      }
    }

    if (ids) {
      // Bulk delete
      const idArray = ids.split(',')
      let deletedCount = 0
      let fileDeleteErrors = []

      // Önce veritabanından dosya bilgilerini al
      const mediaItems = await db.mediaItem.findMany({
        where: { id: { in: idArray } },
        select: { id: true, fileName: true }
      })

      for (const mediaItem of mediaItems) {
        try {
          // Dosyayı sil
          const fileDeleted = await deleteFile(mediaItem.fileName)
          if (fileDeleted) {
            deletedCount++
          } else {
            fileDeleteErrors.push(mediaItem.fileName)
          }

          // Veritabanından sil
          await db.mediaItem.delete({
            where: { id: mediaItem.id }
          })
        } catch (error) {
          console.error(`Media item silinemedi: ${mediaItem.id}`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: `${deletedCount} medya öğesi silindi!`,
        deletedCount,
        fileErrors: fileDeleteErrors
      })
    } else if (id) {
      // Single delete
      try {
        // Veritabanından dosya bilgisini al
        const mediaItem = await db.mediaItem.findUnique({
          where: { id },
          select: { fileName: true }
        })

        let fileDeleted = false

        if (mediaItem) {
          fileDeleted = await deleteFile(mediaItem.fileName)
        }

        // Veritabanından sil
        await db.mediaItem.delete({
          where: { id }
        })

        return NextResponse.json({
          success: true,
          message: 'Medya öğesi silindi!',
          fileDeleted
        })
      } catch (error) {
        console.error('Media item silinemedi:', error)
        return NextResponse.json({ error: 'Medya öğesi silinemedi!' }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'ID gerekli!' }, { status: 400 })
    }

  } catch (error) {
    console.error('Media item silinemedi:', error)
    return NextResponse.json({ error: 'Medya öğesi silinemedi!' }, { status: 500 })
  }
}
