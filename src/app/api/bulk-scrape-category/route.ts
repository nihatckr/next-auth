import { NextRequest, NextResponse } from 'next/server';
import { zaraApiScraper } from '@/lib/zara-api-scraper';
import { pullBearApiScraper } from '@/lib/pullbear-api-scraper';
import { parseBrandApiConfig, buildApiUrl } from '@/lib/brand-api-config';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { categoryId, categoryName } = await request.json();

    if (!categoryId || !categoryName) {
      return NextResponse.json({
        success: false,
        message: 'Category ID and Category Name are required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting bulk scraping for category: ${categoryName} (ID: ${categoryId})`);

    // Get the parent category with brand API configuration
    const parentCategory = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            apiBaseUrl: true,
            apiConfig: true
          }
        },
        subCategories: true
      }
    });

    if (!parentCategory) {
      return NextResponse.json({
        success: false,
        message: 'Parent category not found'
      }, { status: 404 });
    }

    // Parse brand API configuration
    const apiConfig = parseBrandApiConfig(parentCategory.brand?.apiConfig);

    // Find all leaf subcategories that have API IDs
    const leafSubcategories = await db.category.findMany({
      where: {
        parentId: categoryId,
        isLeaf: true,
        isActive: true,
        apiId: { not: null } // Schema'da apiId olarak değişti
      },
      include: {
        brand: true
      }
    });

    console.log(`📂 Found ${leafSubcategories.length} leaf subcategories with API IDs under ${categoryName}`);

    if (leafSubcategories.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No leaf subcategories with API IDs found under ${categoryName}`
      }, { status: 400 });
    }

    let totalProductsScraped = 0;
    let totalProductsCreated = 0;
    let totalProductsUpdated = 0;
    let categoriesProcessed = 0;

    // Process each leaf subcategory
    for (const subcategory of leafSubcategories) {
      try {
        console.log(`🔄 Processing subcategory: ${subcategory.name} (ID: ${subcategory.id})`);

        let scrapingResult;

        // Build API URL using brand configuration
        const categoryUrl = buildApiUrl(apiConfig, 'categoryProducts', {
          categoryId: subcategory.apiId!
        });

        if (!categoryUrl) {
          console.log(`⚠️ Could not build API URL for subcategory: ${subcategory.name}`);
          continue;
        }

        console.log(`🌐 Using API URL: ${categoryUrl}`);

        if (subcategory.brand.name === 'Zara') {
          // Use Zara scraper with configured URL
          scrapingResult = await zaraApiScraper.scrapeCategoryProducts(categoryUrl, null);
        } else if (subcategory.brand.name === 'Pull & Bear') {
          // Use Pull & Bear scraper with configured URL
          scrapingResult = await pullBearApiScraper.scrapeCategoryProducts(subcategory.apiId!, null);
        } else {
          console.log(`⚠️ Skipping unsupported brand: ${subcategory.brand.name}`);
          continue;
        }

        if (scrapingResult && scrapingResult.length > 0) {
          console.log(`📦 Found ${scrapingResult.length} products in ${subcategory.name}`);

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
                    brand: { connect: { id: subcategory.brand.id } },
                    productCategories: {
                      create: [{
                        categoryId: subcategory.id
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
              console.error(`Error processing product in ${subcategory.name}:`, error);
            }
          }
        } else {
          console.log(`⚠️ No products found in subcategory: ${subcategory.name}`);
        }

        categoriesProcessed++;
        console.log(`✅ Completed processing subcategory: ${subcategory.name}`);
      } catch (error) {
        console.error(`Error processing subcategory ${subcategory.name}:`, error);
      }
    }

    console.log(`🎉 Bulk scraping completed for ${categoryName}: ${totalProductsScraped} products scraped`);

    return NextResponse.json({
      success: true,
      message: `Successfully scraped ${categoryName}: ${totalProductsScraped} products processed`,
      data: {
        totalProductsScraped,
        totalProductsCreated,
        totalProductsUpdated,
        categoriesProcessed,
        totalCategories: leafSubcategories.length
      }
    });

  } catch (error) {
    console.error('Error in bulk-scrape-category API:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
