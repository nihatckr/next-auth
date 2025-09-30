import { NextRequest, NextResponse } from 'next/server'
import { pullBearApiScraper } from '@/lib/pullbear-api-scraper'
import db from '@/lib/db'
import { ProductService } from '@/lib/product-service'

/**
 * Ürünü "Tümünü Gör" kategorisi ile ilişkilendirir
 */
async function associateWithSeeAllCategory(productId: string, currentCategoryId: number, brandId: number) {
  try {
    // Mevcut kategorinin parent'ını bul
    const currentCategory = await db.category.findUnique({
      where: { id: currentCategoryId },
      include: { parent: true }
    });

    if (!currentCategory?.parent) {
      console.log(`⚠️ No parent category found for category ${currentCategoryId}`);
      return;
    }

    // "Tümünü Gör" kategorisini bul veya oluştur
    let seeAllCategory = await db.category.findFirst({
      where: {
        name: 'Tümünü Gör',
        brandId: brandId,
        parentId: currentCategory.parent.id
      }
    });

    if (!seeAllCategory) {
      seeAllCategory = await db.category.create({
        data: {
          name: 'Tümünü Gör',
          slug: 'tumunu-gor',
          brandId: brandId,
          parentId: currentCategory.parent.id,
          isActive: true,
          isLeaf: true,
          level: currentCategory.parent.level + 1
        }
      });
    }

    // Ürünü "Tümünü Gör" kategorisi ile ilişkilendir
    await db.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: productId,
          categoryId: seeAllCategory.id
        }
      },
      update: {},
      create: {
        productId: productId,
        categoryId: seeAllCategory.id
      }
    });

    console.log(`✅ Product ${productId} associated with "Tümünü Gör" category`);
  } catch (error) {
    console.error('❌ Error associating product with "Tümünü Gör" category:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { categoryId, testCount } = await request.json()

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Get category and brand info
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: { brand: true }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      )
    }

    if (!category.apiId) {
      return NextResponse.json(
        { success: false, message: 'Pull & Bear API URL not configured for this category' },
        { status: 400 }
      )
    }

    console.log(`🔄 Starting Pull & Bear API scraping for category: ${category.name}`)

    // Scrape products using PullBearApiScraper
    const products = await pullBearApiScraper.scrapeCategoryProducts(
      category.apiId,
      testCount
    )

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No products found in the category. Please check if the Pull & Bear API URL is correct and contains products.'
      })
    }

    console.log(`📦 Found ${products.length} products from Pull & Bear API`)

    // Get Pull & Bear brand
    const pullBearBrand = await db.brand.findFirst({
      where: { name: 'Pull & Bear' }
    })

    if (!pullBearBrand) {
      return NextResponse.json(
        { success: false, message: 'Pull & Bear brand not found' },
        { status: 404 }
      )
    }

    // Save products to database using ProductService
    let createdCount = 0
    let updatedCount = 0

    // Process each product using ProductService
    for (const product of products) {
      try {
        // Transform product data for ProductService
        const productData = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          primaryImage: product.primaryImage,
          productCode: product.productCode || product.id,
          description: product.description,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          composition: product.composition,
          careInstructions: product.careInstructions,
          url: product.url,
          variants: product.colors.map((color, index) => ({
            id: `variant-${index}`,
            colorName: color.name,
            colorCode: color.code,
            backgroundColor: color.backgroundColor || '#000000',
            sku: color.sku || `${product.id}-${color.code}`,
            price: product.price,
            availability: 'IN_STOCK',
            images: color.images.map((url, imgIndex) => ({
              url: url,
              altText: '',
              order: imgIndex
            })),
            sizes: product.sizes.map(size => ({
              id: `size-${index}-${product.sizes.indexOf(size)}`,
              size: size,
              availability: 'IN_STOCK',
              isSelected: false,
              originalOrder: product.sizes.indexOf(size)
            }))
          }))
        };

        // Use ProductService to save/update product
        const savedProduct = await ProductService.saveProduct(productData, pullBearBrand.id, categoryId);

        if (savedProduct) {
          // Associate with "Tümünü Gör" category
          await associateWithSeeAllCategory(savedProduct.id, categoryId, pullBearBrand.id);

          // Check if it was an update or create
          const isUpdate = await db.product.findFirst({
            where: { productCode: product.productCode },
            select: { createdAt: true, updatedAt: true }
          });

          if (isUpdate && isUpdate.createdAt.getTime() !== isUpdate.updatedAt.getTime()) {
            updatedCount++;
          } else {
            createdCount++;
          }
        }

      } catch (error) {
        console.error(`❌ Error processing product ${product.name}:`, error)
      }
    }

    console.log(`✅ Successfully processed ${createdCount + updatedCount} products`)

    return NextResponse.json({
      success: true,
      message: `Successfully scraped and saved ${createdCount + updatedCount} products from Pull & Bear API`,
      data: {
        totalProducts: products.length,
        createdProducts: createdCount,
        updatedProducts: updatedCount
      }
    })

  } catch (error) {
    console.error('❌ Pull & Bear API scraping error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to scrape products from Pull & Bear API',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
