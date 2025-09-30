"use server"

import * as z from "zod"
import { auth } from "@/auth"
import db from "@/lib/db"
import { CreateProductSchema, UpdateProductSchema } from "@/schemas"
import { ProductService } from "@/lib/product-service"

// Ürün oluşturma
export const createProduct = async (values: z.infer<typeof CreateProductSchema>) => {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden" }
  }

  const validatedFields = CreateProductSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Geçersiz alanlar!" }
  }

  const {
    name,
    description,
    basePrice,
    currencyCode,
    url,
    productCode,
    brandId,
    categoryId,
    primaryImage,
    composition,
    careInstructions,
    metaTitle,
    metaDescription,
    colors,

  } = validatedFields.data

  try {
    // Ürün ID'si oluştur
    const productId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Slug oluştur
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Ürün verisini hazırla - Prisma schema'ya %100 uyumlu
    const productData = {
      id: productId,
      name,
      slug, // ✅ Slug eklendi
      price: basePrice,
      currency: currencyCode,
      url: url || `https://example.com/products/${slug}`,
      primaryImage: primaryImage || '',
      description: description || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      composition: composition || '',
      careInstructions: careInstructions || '',
      productCode,
      variants: colors?.map((color, index) => ({
        colorName: color.colorName,
        colorCode: color.colorCode || `color-${index}`,
        backgroundColor: color.backgroundColor || '#000000',
        sku: color.sku || `${productCode}-${color.colorCode || index}`,
        price: color.price || basePrice,
        discountPrice: color.discountPrice,
        availability: color.availability || 'IN_STOCK',
        originalIndex: color.originalIndex,
        scrapedImages: color.scrapedImages || 0,
        images: color.images?.map((image, imgIndex) => ({
          url: image.url,
          altText: image.altText || '',
          order: imgIndex
        })) || [],
        sizes: color.sizes?.map(size => ({
          size: size.size,
          availability: size.availability || 'IN_STOCK',
          isSelected: size.isSelected || false,
          originalOrder: size.originalOrder
        })) || []
      })) || []
    }

    // ProductService kullanarak ürünü kaydet
    const savedProduct = await ProductService.saveProduct(productData, brandId, categoryId)

    if (savedProduct) {
      return { success: "Ürün başarıyla oluşturuldu!" }
    } else {
      return { error: "Ürün oluşturulamadı!" }
    }

  } catch (error) {
    console.error("Error creating product:", error)
    return { error: "Ürün oluşturulurken hata oluştu!" }
  }
}

// Ürün güncelleme
export const updateProduct = async (productId: string, values: z.infer<typeof UpdateProductSchema>) => {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden" }
  }

  const validatedFields = UpdateProductSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Geçersiz alanlar!" }
  }

  try {
    // Mevcut ürünü kontrol et
    const existingProduct = await db.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return { error: "Ürün bulunamadı!" }
    }

    const {
      name,
      description,
      basePrice,
      currencyCode,
      productCode,
      brandId,
      categoryId,
      primaryImage,
      composition,
      careInstructions,
      metaTitle,
      metaDescription,
      colors
    } = validatedFields.data

    // Slug güncelle
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Ürün verisini hazırla
    const productData = {
      id: productId,
      name,
      price: basePrice,
      currency: currencyCode,
      url: `https://example.com/products/${slug}`,
      primaryImage: primaryImage || '',
      description: description || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      composition: composition || '',
      careInstructions: careInstructions || '',
      productCode,
      variants: colors?.map((color, index) => ({
        colorName: color.colorName,
        colorCode: color.colorCode || `color-${index}`,
        backgroundColor: color.backgroundColor || '#000000',
        sku: color.sku || `${productCode}-${color.colorCode || index}`,
        price: color.price || basePrice,
        availability: color.availability || 'IN_STOCK',
        images: color.images?.map((image, imgIndex) => ({
          url: image.url,
          altText: image.altText || '',
          order: imgIndex
        })) || [],
        sizes: color.sizes?.map(size => ({
          name: size.size, // 'name' yerine 'size' kullanıldı
          availability: size.availability || 'IN_STOCK',

        })) || []
      })) || []
    }

    // ProductService kullanarak ürünü güncelle
    const savedProduct = await ProductService.saveProduct(productData, brandId, categoryId)

    if (savedProduct) {
      return { success: "Ürün başarıyla güncellendi!" }
    } else {
      return { error: "Ürün güncellenemedi!" }
    }

  } catch (error) {
    console.error("Error updating product:", error)
    return { error: "Ürün güncellenirken hata oluştu!" }
  }
}

// Ürün silme
export const deleteProduct = async (productId: string) => {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden" }
  }

  try {
    // Ürünü ve ilişkili verileri sil
    await db.product.delete({
      where: { id: productId }
    })

    return { success: "Ürün başarıyla silindi!" }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { error: "Ürün silinirken hata oluştu!" }
  }
}

// Tek ürün getirme
export const getProduct = async (productId: string) => {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden" }
  }

  try {
    const product: any = await db.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true
          }
        },
        colorVariants: true
      }
    })

    if (!product) {
      return { error: "Ürün bulunamadı!" }
    }

    return { success: product }
  } catch (error: any) {

    return { error: "Ürün getirilirken hata oluştu!" };
}
}
