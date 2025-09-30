"use server"

import { auth } from "@/auth"
import db from "@/lib/db"
import { CreateBrandSchema, UpdateBrandSchema } from "@/schemas"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import { z } from "zod"

export const createBrand = async (values: z.infer<typeof CreateBrandSchema>) => {
  const session = await auth()

  if (!session?.user) {
    return { error: "Giriş yapmanız gerekiyor!" }
  }

  // Veritabanından role kontrolü yap
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || user.role !== "ADMIN") {
    return { error: "Admin yetkisi gerekiyor!" }
  }

  const validatedFields = CreateBrandSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Geçersiz alan!" }
  }

  const { name, description, url, isActive, apiProductsUrl, apiProductDetailsUrl, apiConfig } = validatedFields.data

  try {
    // Session'dan user ID'sini al (artık veritabanı ile eşleşiyor)
    const userId = session.user.id
    console.log('🔍 Session user ID:', userId)

    // Name'den slug oluştur
    let slug = slugify(name)

    // Slug benzersizliğini sağla
    const existingBrand = await db.brand.findFirst({
      where: { slug }
    })

    if (existingBrand) {
      // Eğer slug varsa, sonuna sayı ekle
      let counter = 1
      let uniqueSlug = `${slug}-${counter}`

      while (await db.brand.findFirst({ where: { slug: uniqueSlug } })) {
        counter++
        uniqueSlug = `${slug}-${counter}`
      }

      slug = uniqueSlug
    }

    await db.brand.create({
      data: {
        name,
        slug,
        description,
        url,
        isActive,
        // ✅ API KONFIGÜRASYONU - Schema'ya uygun
        apiProductsUrl,
        apiProductDetailsUrl,
        // ✅ USER TRACKING - Schema'ya uygun
        createdById: userId,
        updatedById: userId
      }
    })

    revalidatePath("/admin/brands")
    return { success: "Marka başarıyla oluşturuldu!" }

  } catch (error) {
    console.error("Brand creation error:", error)
    if (error instanceof Error) {
      return { error: `Marka oluşturulamadı: ${error.message}` }
    }
    return { error: "Beklenmeyen bir hata oluştu!" }
  }
}

export const getBrands = async () => {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        categories: {
          where: { level: 1 },
          select: { id: true, name: true }
        }
      }
    })

    return { success: true, data: brands }
  } catch (error) {
    console.error("Get brands error:", error)
    return { success: false, error: "Markalar yüklenemedi!" }
  }
}

export const updateBrand = async (
  id: number,
  values: z.infer<typeof UpdateBrandSchema>
) => {
  const session = await auth()

  if (!session?.user) {
    return { error: "Giriş yapmanız gerekiyor!" }
  }

  // Veritabanından role kontrolü yap
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || user.role !== "ADMIN") {
    return { error: "Admin yetkisi gerekiyor!" }
  }

  const validatedFields = UpdateBrandSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Geçersiz alan!" }
  }

  const { name, description, url, isActive, apiProductsUrl, apiProductDetailsUrl, apiConfig } = validatedFields.data

  try {
    // Mevcut markayı kontrol et
    const currentBrand = await db.brand.findUnique({
      where: { id }
    })

    if (!currentBrand) {
      return { error: "Marka bulunamadı!" }
    }

    // Session'dan user ID'sini al (artık veritabanı ile eşleşiyor)
    const userId = session.user.id
    console.log('🔍 Update Session user ID:', userId)

    // Name'den slug oluştur
    let slug = slugify(name)

    // Slug benzersizliğini sağla (kendisi hariç)
    const existingBrand = await db.brand.findFirst({
      where: {
        slug,
        NOT: { id }
      }
    })

    if (existingBrand) {
      // Eğer slug varsa, sonuna sayı ekle
      let counter = 1
      let uniqueSlug = `${slug}-${counter}`

      while (await db.brand.findFirst({
        where: {
          slug: uniqueSlug,
          NOT: { id }
        }
      })) {
        counter++
        uniqueSlug = `${slug}-${counter}`
      }

      slug = uniqueSlug
    }

    await db.brand.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        url,
        isActive,
        // ✅ API KONFIGÜRASYONU - Schema'ya uygun
        apiProductsUrl,
        apiProductDetailsUrl,
        // ✅ USER TRACKING - Schema'ya uygun
        updatedById: userId
      }
    })

    revalidatePath("/admin/brands")
    return { success: "Marka başarıyla güncellendi!" }

  } catch (error) {
    console.error("Brand update error:", error)
    if (error instanceof Error) {
      return { error: `Marka güncellenemedi: ${error.message}` }
    }
    return { error: "Marka güncellenemedi!" }
  }
}

export const deleteBrand = async (id: number) => {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Yetkisiz erişim!" }
  }

  try {
    // Mevcut markayı kontrol et
    const currentBrand = await db.brand.findUnique({
      where: { id }
    })

    if (!currentBrand) {
      return { error: "Marka bulunamadı!" }
    }

    // Kategori kontrolü
    const hasCategories = await db.category.findFirst({
      where: { brandId: id }
    })

    if (hasCategories) {
      return { error: "Bu markaya ait kategoriler var, önce onları silin!" }
    }

    await db.brand.delete({
      where: { id }
    })

    revalidatePath("/admin/brands")
    return { success: "Marka başarıyla silindi!" }

  } catch (error) {
    console.error("Brand delete error:", error)
    return { error: "Marka silinemedi!" }
  }
}

export const getBrandById = async (id: number) => {
  try {
    const brand = await db.brand.findUnique({
      where: { id },
      include: {
        categories: {
          select: { id: true, name: true, level: true }
        }
      }
    })

    if (!brand) {
      return { error: "Marka bulunamadı!" }
    }

    return { success: brand }
  } catch (error) {
    console.error("Get brand by id error:", error)
    return { error: "Marka yüklenemedi!" }
  }
}
