import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { seeAllCategoryId } = await request.json();

    if (!seeAllCategoryId) {
      return NextResponse.json({
        success: false,
        message: 'See All Category ID is required'
      }, { status: 400 });
    }

    console.log(`🔗 Starting sibling products linking for "Tümünü Gör" category ${seeAllCategoryId}`);

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

    // Find sibling leaf categories (same parent, same level, excluding "Tümünü Gör")
    const siblingCategories = await db.category.findMany({
      where: {
        parentId: seeAllCategory.parentId,
        level: seeAllCategory.level,
        id: { not: seeAllCategoryId },
        isLeaf: true,
        isActive: true
      },
      include: {
        brand: true
      }
    });

    console.log(`📂 Found ${siblingCategories.length} sibling leaf categories to link from`);

    if (siblingCategories.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No sibling leaf categories found'
      }, { status: 400 });
    }

    let totalProductsLinked = 0;

    // Process each sibling category
    for (const siblingCategory of siblingCategories) {
      try {
        console.log(`🔄 Processing sibling leaf category: ${siblingCategory.name} (ID: ${siblingCategory.id})`);

        // Get all products from this sibling category
        const siblingProducts = await db.product.findMany({
          where: {
            productCategories: {
              some: {
                categoryId: siblingCategory.id
              }
            }
          },
          include: {
            productCategories: true
          }
        });

        if (siblingProducts.length === 0) {
          console.log(`⚠️ No products found in sibling category: ${siblingCategory.name}`);
          continue;
        }

        console.log(`📦 Found ${siblingProducts.length} products in ${siblingCategory.name}`);

        // Link each product to the "Tümünü Gör" category
        for (const product of siblingProducts) {
          try {
            // Check if product is already linked to "Tümünü Gör" category
            const existingLink = await db.productCategory.findFirst({
              where: {
                productId: product.id,
                categoryId: seeAllCategoryId
              }
            });

            if (!existingLink) {
              // Create new link to "Tümünü Gör" category
              await db.productCategory.create({
                data: {
                  productId: product.id,
                  categoryId: seeAllCategoryId
                }
              });
              totalProductsLinked++;
            }
          } catch (error) {
            console.error(`Error linking product ${product.id} to "Tümünü Gör" category:`, error);
          }
        }

        console.log(`✅ Completed linking products from ${siblingCategory.name}`);
      } catch (error) {
        console.error(`Error processing sibling category ${siblingCategory.name}:`, error);
      }
    }

    console.log(`🎉 Successfully linked ${totalProductsLinked} products to "Tümünü Gör" category`);

    return NextResponse.json({
      success: true,
      message: `Successfully linked ${totalProductsLinked} products to "Tümünü Gör" category`,
      data: {
        totalProductsLinked,
        siblingCategoriesProcessed: siblingCategories.length
      }
    });

  } catch (error) {
    console.error('Error in link-sibling-products API:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
