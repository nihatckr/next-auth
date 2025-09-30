import { NextRequest, NextResponse } from 'next/server';
import { zaraApiScraper } from '@/lib/zara-api-scraper';
import { pullBearApiScraper } from '@/lib/pullbear-api-scraper';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { seeAllCategoryId, testCount } = await request.json();

    if (!seeAllCategoryId) {
      return NextResponse.json({
        success: false,
        message: 'See All Category ID is required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting sibling categories scraping for "Tümünü Gör" category ${seeAllCategoryId}`);
    if (testCount) {
      console.log(`🧪 Test mode: Limiting to ${testCount} products per category`);
    }

    // Get the "Tümünü Gör" category
    const seeAllCategory = await db.category.findUnique({
      where: { id: seeAllCategoryId },
      include: {
        parent: true,
        brand: true
      }
    });

    if (!seeAllCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    // Find sibling categories (same parent, same level, excluding "Tümünü Gör")
    const siblingCategories = await db.category.findMany({
      where: {
        parentId: seeAllCategory.parentId,
        level: seeAllCategory.level,
        id: { not: seeAllCategoryId },
        apiId: { not: null },
        isActive: true
      },
      include: {
        brand: true
      }
    });

    console.log(`📂 Found ${siblingCategories.length} sibling categories to scrape`);

    if (siblingCategories.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No sibling categories with API IDs found'
      }, { status: 400 });
    }

    let totalProductsProcessed = 0;
    let totalProductsUpdated = 0;

    // Process each sibling category
    for (const siblingCategory of siblingCategories) {
      try {
        console.log(`🔄 Processing sibling category: ${siblingCategory.name} (ID: ${siblingCategory.id})`);

        // Build API URL based on brand
        let categoryUrl: string;
        if (siblingCategory.brand.name === 'Zara') {
          categoryUrl = `https://www.zara.com/tr/tr/category/${siblingCategory.apiId}/products?ajax=true`;
        } else if (siblingCategory.brand.name === 'Pull & Bear') {
          // Pull & Bear için farklı URL formatı
          categoryUrl = `https://www.pullandbear.com/itxrest/3/catalog/store/25009521/20309457/category/${siblingCategory.apiId}/product?languageId=-43&showProducts=false&priceFilter=true&appId=1`;
        } else {
          console.log(`⚠️ Skipping unsupported brand: ${siblingCategory.brand.name}`);
          continue;
        }

        // Scrape products from the sibling category
        let products;
        if (siblingCategory.brand.name === 'Zara') {
          products = await zaraApiScraper.scrapeCategoryProducts(categoryUrl, testCount);
        } else if (siblingCategory.brand.name === 'Pull & Bear') {
          // Pull & Bear için pullbear-scrape endpoint'ini kullan
          console.log(`🔄 Calling Pull & Bear scraper for sibling category: ${siblingCategory.name}`);
          const pullBearResponse = await fetch('/api/pullbear-scrape', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              categoryId: siblingCategory.id,
              testCount: testCount
            }),
          });

          const pullBearResult = await pullBearResponse.json();
          if (pullBearResult.success) {
            console.log(`✅ Pull & Bear scraping completed for ${siblingCategory.name}`);
            // Pull & Bear scraper zaten ürünleri kaydediyor, burada sadece devam ediyoruz
            continue;
          } else {
            console.error(`❌ Pull & Bear scraping failed for ${siblingCategory.name}:`, pullBearResult.message);
            continue;
          }
        } else {
          console.log(`⚠️ Unsupported brand: ${siblingCategory.brand.name}`);
          continue;
        }

        if (!products || products.length === 0) {
          console.log(`⚠️ No products found in sibling category: ${siblingCategory.name}`);
          continue;
        }

        console.log(`📦 Found ${products.length} products in ${siblingCategory.name}`);

        // Process each product and associate with "Tümünü Gör" category
        for (const product of products) {
          try {
            // Check if product already exists
            const existingProduct = await db.product.findFirst({
              where: {
                OR: [
                  { id: product.id },
                  { url: product.url },
                  { productCode: product.productCode }
                ]
              }
            });

            if (existingProduct) {
              // Check if product is already associated with "Tümünü Gör" category
              const existingAssociation = await db.productCategory.findFirst({
                where: {
                  productId: existingProduct.id,
                  categoryId: seeAllCategoryId
                }
              });

              if (!existingAssociation) {
                // Associate existing product with "Tümünü Gör" category
                await db.productCategory.create({
                  data: {
                    productId: existingProduct.id,
                    categoryId: seeAllCategoryId
                  }
                });
                console.log(`🔗 Associated existing product with "Tümünü Gör": ${product.name}`);
              }

              // Update existing product
              await db.product.update({
                where: { id: existingProduct.id },
                data: {
                  name: product.name,
                  basePrice: product.price,
                  updatedAt: new Date(),
                  productCode: product.productCode,
                  description: product.description,
                  metaTitle: product.metaTitle,
                  metaDescription: product.metaDescription,
                  composition: product.composition,
                  careInstructions: product.careInstructions,
                  url: product.url,

                }
              });

              totalProductsUpdated++;
            } else {
              // Create new product and associate with "Tümünü Gör" category
              await db.product.create({
                data: {
                  id: product.id,
                  name: product.name,
                  slug: `${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
                  description: product.description || '',
                  metaTitle: product.metaTitle,
                  metaDescription: product.metaDescription,
                  basePrice: product.price,

                  currencyCode: product.currency,
                  url: product.url,



                  updatedAt: new Date(),

                  productCode: product.productCode,
                  composition: product.composition,
                  careInstructions: product.careInstructions,
                  brandId: seeAllCategory.brandId,
                  productCategories: {
                    create: [{
                      categoryId: seeAllCategoryId
                    }]
                  },
                  colorVariants: {
                    create: product.colors.map((color, index) => ({
                      // id alanı zorunlu olduğu için ekleniyor
                      id: `${product.id}-${color.code}`,
                      colorName: color.name,
                      colorCode: color.code,
                      backgroundColor: color.backgroundColor || '#000000',
                      sku: color.sku || `${product.id}-${color.code}`,
                      price: product.price,

                      currencyCode: product.currency,
                      images: {
                        create: color.images.map((image, imgIndex) => ({
                          url: image,
                          altText: `${product.name} - ${color.name} - ${imgIndex + 1}`,
                          sortOrder: imgIndex
                        }))
                      },
                      sizes: {
                        create: product.sizes.map((size, sizeIndex) => ({
                          size: size,
                          sortOrder: sizeIndex
                        }))
                      }
                    }))
                  }
                }
              });

              totalProductsProcessed++;
            }
          } catch (productError) {
            console.error(`❌ Error processing product ${product.name}:`, productError);
          }
        }

        console.log(`✅ Completed processing ${siblingCategory.name}: ${products.length} products`);
      } catch (categoryError) {
        console.error(`❌ Error processing sibling category ${siblingCategory.name}:`, categoryError);
      }
    }

    console.log(`🎉 Sibling categories scraping completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Sibling categories processed: ${siblingCategories.length}`);
    console.log(`   - New products created: ${totalProductsProcessed}`);
    console.log(`   - Existing products updated: ${totalProductsUpdated}`);

    return NextResponse.json({
      success: true,
      message: `Successfully scraped ${siblingCategories.length} sibling categories`,
      data: {
        siblingCategoriesProcessed: siblingCategories.length,
        newProductsCreated: totalProductsProcessed,
        existingProductsUpdated: totalProductsUpdated,
        totalProductsProcessed: totalProductsProcessed + totalProductsUpdated
      }
    });

  } catch (error) {
    console.error('❌ Sibling categories scraping error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while scraping sibling categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
