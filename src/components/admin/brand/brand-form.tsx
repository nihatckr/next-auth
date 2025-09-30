"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { createBrand, updateBrand } from "@/actions/categories/brand"
import { CreateBrandSchema } from "@/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { ZaraApiConfigExample } from "./zara-api-config-example"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface Brand {
  id: number
  name: string
  slug: string
  description?: string | null
  url?: string | null
  isActive: boolean
  // ✅ API KONFIGÜRASYONU - Schema'ya uygun
  apiProductsUrl?: string | null
  apiProductDetailsUrl?: string | null
  apiConfig?: string | null
}

interface BrandFormProps {
  brand?: Brand
  onSuccess?: () => void
}

export function BrandForm({ brand, onSuccess }: BrandFormProps) {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false)

  // ✅ API CONFIG HELPER FUNCTIONS - İKİ API ADRESİ SİSTEMİ
  const createZaraConfig = () => ({
    // ✅ KATEGORİ API - Ürün ID'lerini toplar
    categoryApi: {
      baseUrl: "https://www.zara.com/tr/",
      endpoint: "/tr/tr/category/{categoryId}/products?ajax=true",
      method: "GET",
      timeout: 30000
    },
    // ✅ ÜRÜN DETAY API - Ürün detaylarını toplar (TEK TEK API ID İLE)
    productApi: {
      baseUrl: "https://www.zara.com/tr/",
      endpoint: "/tr/tr/product/{apiId}/extra-detail?ajax=true",
      method: "GET",
      timeout: 30000
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      "X-Requested-With": "XMLHttpRequest"
    },
    scraping: {
      delayBetweenRequests: 1000,
      maxRetries: 3,
      retryDelay: 2000,
      concurrentRequests: 5
    }
  })

  const createPullBearConfig = () => ({
    // ✅ KATEGORİ API - Ürün ID'lerini toplar
    categoryApi: {
      baseUrl: "https://www.pullandbear.com/tr/",
      endpoint: "/tr/tr/category/{categoryId}/products?ajax=true",
      method: "GET",
      timeout: 30000
    },
    // ✅ ÜRÜN DETAY API - Ürün detaylarını toplar (TEK TEK API ID İLE)
    productApi: {
      baseUrl: "https://www.pullandbear.com/tr/",
      endpoint: "/tr/tr/product/{apiId}/extra-detail?ajax=true",
      method: "GET",
      timeout: 30000
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    scraping: {
      delayBetweenRequests: 1500,
      maxRetries: 3,
      retryDelay: 2000,
      concurrentRequests: 3
    }
  })

  const createHmConfig = () => ({
    // ✅ KATEGORİ API - Ürün ID'lerini toplar
    categoryApi: {
      baseUrl: "https://www2.hm.com/tr_tr/",
      endpoint: "/api/products/list",
      method: "GET",
      timeout: 30000
    },
    // ✅ ÜRÜN DETAY API - Ürün detaylarını toplar (TEK TEK API ID İLE)
    productApi: {
      baseUrl: "https://www2.hm.com/tr_tr/",
      endpoint: "/api/products/{apiId}",
      method: "GET",
      timeout: 30000
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
      "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      "X-Requested-With": "XMLHttpRequest"
    },
    scraping: {
      delayBetweenRequests: 2000,
      maxRetries: 2,
      retryDelay: 3000,
      concurrentRequests: 2
    }
  })

  const createMangoConfig = () => ({
    // ✅ KATEGORİ API - Ürün ID'lerini toplar
    categoryApi: {
      baseUrl: "https://shop.mango.com/tr/",
      endpoint: "/api/catalog/products",
      method: "GET",
      timeout: 30000
    },
    // ✅ ÜRÜN DETAY API - Ürün detaylarını toplar (TEK TEK API ID İLE)
    productApi: {
      baseUrl: "https://shop.mango.com/tr/",
      endpoint: "/api/catalog/products/{apiId}",
      method: "GET",
      timeout: 30000
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
      "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Content-Type": "application/json"
    },
    scraping: {
      delayBetweenRequests: 1200,
      maxRetries: 3,
      retryDelay: 2500,
      concurrentRequests: 4
    }
  })

  const createDefaultConfig = (baseUrl?: string) => ({
    // ✅ KATEGORİ API - Ürün ID'lerini toplar
    categoryApi: {
      baseUrl: baseUrl || "https://api.example.com/",
      endpoint: "/api/categories/{categoryId}/products",
      method: "GET",
      timeout: 30000
    },
    // ✅ ÜRÜN DETAY API - Ürün detaylarını toplar (TEK TEK API ID İLE)
    productApi: {
      baseUrl: baseUrl || "https://api.example.com/",
      endpoint: "/api/products/{apiId}",
      method: "GET",
      timeout: 30000
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    scraping: {
      delayBetweenRequests: 1000,
      maxRetries: 3,
      retryDelay: 2000,
      concurrentRequests: 5
    }
  })

  // ✅ MARKA BAĞIMSIZ CONFIG OLUŞTURMA - İKİ API ADRESİ SİSTEMİ
  const createBrandConfig = (brandName: string, baseUrl?: string) => {
    const name = brandName.toLowerCase()

    // Marka adına göre özel config'ler
    if (name.includes('zara')) {
      return createZaraConfig()
    } else if (name.includes('pull') || name.includes('bear')) {
      return createPullBearConfig()
    } else if (name.includes('hm') || name.includes('h&m')) {
      return createHmConfig()
    } else if (name.includes('mango')) {
      return createMangoConfig()
    } else {
      // Genel config - marka adına göre özelleştir
      const brandUrl = baseUrl || `https://www.${name.replace(/\s+/g, '').toLowerCase()}.com/`
      return {
        // ✅ KATEGORİ API - Ürün ID'lerini toplar
        categoryApi: {
          baseUrl: brandUrl,
          endpoint: "/api/categories/{categoryId}/products",
          method: "GET",
          timeout: 30000
        },
        // ✅ ÜRÜN DETAY API - Ürün detaylarını toplar (TEK TEK API ID İLE)
        productApi: {
          baseUrl: brandUrl,
          endpoint: "/api/products/{apiId}",
          method: "GET",
          timeout: 30000
        },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
        },
        scraping: {
          delayBetweenRequests: 1000,
          maxRetries: 3,
          retryDelay: 2000,
          concurrentRequests: 5
        }
      }
    }
  }

  const updateConfigField = (path: string, value: any) => {
    try {
      const currentConfig = form.getValues('apiConfig')
      let config = currentConfig ? JSON.parse(currentConfig) : createDefaultConfig()

      // Nested path'i güncelle (örn: 'scraping.maxRetries')
      const keys = path.split('.')
      let current = config
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value

      form.setValue('apiConfig', JSON.stringify(config, null, 2))
    } catch (error) {
      console.error('Config update error:', error)
    }
  }

  const resetToDefault = () => {
    const baseUrl = form.getValues('apiProductsUrl')
    form.setValue('apiConfig', JSON.stringify(createDefaultConfig(baseUrl), null, 2))
  }

  const form = useForm<z.infer<typeof CreateBrandSchema>>({
    resolver: zodResolver(CreateBrandSchema),
    defaultValues: {
      name: brand?.name || "",
      description: brand?.description || "",
      url: brand?.url || "",
      isActive: brand?.isActive ?? true,
      // ✅ API KONFIGÜRASYONU - Schema'ya uygun
      apiProductsUrl: brand?.apiProductsUrl || "",
      apiProductDetailsUrl: brand?.apiProductDetailsUrl || "",
      apiConfig: brand?.apiConfig || JSON.stringify(createDefaultConfig(brand?.apiProductsUrl || undefined), null, 2),
    },
  })

  const onSubmit = async (values: z.infer<typeof CreateBrandSchema>) => {
    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        const action = brand
          ? updateBrand(brand.id, values)
          : createBrand(values)

        const data = await action

        setError(data.error)
        setSuccess(data.success)

        if (data.success) {
          if (!brand) {
            form.reset()
          }
          onSuccess?.()
        }
      } catch (error) {
        console.error("Brand form error:", error)
        if (error instanceof Error) {
          setError(`Hata: ${error.message}`)
        } else {
          setError("Beklenmeyen bir hata oluştu!")
        }
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marka Adı</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Nike, Adidas, Zara, vs."
                    type="text"
                    onChange={(e) => {
                      field.onChange(e)
                      // ✅ Marka adı değiştiğinde otomatik config oluştur
                      const brandName = e.target.value
                      if (brandName && !brand?.id) { // Sadece yeni marka için
                        const baseUrl = form.getValues('apiProductsUrl')
                        const autoConfig = createBrandConfig(brandName, baseUrl)
                        form.setValue('apiConfig', JSON.stringify(autoConfig, null, 2))
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground">
                  Marka adı girildiğinde otomatik config oluşturulur
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açıklama</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Marka açıklaması..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiProductsUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Products URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="https://www.zara.com/tr/tr/category/{categoryId}/products?ajax=true"
                    type="url"
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground">
                  Kategori API - Ürün ID'lerini toplar
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiProductDetailsUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Product Details URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="https://www.zara.com/tr/tr/product/{apiId}/extra-detail?ajax=true"
                    type="url"
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground">
                  Ürün Detay API - Tek tek ürün detaylarını toplar
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web Sitesi</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="https://www.zara.com"
                    type="url"
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground">
                  Markanın resmi web sitesi adresi
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Marka Durumu</FormLabel>
                  <div className="text-[0.8rem] text-muted-foreground">
                    {field.value ? "Marka aktif" : "Marka pasif"}
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
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <Button disabled={isPending} type="submit" className="w-full">
          {brand ? "Güncelle" : "Oluştur"}
        </Button>
      </form>
    </Form>
  )
}
