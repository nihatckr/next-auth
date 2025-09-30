"use server"

import { auth } from "@/auth"
import db from "@/lib/db"
import { CreateCategorySchema, UpdateCategorySchema } from "@/schemas"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import { z } from "zod"

export const createCategory = async (values: z.infer<typeof CreateCategorySchema>) => {
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

  const validatedFields = CreateCategorySchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Geçersiz alan!" }
  }

  const { name, brandId, parentId, isActive, gender, apiId } = validatedFields.data

  try {
    // Name'den slug oluştur
    let slug = slugify(name)

    // Aynı slug + brandId kontrolü ve benzersizliği sağla
    const existingCategory = await db.category.findFirst({
      where: { slug, brandId }
    })

    if (existingCategory) {
      // Eğer slug varsa, sonuna sayı ekle
      let counter = 1
      let uniqueSlug = `${slug}-${counter}`

      while (await db.category.findFirst({ where: { slug: uniqueSlug, brandId } })) {
        counter++
        uniqueSlug = `${slug}-${counter}`
      }

      slug = uniqueSlug
    }

    // Level ve sortOrder otomatik hesapla
    let level = 0
    let sortOrder = 0

    if (parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: parentId }
      })

      if (parentCategory) {
        level = parentCategory.level + 1
        sortOrder = parentCategory.sortOrder + 1
      }
    }

    const categoryData = {
      name,
      slug,
      brandId,
      parentId: parentId || null,
      level,
      sortOrder,
      isActive,
      gender: gender || null,
      apiId: apiId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.category.create({
      data: categoryData
    })

    revalidatePath("/admin/categories")
    return { success: "Kategori başarıyla oluşturuldu!" }

  } catch (error) {
    console.error("Category creation error:", error)
    return { error: "Beklenmeyen bir hata oluştu!" }
  }
}

export const updateCategory = async (id: number, values: z.infer<typeof UpdateCategorySchema>) => {
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

  const validatedFields = UpdateCategorySchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Geçersiz alan!" }
  }

  const { name, brandId, parentId, isActive, gender, apiId } = validatedFields.data

  try {
    // Mevcut kategoriyi kontrol et
    const currentCategory = await db.category.findUnique({
      where: { id }
    })

    if (!currentCategory) {
      return { error: "Kategori bulunamadı!" }
    }

    // Name'den slug oluştur
    let slug = slugify(name)

    // Slug benzersizliğini sağla (kendisi hariç)
    const existingCategory = await db.category.findFirst({
      where: {
        slug,
        brandId,
        NOT: { id }
      }
    })

    if (existingCategory) {
      let counter = 1
      let uniqueSlug = `${slug}-${counter}`

      while (await db.category.findFirst({
        where: {
          slug: uniqueSlug,
          brandId,
          NOT: { id }
        }
      })) {
        counter++
        uniqueSlug = `${slug}-${counter}`
      }

      slug = uniqueSlug
    }

    // Level ve sortOrder hesapla
    let level = 0
    let sortOrder = 0

    if (parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: parentId }
      })

      if (parentCategory) {
        level = parentCategory.level + 1
        sortOrder = parentCategory.sortOrder + 1
      }
    }

    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        brandId,
        parentId: parentId || null,
        level,
        sortOrder,
        isActive,
        gender: gender || null,
        apiId: apiId || null,
        updatedAt: new Date()
      }
    })

    revalidatePath("/admin/categories")
    return { success: "Kategori başarıyla güncellendi!" }

  } catch (error) {
    console.error("Category update error:", error)
    return { error: "Beklenmeyen bir hata oluştu!" }
  }
}

export const deleteCategory = async (id: number) => {
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

  try {
    // Mevcut kategoriyi kontrol et
    const currentCategory = await db.category.findUnique({
      where: { id },
      include: {
        subCategories: true,
      }
    })

    if (!currentCategory) {
      return { error: "Kategori bulunamadı!" }
    }

    // Alt kategori kontrolü
    if (currentCategory.subCategories && currentCategory.subCategories.length > 0) {
      return { error: "Bu kategoriye ait alt kategoriler var, önce onları silin!" }
    }

    await db.category.delete({
      where: { id }
    })

    revalidatePath("/admin/categories")
    return { success: "Kategori başarıyla silindi!" }

  } catch (error) {
    console.error("Category deletion error:", error)
    return { error: "Beklenmeyen bir hata oluştu!" }
  }
}

export const getCategories = async (brandId?: number) => {
  try {
    const categories = await db.category.findMany({
      where: brandId ? { brandId } : {},
      orderBy: [
        { level: "asc" },
        { sortOrder: "asc" },
        { name: "asc" }
      ],
      include: {
        brand: {
          select: { id: true, name: true }
        },
        parent: {
          select: { id: true, name: true }
        },
        subCategories: {
          select: { id: true, name: true }
        },
        _count: {
          select: { subCategories: true }
        }
      }
    })

    // Leaf kategorileri işaretle
    const categoriesWithLeaf = categories.map(category => ({
      ...category,
      isLeaf: category._count.subCategories === 0,
      subcategories: category.subCategories.map(sub => ({ ...sub }))
    }))

    return { success: true, data: categoriesWithLeaf }
  } catch (error) {
    console.error("Get categories error:", error)
    return { error: "Kategoriler yüklenirken hata oluştu!" }
  }
}

export const getCategoryById = async (id: number) => {
  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        brand: {
          select: { id: true, name: true }
        },
        parent: {
          select: { id: true, name: true }
        },
        subCategories: {
          select: { id: true, name: true }
        }
      }
    })

    if (!category) {
      return { error: "Kategori bulunamadı!" }
    }

    return {
      success: {
        ...category,
        parent: category.parent ? { ...category.parent } : null,
        subCategories: category.subCategories.map(sub => ({ ...sub }))
      }
    }
  } catch (error) {
    console.error("Get category error:", error)
    return { error: "Kategori yüklenirken hata oluştu!" }
  }
}

export const getLeafCategories = async (brandId?: number) => {
  try {
    const categories = await db.category.findMany({
      where: brandId ? { brandId } : {},
      orderBy: [
        { level: "asc" },
        { sortOrder: "asc" },
        { name: "asc" }
      ],
      include: {
        brand: {
          select: { id: true, name: true }
        },
        parent: {
          select: { id: true, name: true }
        },
        subCategories: {
          select: { id: true, name: true }
        },
        _count: {
          select: { subCategories: true }
        }
      }
    })

    // Sadece leaf kategorileri filtrele
    const leafCategories = categories
      .filter(cat => cat._count.subCategories === 0)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        level: cat.level,
        fullPath: cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name
      }))

    return { success: leafCategories }
  } catch (error) {
    console.error("Get leaf categories error:", error)
    return { error: "Leaf kategoriler yüklenirken hata oluştu!" }
  }
}
