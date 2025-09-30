"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { createCategory, updateCategory, getCategoryById } from "@/actions/categories/category"
import { getBrands } from "@/actions/categories/brand"
import { CreateCategorySchema } from "@/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: number
  name: string // Schema'ya uygun: name alanı
  slug: string
  level: number
  sortOrder: number
  isActive: boolean
  isLeaf: boolean // Schema'ya uygun: default false
  gender?: string | null
  apiId?: string | null // Schema'ya uygun: apiId alanı
  brand: { id: number; name: string }
  parent?: { id: number; name: string } | null // Schema'ya uygun: name alanı
  createdAt?: Date
  updatedAt?: Date
  createdById?: string | null
  updatedById?: string | null
}

interface Brand {
  id: number
  name: string
}

interface CategoryFormProps {
  category?: Category
  parentId?: number | null
  brandName?: string
  parentName?: string
  onSuccess?: () => void
}

type FormData = z.infer<typeof CreateCategorySchema>

export function CategoryForm({ category, parentId, brandName, parentName, onSuccess }: CategoryFormProps) {
  console.log("categoryssssssssssssssssssssssssss", category?.brand?.name)

  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const [brands, setBrands] = useState<Brand[]>([])
  const [contextBrandId, setContextBrandId] = useState<number | undefined>()
  const [parentCategory, setParentCategory] = useState<Category | null>(null)

  // Extract category ID from categoryApiId for display
  const extractCategoryIdFromApiId = (apiId: string | undefined | null): string => {
    return apiId || ""
  }

  const form = useForm<FormData>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: category?.name || "",
      brandId: category?.brand.id || contextBrandId || undefined,
      parentId: parentId || category?.parent?.id || undefined,
      gender: (category?.gender as "woman" | "man" | undefined) || (!parentCategory ? "woman" : parentCategory?.gender as "woman" | "man" | undefined),
      isActive: category?.isActive ?? true,
      apiId: category?.apiId || "",
    },
  })

  // State for category API ID input (separate from form)
  const [categoryApiIdInput, setCategoryApiIdInput] = useState(extractCategoryIdFromApiId(category?.apiId))

  // Update category API ID input when category changes
  useEffect(() => {
    setCategoryApiIdInput(extractCategoryIdFromApiId(category?.apiId))
  }, [category?.apiId])

  // Reset form when category changes (for edit mode)
  useEffect(() => {
    if (category) {
      console.log("🔄 Resetting form with category:", category)
      console.log("🔄 Category details:", {
        name: category.name,
        brandId: category.brand?.id,
        gender: category.gender,
        isActive: category.isActive,
        apiId: category.apiId
      })

      const formData = {
        name: category.name || "",
        brandId: category.brand?.id || contextBrandId || undefined,
        parentId: parentId || category.parent?.id || undefined,
        gender: (category.gender as "woman" | "man" | undefined) || undefined,
        isActive: category.isActive ?? true,
        apiId: category.apiId || "",
      }

      console.log("🔄 Form data to reset:", formData)
      form.reset(formData)

      // API ID input'u da güncelle
      setCategoryApiIdInput(category.apiId || "")
    }
  }, [category, form, contextBrandId, parentId])

  // Load brands and set context
  useEffect(() => {
    const loadData = async () => {
      // Load brands
      const brandsResult = await getBrands()
      if (brandsResult.success) {
        setBrands(brandsResult.data || [])

        // Auto-select brand if brandName provided
        if (brandName) {
          const matchingBrand = (brandsResult.data || []).find(b => b.name === brandName)
          if (matchingBrand) {
            setContextBrandId(matchingBrand.id)
            form.setValue("brandId", matchingBrand.id)
          }
        }
      }

      // Load parent category if parentId provided
      if (parentId) {
        try {
          const parentResult = await getCategoryById(parentId)
          if (parentResult.success) {
            setParentCategory(parentResult.success)
            // Auto-inherit parent's gender if available
            if (parentResult.success.gender) {
              form.setValue("gender", parentResult.success.gender as "woman" | "man")
            }
            if (parentResult.success.brand?.id && !contextBrandId) {
              setContextBrandId(parentResult.success.brand.id)
              form.setValue("brandId", parentResult.success.brand.id)
            }
          }
        } catch (error) {
          console.log("Parent kategori bilgisi alınamadı :", error)

        }
      }
    }

    loadData()
  }, [brandName, parentId, form, contextBrandId])

  const onSubmit = (values: FormData) => {
    setError("")
    setSuccess("")


    startTransition(() => {
      if (category) {
        updateCategory(category.id, values).then((result) => {
          if (result?.error) {
            setError(result.error)
          }
          if (result?.success) {
            setSuccess(result.success)
            setTimeout(() => {
              onSuccess?.()
            }, 1000) // Update için biraz daha uzun süre
          }
        })
      } else {
        createCategory(values).then((result) => {
          if (result?.error) {
            setError(result.error)
          }
          if (result?.success) {
            setSuccess(result.success)
            // Form reset - tüm level'lar için aynı
            form.reset({
              name: "",
              brandId: contextBrandId,
              parentId: parentId || undefined,
              gender: parentCategory?.gender as "woman" | "man" | undefined || "woman",
              isActive: true,
              apiId: "",
            })
            setTimeout(() => {
              onSuccess?.()
            }, 500)
          }
        })
      }
    })
  }

  const isContextMode = !!(brandName || parentName)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Context-aware Brand Selection */}
        {!isContextMode && (
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marka</FormLabel>
                <Select
                  disabled={isPending}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Marka seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Category Name - Level 0 için text input */}
        {!parentCategory ? (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ana Kategori Adı</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Örn: Kadın, Erkek, Çocuk..."
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                  💡 <strong>Ana Kategori:</strong> Kategori adını girin (örn: Kadın, Erkek, Çocuk)
                </div>
              </FormItem>
            )}
          />
        ) : (
          <>
            {/* Level 1 kategoriler için text input */}
            {parentCategory && parentCategory.level === 0 && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Kategori Adı</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Örn: Giyim, Ayakkabı, Aksesuar..."
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                      💡 <strong>Alt Kategori:</strong> Kategori adını girin (örn: Giyim, Ayakkabı, Aksesuar)
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* Level 2 kategoriler için text input */}
            {parentCategory && parentCategory.level === 1 && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Alt Kategori Adı</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Örn: Üst Giyim, Alt Giyim, Dış Giyim..."
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950/20 p-2 rounded-md border border-purple-200 dark:border-purple-800">
                      💡 <strong>Level 2:</strong> Kategori adını girin (örn: Üst Giyim, Alt Giyim, Dış Giyim)
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* Level 3 kategoriler için text input */}
            {parentCategory && parentCategory.level === 2 && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Son Seviye Kategori Adı</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Örn: T-shirt, Gömlek, Kazak..."
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground bg-orange-50 dark:bg-orange-950/20 p-2 rounded-md border border-orange-200 dark:border-orange-800">
                      💡 <strong>Level 3:</strong> Kategori adını girin (örn: T-shirt, Gömlek, Kazak)
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* Level 4+ kategoriler için sadece kategori adı */}
            {parentCategory && parentCategory.level > 2 && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Adı</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Örn: Özel kategori adı..."
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-950/20 p-2 rounded-md border border-gray-200 dark:border-gray-800">
                      💡 <strong>Level 4+:</strong> Bu seviyede sadece kategori adını düzenleyebilirsiniz. Tüm özellikler parent kategorilerden miras alınır.
                    </div>
                  </FormItem>
                )}
              />
            )}
          </>
        )}


        {/* Category API ID - Sadece leaf kategoriler için */}
        {(category && category.isLeaf) && (
          <FormField
            control={form.control}
            name="apiId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  API ID (İsteğe bağlı)
                </FormLabel>
                <FormControl>
                  <Input
                    value={categoryApiIdInput}
                    disabled={isPending}
                    placeholder="API ID'sini girin"
                    onChange={(e) => {
                      const apiId = e.target.value.trim()
                      setCategoryApiIdInput(apiId)
                      field.onChange(apiId)
                    }}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                  💡 <strong>API ID:</strong> Marka bağımsız kategori API ID'sini girin.
                  {category?.brand?.name === 'Zara' && ' (örn: 2458839)'}
                  {category?.brand?.name === 'Pull & Bear' && ' (örn: 1030552186)'}
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Gender Selection - Sadece leaf kategoriler için */}
        {(category && category.isLeaf) && (
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Cinsiyet Hedefi
                  {parentCategory?.gender && (
                    <Badge variant="secondary" className="text-xs">
                      Miras: {parentCategory.gender === 'woman' ? 'Kadın' : 'Erkek'}
                    </Badge>
                  )}
                </FormLabel>
                <Select
                  disabled={isPending}
                  onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Cinsiyet seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <span>🚫</span>
                        <span>Belirtilmemiş</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="woman">
                      <div className="flex items-center gap-2">
                        <span>👩</span>
                        <span>Kadın</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="man">
                      <div className="flex items-center gap-2">
                        <span>👨</span>
                        <span>Erkek</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Aktif Durumu - Sadece leaf kategoriler için */}
        {(category && category.isLeaf) && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Kategori Durumu</FormLabel>
                  <div className="text-[0.8rem] text-muted-foreground">
                    {field.value ? "Kategori aktif" : "Kategori pasif"}
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : category ? "Güncelle" : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
