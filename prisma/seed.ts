
import db from '@/lib/db'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('🌱 Seed işlemi başlatılıyor...')

  try {
    // 1. ADMIN KULLANICISI OLUŞTUR
    console.log('👤 Admin kullanıcısı oluşturuluyor...')

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash('12345', 12)

    const adminUser = await db.user.upsert({
      where: { email: 'ckr.nihat@gmail.com' },
      update: {
        name: 'Nihat Admin',
        email: 'ckr.nihat@gmail.com',
        password: hashedPassword,
        role: 'ADMIN',
        image: null,
        emailVerified: new Date(),
        updatedAt: new Date()
      },
      create: {
        id: 'admin-user-001', // NextAuth session ID'si ile eşleşsin
        name: 'Nihat Admin',
        email: 'ckr.nihat@gmail.com',
        password: hashedPassword,
        role: 'ADMIN',
        image: null,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`✅ Admin kullanıcısı oluşturuldu: ${adminUser.email}`)

    // JSON dosyasını oku
    const dataPath = path.join(process.cwd(), 'data-export.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const data = JSON.parse(rawData)

    console.log('📊 Veri yükleme başlatılıyor...')
    console.log(`   - Brands: ${data.brands?.length || 0}`)
    console.log(`   - Categories: ${data.categories?.length || 0}`)
    console.log(`   - Products: ${data.products?.length || 0}`)

    // 1. BRANDS - Mevcut schema'ya uygun şekilde
    if (data.brands && data.brands.length > 0) {
      console.log('🏷️  Brands yükleniyor...')

      for (const brandData of data.brands) {
        await db.brand.upsert({
          where: { slug: brandData.slug },
          update: {
            name: brandData.name,
            slug: brandData.slug,
            description: brandData.description,
            isActive: brandData.isActive,
            url: brandData.url,
            // API konfigürasyonu - schema'ya uygun
            apiBaseUrl: brandData.url,
            apiConfig: JSON.stringify({
              logo: brandData.logo,
              originalData: {
                logo: brandData.logo,
                createdAt: brandData.createdAt,
                updatedAt: brandData.updatedAt
              }
            }),
            // User tracking
            createdById: adminUser.id,
            updatedById: adminUser.id
          },
          create: {
            name: brandData.name,
            slug: brandData.slug,
            description: brandData.description,
            isActive: brandData.isActive,
            url: brandData.url,
            // API konfigürasyonu
            apiBaseUrl: brandData.url,
            apiConfig: JSON.stringify({
              logo: brandData.logo,
              originalData: {
                logo: brandData.logo,
                createdAt: brandData.createdAt,
                updatedAt: brandData.updatedAt
              }
            }),
            // Admin kullanıcısını createdBy olarak ekle
            createdById: adminUser.id,
            updatedById: adminUser.id,
            createdAt: new Date(brandData.createdAt),
            updatedAt: new Date(brandData.updatedAt)
          }
        })
      }
      console.log(`✅ ${data.brands.length} brand yüklendi`)
    }

    // 2. CATEGORIES - Mevcut schema'ya uygun şekilde
    if (data.categories && data.categories.length > 0) {
      console.log('📂 Categories yükleniyor...')

      // Önce mevcut brand'leri al
      const existingBrands = await db.brand.findMany()
      const existingBrandIds = existingBrands.map(b => b.id)

      // Sadece mevcut brand'lere ait kategorileri filtrele
      const validCategories = data.categories.filter((cat: any) => existingBrandIds.includes(cat.brandId))

      // Önce parent olmayan kategorileri yükle (parentId: null)
      const parentCategories = validCategories.filter((cat: any) => !cat.parentId)
      const childCategories = validCategories.filter((cat: any) => cat.parentId)

      // Parent kategorileri yükle
      for (const categoryData of parentCategories) {
        await db.category.upsert({
          where: {
            slug_brandId: {
              slug: categoryData.slug,
              brandId: categoryData.brandId
            }
          },
          update: {
            name: categoryData.text, // JSON'da 'text' olarak geliyor, schema'da 'name'
            slug: categoryData.slug,
            level: categoryData.level,
            sortOrder: categoryData.sortOrder,
            isActive: categoryData.isActive,
            gender: categoryData.gender,
            brandId: categoryData.brandId,
            parentId: categoryData.parentId,
            // API scraping alanları
            apiId: categoryData.categoryApiId, // JSON'da 'categoryApiId' olarak geliyor
            isLeaf: categoryData.productCount ? categoryData.productCount > 0 : false,
            // User tracking
            createdById: adminUser.id,
            updatedById: adminUser.id
          },
          create: {
            name: categoryData.text,
            slug: categoryData.slug,
            level: categoryData.level,
            sortOrder: categoryData.sortOrder,
            isActive: categoryData.isActive,
            gender: categoryData.gender,
            brandId: categoryData.brandId,
            parentId: categoryData.parentId,
            // API scraping alanları
            apiId: categoryData.categoryApiId,
            isLeaf: categoryData.productCount ? categoryData.productCount > 0 : false,
            // Admin kullanıcısını createdBy olarak ekle
            createdById: adminUser.id,
            updatedById: adminUser.id,
            createdAt: new Date(categoryData.createdAt),
            updatedAt: new Date(categoryData.updatedAt)
          }
        })
      }
      console.log(`✅ ${parentCategories.length} parent category yüklendi`)

      // Sonra child kategorileri yükle - sadece mevcut parent'ları olanları
      const existingCategories = await db.category.findMany()
      const existingCategoryIds = existingCategories.map(c => c.id)
      const validChildCategories = childCategories.filter((cat: any) =>
        cat.parentId && existingCategoryIds.includes(cat.parentId)
      )

      for (const categoryData of validChildCategories) {
        await db.category.upsert({
          where: {
            slug_brandId: {
              slug: categoryData.slug,
              brandId: categoryData.brandId
            }
          },
          update: {
            name: categoryData.text, // JSON'da 'text' olarak geliyor, schema'da 'name'
            slug: categoryData.slug,
            level: categoryData.level,
            sortOrder: categoryData.sortOrder,
            isActive: categoryData.isActive,
            gender: categoryData.gender,
            brandId: categoryData.brandId,
            parentId: categoryData.parentId,
            // API scraping alanları
            apiId: categoryData.categoryApiId, // JSON'da 'categoryApiId' olarak geliyor
            isLeaf: categoryData.productCount ? categoryData.productCount > 0 : false,
            // User tracking
            createdById: adminUser.id,
            updatedById: adminUser.id
          },
          create: {
            name: categoryData.text,
            slug: categoryData.slug,
            level: categoryData.level,
            sortOrder: categoryData.sortOrder,
            isActive: categoryData.isActive,
            gender: categoryData.gender,
            brandId: categoryData.brandId,
            parentId: categoryData.parentId,
            // API scraping alanları
            apiId: categoryData.categoryApiId,
            isLeaf: categoryData.productCount ? categoryData.productCount > 0 : false,
            // Admin kullanıcısını createdBy olarak ekle
            createdById: adminUser.id,
            updatedById: adminUser.id,
            createdAt: new Date(categoryData.createdAt),
            updatedAt: new Date(categoryData.updatedAt)
          }
        })
      }
      console.log(`✅ ${validChildCategories.length} child category yüklendi`)
      console.log(`✅ Toplam ${parentCategories.length + validChildCategories.length} category yüklendi`)
    }

    // 3. PRODUCTS - Mevcut schema'ya uygun şekilde
    if (data.products && data.products.length > 0) {
      console.log('🛍️  Products yükleniyor...')

      // Mevcut brand'leri tekrar al
      const existingBrands = await db.brand.findMany()
      const existingBrandIds = existingBrands.map(b => b.id)

      // Sadece mevcut brand'lere ait product'ları filtrele
      const validProducts = data.products.filter((prod: any) => existingBrandIds.includes(prod.brandId))

      for (const productData of validProducts) {
        await db.product.upsert({
          where: { slug: productData.slug },
          update: {
            name: productData.name,
            slug: productData.slug,
            basePrice: productData.basePrice,
            currencyCode: productData.currencyCode,
            url: productData.url,
            description: productData.description,
            metaTitle: productData.metaTitle,
            metaDescription: productData.metaDescription,
            productCode: productData.productCode,
            composition: productData.composition,
            careInstructions: productData.careInstructions,
            brandId: productData.brandId,

            // User tracking
            createdById: adminUser.id,
            updatedById: adminUser.id,
            // 'id' alanı zorunluysa, productData.id varsa ekle
            ...(productData.id && { id: productData.id })
          },
          create: {
            // 'id' alanı zorunluysa, productData.id varsa ekle
            ...(productData.id && { id: productData.id }),
            name: productData.name,
            slug: productData.slug,
            basePrice: productData.basePrice,
            currencyCode: productData.currencyCode,
            url: productData.url,
            description: productData.description,
            metaTitle: productData.metaTitle,
            metaDescription: productData.metaDescription,
            productCode: productData.productCode,
            composition: productData.composition,
            careInstructions: productData.careInstructions,
            brandId: productData.brandId,


            // Admin kullanıcısını createdBy olarak ekle
            createdById: adminUser.id,
            updatedById: adminUser.id,
            createdAt: new Date(productData.createdAt),
            updatedAt: new Date(productData.updatedAt)
          }
        })
      }
      console.log(`✅ ${validProducts.length} product yüklendi`)
    }

    console.log('🎉 Seed işlemi başarıyla tamamlandı!')
    console.log('📈 Yüklenen veriler:')
    console.log(`   - Brands: ${data.brands?.length || 0}`)
    console.log(`   - Categories: ${data.categories?.length || 0}`)
    console.log(`   - Products: ${data.products?.length || 0}`)

  } catch (error) {
    console.error('❌ Seed işlemi sırasında hata:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi başarısız:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
