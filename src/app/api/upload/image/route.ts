import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    // Authentication kontrolü
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim!' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı!' }, { status: 400 })
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Sadece resim dosyaları yüklenebilir!' }, { status: 400 })
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 5MB\'dan büyük olamaz!' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Unique dosya adı oluştur
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Uploads klasörünü oluştur
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadsDir, { recursive: true })

    // Dosyayı kaydet
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Public URL oluştur
    const publicUrl = `/uploads/products/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Dosya yükleme hatası!' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE endpoint çağrıldı')

    const body = await request.json()
    console.log('🗑️ Request body:', body)

    const { fileName } = body

    if (!fileName) {
      console.log('❌ Dosya adı bulunamadı')
      return NextResponse.json({ error: 'Dosya adı gerekli!' }, { status: 400 })
    }

    // Dosyayı sil
    const { unlink } = await import('fs/promises')
    const { join } = await import('path')

    const filePath = join(process.cwd(), 'public', 'uploads', 'products', fileName)
    console.log(`🗑️ Silinecek dosya: ${filePath}`)

    try {
      await unlink(filePath)
      console.log(`✅ Dosya silindi: ${fileName}`)
      return NextResponse.json({ success: true, message: 'Dosya silindi!' })
    } catch (error) {
      console.error(`❌ Dosya silinemedi: ${fileName}`, error)
      return NextResponse.json({ error: 'Dosya silinemedi!' }, { status: 404 })
    }

  } catch (error) {
    console.error('Image delete error:', error)
    return NextResponse.json({ error: 'Dosya silme hatası!' }, { status: 500 })
  }
}
