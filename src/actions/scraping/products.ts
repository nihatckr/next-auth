"use server"

import db from "@/lib/db"
import { auth } from "@/auth"

export async function getProducts() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  console.log("🔍 [DEBUG] User role:", session.user.role)
  console.log("🔍 [DEBUG] User data:", session.user)

  // Admin kontrolü
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden")
  }

  try {
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        primaryImage: true,
        url: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        productCode: true,
        composition: true,
        careInstructions: true,
        createdAt: true,
        brand: true,
        productCategories: {
          include: {
            category: true
          }
        },
        colorVariants: {
          include: {
            sizes: true
          }
        }
      }
    })

    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error("Failed to fetch products")
  }
}

export async function getProductStats() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  console.log("🔍 [DEBUG] User role in stats:", session.user.role)
  console.log("🔍 [DEBUG] User data in stats:", session.user)

  // Admin kontrolü
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden")
  }

  try {
    const totalProducts = await db.product.count()
    const totalVariants = await db.colorVariants.count()
    const totalBrands = await db.brand.count()
    const totalCategories = await db.category.count()

    return {
      totalProducts,
      totalVariants,
      totalBrands,
      totalCategories
    }
  } catch (error) {
    console.error("Error fetching product stats:", error)
    throw new Error("Failed to fetch product stats")
  }
}
