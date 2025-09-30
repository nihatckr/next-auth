const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugProducts() {
  try {
    console.log('🔍 Veritabanındaki ürünleri kontrol ediyorum...')

    // Tüm ürünleri getir
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        colorVariants: {
          include: {
            sizes: true
          }
        },
        productCategories: {
          include: {
            category: true
          }
        }
      }
    })

    console.log(`📦 Toplam ${products.length} ürün bulundu`)

    if (products.length === 0) {
      console.log('❌ Hiç ürün bulunamadı!')

      // Brand'leri kontrol et
      const brands = await prisma.brand.findMany()
      console.log(`🏷️ Markalar: ${brands.length}`)
      brands.forEach(brand => {
        console.log(`  - ${brand.name} (ID: ${brand.id})`)
      })

      // Kategorileri kontrol et
      const categories = await prisma.category.findMany()
      console.log(`📂 Kategoriler: ${categories.length}`)
      categories.forEach(category => {
        console.log(`  - ${category.name} (ID: ${category.id}) - Brand: ${category.brandId}`)
      })

      return
    }

    // Ürünleri listele
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Ürün:`)
      console.log(`   - ID: ${product.id}`)
      console.log(`   - Ad: ${product.name}`)
      console.log(`   - Slug: ${product.slug}`)
      console.log(`   - Fiyat: ${product.basePrice}`)
      console.log(`   - Marka: ${product.brand?.name || 'Bilinmiyor'}`)
      console.log(`   - Renk Varyantları: ${product.colorVariants?.length || 0}`)
      console.log(`   - Kategoriler: ${product.productCategories?.length || 0}`)

      if (product.colorVariants && product.colorVariants.length > 0) {
        console.log(`   - İlk Renk: ${product.colorVariants[0].colorName}`)
        console.log(`   - İlk Renk Bedenleri: ${product.colorVariants[0].sizes?.length || 0}`)
      }
    })

    // API endpoint'ini test et
    console.log('\n🌐 API endpoint test ediliyor...')
    try {
      const response = await fetch('http://localhost:3000/api/debug/user')
      const data = await response.json()
      console.log('✅ API erişilebilir:', data)
    } catch (error) {
      console.log('❌ API erişilemiyor:', error.message)
    }

  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugProducts()
