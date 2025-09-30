import { UserRole } from "@/lib/generated/prisma"
import * as z from "zod"

// Şifre sıfırlama için schema
export const ResetSchema = z.object({
  email: z.string().min(1, "E-posta adresi gerekli").email("Geçersiz e-posta adresi"),

})

// Güçlü şifre doğrulama regex'i
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

// Yeni şifre belirleme için schema
export const NewPasswordSchema = z.object({
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(strongPasswordRegex, "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir"),
})

// Giriş yapmak için schema
export const LoginSchema = z.object({
  email: z.string().min(1, "E-posta adresi gerekli").email("Geçersiz e-posta adresi"),
  password: z.string().min(1, "Şifre gerekli"),
})

// Kayıt olmak için schema
export const RegisterSchema = z.object({
  email: z.string().min(1, "E-posta adresi gerekli").email("Geçersiz e-posta adresi"),
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(strongPasswordRegex, "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir"),
  name: z.string().min(1, "İsim gerekli"),
})

// Kullanıcı ayarları için schema - tüm alanlar isteğe bağlı
export const SettingsSchema = z.object({
  name: z.optional(z.string()),
  email: z.optional(z.string().email("Geçersiz e-posta adresi")),
  role: z.optional(z.enum([UserRole.ADMIN, UserRole.USER])),
  password: z.optional(z.string()),
  newPassword: z.optional(z.string()),
})
.refine((data) => {
  // Sadece şifre alanları doldurulmuşsa validation yap
  const hasPassword = data.password && data.password.trim() !== ""
  const hasNewPassword = data.newPassword && data.newPassword.trim() !== ""

  // Eğer ikisinden biri boşsa ve diğeri doluysa hata ver
  if (hasPassword && !hasNewPassword) {
    return false
  }
  return true;
}, {
  message: "Şifre değiştirirken yeni şifre gerekli",
  path: ["newPassword"],
})
.refine((data) => {
  const hasPassword = data.password && data.password.trim() !== ""
  const hasNewPassword = data.newPassword && data.newPassword.trim() !== ""

  if (hasNewPassword && !hasPassword) {
    return false
  }
  return true;
}, {
  message: "Yeni şifre belirlerken mevcut şifre gerekli",
  path: ["password"],
})
.refine((data) => {
  // Şifre minimum uzunluk kontrolü - sadece doldurulmuşsa
  const hasPassword = data.password && data.password.trim() !== ""
  if (hasPassword && data.password!.trim().length < 6) {
    return false
  }
  return true;
}, {
  message: "Mevcut şifre en az 6 karakter olmalı",
  path: ["password"],
})
.refine((data) => {
  // Yeni şifre minimum uzunluk ve karmaşıklık kontrolü - sadece doldurulmuşsa
  const hasNewPassword = data.newPassword && data.newPassword.trim() !== ""
  if (hasNewPassword) {
    if (data.newPassword!.trim().length < 8) {
      return false
    }
    if (!strongPasswordRegex.test(data.newPassword!.trim())) {
      return false
    }
  }
  return true;
}, {
  message: "Yeni şifre en az 8 karakter olmalı ve güçlü şifre kurallarına uymalı",
  path: ["newPassword"],
})

// Marka oluşturma için schema - Schema'ya %100 uyumlu
export const CreateBrandSchema = z.object({
  name: z.string().min(2, {
    message: "Marka adı en az 2 karakter olmalıdır."
  }),
  description: z.string().optional(),
  url: z.string().url({
    message: "Geçerli bir URL giriniz."
  }).optional().or(z.literal("")),
  isActive: z.boolean(),
  // ✅ API KONFIGÜRASYONU - Schema'ya uygun
  apiProductsUrl: z.string().url({
    message: "Geçerli bir API URL giriniz."
  }).optional().or(z.literal("")),
  apiProductDetailsUrl: z.string().url({
    message: "Geçerli bir API URL giriniz."
  }).optional().or(z.literal("")),
  apiConfig: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true
    try {
      JSON.parse(val)
      return true
    } catch {
      return false
    }
  }, {
    message: "Geçerli bir JSON formatı giriniz."
  })
})

// Marka güncelleme için schema (aynı validasyonlar)
export const UpdateBrandSchema = CreateBrandSchema

// Kategori oluşturma için schema
export const CreateCategorySchema = z.object({
  name: z.string().min(2, {
    message: "Kategori adı en az 2 karakter olmalıdır."
  }),
  brandId: z.number().positive({
    message: "Marka seçimi zorunludur."
  }),
  parentId: z.number().positive().optional(),
  isActive: z.boolean(),
  gender: z.enum(["woman", "man"], {
    required_error: "Cinsiyet seçimi zorunludur.",
    invalid_type_error: "Geçerli bir cinsiyet seçiniz."
  }).optional(),
  apiId: z.string().optional().or(z.literal("")),
  isLeaf: z.boolean().optional()
})

// Kategori güncelleme için schema (aynı validasyonlar)
export const UpdateCategorySchema = CreateCategorySchema

// Ürün ekleme için schema - Prisma schema'ya %100 uyumlu
export const CreateProductSchema = z.object({
  name: z.string().min(1, "Ürün adı gerekli"),
  description: z.string().optional(),
  basePrice: z.string().min(1, "Fiyat gerekli"),
  discountPrice: z.number().optional(),
  currencyCode: z.string().default("TL"),
  url: z.string().url("Geçerli bir URL giriniz").optional(),
  productCode: z.string().min(1, "Ürün kodu gerekli"),
  brandId: z.number().min(1, "Marka seçimi gerekli"),
  categoryId: z.number().min(1, "Kategori seçimi gerekli"),
  primaryImage: z.string().url("Geçerli bir resim URL'si giriniz").optional(),
  composition: z.string().optional(),
  careInstructions: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  // Renk varyantları - Prisma ColorVariant model'ine uygun
  colors: z.array(z.object({
    colorName: z.string().min(1, "Renk adı gerekli"),
    colorCode: z.string().optional(),
    backgroundColor: z.string().optional(),
    price: z.string().optional(),
    discountPrice: z.number().optional(),
    availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER"]).default("IN_STOCK"),
    sku: z.string().optional(),
    originalIndex: z.number().optional(),
    scrapedImages: z.number().default(0),
    images: z.array(z.object({
      url: z.string().url("Geçerli bir resim URL'si giriniz"),
      altText: z.string().optional(),
      order: z.number().default(0)
    })).optional(),
    sizes: z.array(z.object({
      size: z.string().min(1, "Beden adı gerekli"),
      availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER"]).default("IN_STOCK"),
      isSelected: z.boolean().default(false),
      originalOrder: z.number().optional()
    })).optional()
  })).optional()
})

export const UpdateProductSchema = CreateProductSchema
