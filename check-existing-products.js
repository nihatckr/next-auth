const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function checkExistingProducts() {
  try {
    console.log('🔍 Mevcut ürünleri kontrol ediyorum...')

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        productCode: true,
        basePrice: true,
        createdAt: true
      }
    })

    console.log(`📦 Toplam ${products.length} ürün bulundu:`)

    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Ürün:`)
      console.log(`   - ID: ${product.id}`)
      console.log(`   - Ad: ${product.name}`)
      console.log(`   - Slug: ${product.slug}`)
      console.log(`   - Product Code: ${product.productCode}`)
      console.log(`   - Fiyat: ${product.basePrice}`)
      console.log(`   - Oluşturulma: ${product.createdAt}`)
    })

    // Error.md'deki ürün ID'lerini kontrol et
    const errorLogIds = [
      '476556327', // CHAMPION ® X ZARA YAMALI OXFORD GÖMLEK
      '454736620', // DOKULU OXFORD GÖMLEK
      '452695835', // PAMUKLU KETEN GÖMLEK
      '463495955', // RENKLİ DENİM GÖMLEK
      '480186211', // DÖKÜMLÜ RELAXED FIT GÖMLEK
      '452720308', // STREÇ GÖMLEK
      '480487932', // ÇİZGİLİ YAMALI CHAMPION ® X ZARA GÖMLEK
      '452730693'  // DOKULU STREÇ GÖMLEK
    ]

    console.log('\n🔍 Error.md\'deki ID\'leri kontrol ediyorum:')
    for (const id of errorLogIds) {
      const product = await prisma.product.findUnique({
        where: { id: id },
        select: { id: true, name: true, slug: true, productCode: true }
      })

      if (product) {
        console.log(`✅ ID ${id} bulundu: ${product.name}`)
      } else {
        console.log(`❌ ID ${id} bulunamadı`)
      }
    }

  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingProducts()
