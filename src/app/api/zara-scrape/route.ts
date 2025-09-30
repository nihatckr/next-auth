import { NextRequest, NextResponse } from 'next/server';
import { zaraApiScraper } from '@/lib/zara-api-scraper';
import db from '@/lib/db';
import { ProductService } from '@/lib/product-service';
import { auth } from '@/auth';

/**
 * Ürünü "Tümünü Gör" kategorisi ile ilişkilendirir
 */
async function associateWithSeeAllCategory(productId: string, currentCategoryId: number, brandId: number) {
  try {
    // "Tümünü Gör" kategorisini bul veya oluştur
    let seeAllCategory = await db.category.findFirst({
      where: {
        name: 'Tümünü Gör',
        brandId: brandId
      }
    });

    if (!seeAllCategory) {
      seeAllCategory = await db.category.create({
        data: {
          name: 'Tümünü Gör',
          slug: 'tumunu-gor',
          brandId: brandId,
          isActive: true,
          isLeaf: true,
          level: 0
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
    // ✅ USER AUTHENTICATION
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { categoryId, apiId, testCount } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Get category and brand info
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: { brand: true }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    if (!category.brand.apiProductsUrl) {
      return NextResponse.json(
        { success: false, message: 'Zara API URL not configured for this category' },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting Zara API scraping for category: ${category.name}`);
    console.log(`🔍 Brand API Products URL: ${category.brand.apiProductsUrl}`);
    console.log(`🔍 Category API ID: ${category.apiId}`);

    // ✅ SCRAPING JOB OLUŞTUR
    const scrapingJob = await db.scrapingJob.create({
      data: {
        name: `Zara Scraping - ${category.name}`,
        type: 'CATEGORY',
        targetId: categoryId.toString(),
        targetName: category.name,
        status: 'RUNNING',



        progress: 0,

        userId: session.user.id
      }
    });

    console.log(`📋 Scraping job created: ${scrapingJob.id}`);

    // Use apiId from request or fallback to category.apiId
    const finalApiId = apiId || category.apiId;

    // Construct API URL with final apiId
    const apiUrl = category.brand.apiProductsUrl?.replace('{apiId}', finalApiId || '');
    console.log(`🔗 Constructed API URL: ${apiUrl}`);

    // Validate API URL
    if (!apiUrl || !finalApiId) {
      return NextResponse.json(
        {
          success: false,
          message: 'API URL or Category API ID is missing',
          details: {
            apiUrl: apiUrl,
            categoryApiId: category.apiId,
            requestApiId: apiId,
            finalApiId: finalApiId,
            brandApiProductsUrl: category.brand.apiProductsUrl
          }
        },
        { status: 400 }
      );
    }

    // Scrape products using ZaraApiScraper
    const products = await zaraApiScraper.scrapeCategoryProducts(
      apiUrl,
      testCount
    );

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No products found in the category. Please check if the Zara API URL is correct and contains products.'
      });
    }

    console.log(`📦 Found ${products.length} products from Zara API`);

    // Get Zara brand
    const zaraBrand = await db.brand.findFirst({
      where: { name: 'Zara' }
    });

    if (!zaraBrand) {
      return NextResponse.json(
        { success: false, message: 'Zara brand not found' },
        { status: 404 }
      );
    }

    // Save products to database using ProductService
    let savedCount = 0;
    const errors: string[] = [];

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
        const savedProduct = await ProductService.saveProduct(productData, zaraBrand.id, categoryId);

        if (savedProduct) {
          // Associate with "Tümünü Gör" category
          await associateWithSeeAllCategory(savedProduct.id, categoryId, zaraBrand.id);
          savedCount++;
        } else {
          console.log(`⚠️ Product skipped (likely duplicate): ${product.name}`);
        }

      } catch (error) {
        console.error(`❌ Error processing product ${product.name}:`, error);
        errors.push(`Failed to process product: ${product.name}`);
      }
    }

    console.log(`✅ Successfully saved ${savedCount} products`);

    return NextResponse.json({
      success: true,
      message: `Successfully scraped and saved ${savedCount} products from Zara API`,
      data: {
        totalProducts: products.length,
        savedProducts: savedCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('❌ Zara API scraping error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to scrape products from Zara API',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
