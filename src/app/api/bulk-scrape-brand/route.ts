import { NextRequest, NextResponse } from 'next/server';
import { zaraApiScraper } from '@/lib/zara-api-scraper';
import { pullBearApiScraper } from '@/lib/pullbear-api-scraper';
import { parseBrandApiConfig, buildApiUrl } from '@/lib/brand-api-config';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { brandId, brandName } = await request.json();

    if (!brandId || !brandName) {
      return NextResponse.json({
        success: false,
        message: 'Brand ID and Brand Name are required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting bulk scraping for brand: ${brandName} (ID: ${brandId})`);

    // Get brand with API configuration
    const brand = await db.brand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        name: true,
        apiBaseUrl: true,
        apiConfig: true
      }
    });

    if (!brand) {
      return NextResponse.json({
        success: false,
        message: 'Brand not found'
      }, { status: 404 });
    }

    // Parse brand API configuration
    const apiConfig = parseBrandApiConfig(brand.apiConfig);

    // Get all leaf categories for this brand that have API IDs
    const leafCategories = await db.category.findMany({
      where: {
        brandId: brandId,
        isLeaf: true,
        isActive: true,
        apiId: { not: null } // Schema'da apiId olarak değişti
      },
      include: {
        brand: true
      }
    });

    console.log(`📂 Found ${leafCategories.length} leaf categories with API IDs for ${brandName}`);

    if (leafCategories.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No leaf categories with API IDs found for ${brandName}`
      }, { status: 400 });
    }

    let totalProductsScraped = 0;
    let totalProductsCreated = 0;
    let totalProductsUpdated = 0;
    let categoriesProcessed = 0;

    // Process each leaf category
    for (const category of leafCategories) {
      try {
        console.log(`🔄 Processing category: ${category.name} (ID: ${category.id})`);

        let scrapingResult;

        // Build API URL using brand configuration
        const categoryUrl = buildApiUrl(apiConfig, 'categoryProducts', {
          categoryId: category.apiId!
        });

        if (!categoryUrl) {
          console.log(`⚠️ Could not build API URL for category: ${category.name}`);
          continue;
        }

        console.log(`🌐 Using API URL: ${categoryUrl}`);

        if (category.brand.name === 'Zara') {
          // Use Zara scraper with configured URL
          scrapingResult = await zaraApiScraper.scrapeCategoryProducts(categoryUrl, null);
        } else if (category.brand.name === 'Pull & Bear') {
          // Use Pull & Bear scraper with configured URL
          scrapingResult = await pullBearApiScraper.scrapeCategoryProducts(category.apiId!, null);
        } else {
          console.log(`⚠️ Skipping unsupported brand: ${category.brand.name}`);
          continue;
        }

        if (scrapingResult && scrapingResult.length > 0) {
          console.log(`📦 Found ${scrapingResult.length} products in ${category.name}`);

          // Process each product
          for (const product of scrapingResult) {
            try {
              // Check if product already exists
              const existingProduct = await db.product.findFirst({
                where: {
                  OR: [
                    { productCode: product.productCode },
                    { url: product.url }
                  ]
                }
              });

              if (existingProduct) {
                // Update existing product
                await db.product.update({
                  where: { id: existingProduct.id },
                  data: {
                    name: product.name,
                    basePrice: product.price,
                    currencyCode: product.currency,
                    url: product.url,
                    description: product.description || '',
                    metaTitle: product.metaTitle,
                    metaDescription: product.metaDescription,
                    composition: product.composition,
                    careInstructions: product.careInstructions,
                    updatedAt: new Date()
                  }
                });
                totalProductsUpdated++;
              } else {
                // Create new product
                const newProduct = await db.product.create({
                  data: {
                    id: product.id || `${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
                    name: product.name,
                    slug: `${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
                    description: product.description || '',
                    metaTitle: product.metaTitle,
                    metaDescription: product.metaDescription,
                    basePrice: product.price,
                    currencyCode: product.currency,
                    url: product.url,
                    productCode: product.productCode,
                    composition: product.composition,
                    careInstructions: product.careInstructions,
                    brand: { connect: { id: brandId } },
                    productCategories: {
                      create: [{
                        categoryId: category.id
                      }]
                    },
                    colorVariants: {
                      create: product.colors.map((color: any, index: number) => ({
                        id: `${product.id}-${color.code}-${index}`,
                        colorName: color.name,
                        colorCode: color.code,
                        hexColor: color.backgroundColor || '#000000',
                        sku: color.sku || `${product.productCode}-${color.code}`,
                        price: product.price
                      }))
                    }
                  }
                });
                totalProductsCreated++;
              }

              totalProductsScraped++;
            } catch (error) {
              console.error(`Error processing product in ${category.name}:`, error);
            }
          }
        } else {
          console.log(`⚠️ No products found in category: ${category.name}`);
        }

        categoriesProcessed++;
        console.log(`✅ Completed processing category: ${category.name}`);
      } catch (error) {
        console.error(`Error processing category ${category.name}:`, error);
      }
    }

    console.log(`🎉 Bulk scraping completed for ${brandName}: ${totalProductsScraped} products scraped`);

    return NextResponse.json({
      success: true,
      message: `Successfully scraped ${brandName}: ${totalProductsScraped} products processed`,
      data: {
        totalProductsScraped,
        totalProductsCreated,
        totalProductsUpdated,
        categoriesProcessed,
        totalCategories: leafCategories.length
      }
    });

  } catch (error) {
    console.error('Error in bulk-scrape-brand API:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
