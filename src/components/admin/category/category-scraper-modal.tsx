"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, CheckCircle2, AlertCircle, Bot, Package } from "lucide-react"
import { toast } from "sonner"
import { getBrandConfig, getBrandInfo, isBrandSupported } from '@/lib/brand-config'

// Zara API scraping function
async function scrapeZaraApi(apiId: string, categoryId: number, testCount?: number | null) {
  const response = await fetch('/api/zara-scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiId, categoryId, testCount }),
  });

  return response.json();
}

// Pull & Bear API scraping function
async function scrapePullBearApi(apiId: string, categoryId: number, testCount?: number | null) {
  const response = await fetch('/api/pullbear-scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiId, categoryId, testCount }),
  });

  return response.json();
}

interface Category {
  id: number
  name: string
  slug: string
  apiId?: string | null // Schema'ya uygun: apiId alanı
  brand: {
    id: number;
    name: string;
    apiProductsUrl?: string | null;
    apiProductDetailsUrl?: string | null;
  }
  parent?: { id: number; name: string } | null
  level: number
  isLeaf: boolean
}


interface ScrapingBrandSpecific {
  category: Category
  trigger?: React.ReactNode
}

export function CategoryScraperModal({ category, trigger }: ScrapingBrandSpecific) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testCount, setTestCount] = useState<number | null>(null)
  const [scrollPosition, setScrollPosition] = useState<number>(0)

  // Modal açıldığında ve kapandığında scroll pozisyonunu koru
  useEffect(() => {
    if (isOpen) {
      // Modal açıldığında scroll pozisyonunu kaydet
      const currentScrollY = window.scrollY
      setScrollPosition(currentScrollY)

      // Body scroll'u engelle
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '15px'
    } else {
      // Modal kapandığında scroll'u geri yükle
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''

      // Scroll pozisyonunu geri yükle
      setTimeout(() => {
        window.scrollTo(0, scrollPosition)
      }, 100)
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen, scrollPosition])

  // Debug: Marka ismini kontrol et
  console.log('🔍 [DEBUG] Category brand name:', category.brand.name)
  console.log('🔍 [DEBUG] Category API ID:', category.apiId)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    error?: string
    jobId?: string
    totalProducts?: number
    savedCount?: number
  } | null>(null)

  const handleZaraScrape = async () => {
    if (!category.apiId) {
      toast.error(`Bu kategorinin API ID'si bulunmuyor`)
      return
    }

    // Scroll pozisyonunu koru
    const scrollY = window.scrollY

    setIsLoading(true)
    setResult(null)

    try {
      console.log(`🚀 [MODAL] Starting ZARA API scraping for category:`, category.name, 'API ID:', category.apiId)

      const scrapingResult = await scrapeZaraApi(category.apiId, category.id, testCount)

      console.log(`📊 [MODAL] ZARA API scraping result:`, scrapingResult)

      if (scrapingResult.success) {
        const savedCount = scrapingResult.data?.savedProducts || 0
        setResult({
          success: true,
          message: scrapingResult.message || `${savedCount} ürün başarıyla kaydedildi!`,
          savedCount: savedCount
        })
        toast.success(`${savedCount} ürün başarıyla kaydedildi!`)
        console.log(`✅ [MODAL] ZARA API scraping completed successfully`)
      } else {
        const errorMessage = scrapingResult.message || "Zara API scraping başarısız"
        setResult({
          success: false,
          error: errorMessage
        })
        toast.error(errorMessage)
        console.error(`❌ [MODAL] ZARA API scraping failed:`, errorMessage)
      }
    } catch (error) {
      console.error(`❌ [MODAL] Exception during ZARA API scraping:`, error)
      const errorMsg = error instanceof Error ? error.message : "Bilinmeyen hata oluştu"
      setResult({
        success: false,
        error: errorMsg
      })
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)

      // Scroll pozisyonunu geri yükle
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY)
      })
    }
  }

  const handleSeeAllScrape = async () => {
    // Scroll pozisyonunu koru
    const scrollY = window.scrollY

    setIsLoading(true)
    setResult(null)

    try {
      console.log(`🔗 [MODAL] Starting "Tümünü Gör" product linking for category ${category.id}`)

      const response = await fetch('/api/link-sibling-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seeAllCategoryId: category.id
        }),
      })

      const linkingResult = await response.json()
      console.log(`📊 [MODAL] "Tümünü Gör" linking result:`, linkingResult)

      if (linkingResult.success) {
        const message = `"Tümünü Gör" kategorisi başarıyla işlendi: ${linkingResult.data.totalProductsLinked} ürün bağlandı`
        setResult({
          success: true,
          message: message,
          savedCount: linkingResult.data.totalProductsLinked
        })
        toast.success(message)
        console.log(`✅ [MODAL] "Tümünü Gör" linking completed successfully`)
      } else {
        const errorMessage = linkingResult.message || "Tümünü Gör ürün bağlama başarısız"
        setResult({
          success: false,
          error: errorMessage
        })
        toast.error(errorMessage)
        console.error(`❌ [MODAL] "Tümünü Gör" linking failed:`, errorMessage)
      }
    } catch (error) {
      console.error(`❌ [MODAL] Exception during "Tümünü Gör" linking:`, error)
      const errorMsg = error instanceof Error ? error.message : "Bilinmeyen hata oluştu"
      setResult({
        success: false,
        error: errorMsg
      })
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)

      // Scroll pozisyonunu geri yükle
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY)
      })
    }
  }

  const handlePullBearScrape = async () => {
    if (!category.apiId) {
      toast.error(`Bu kategorinin API ID'si bulunmuyor`)
      return
    }

    // Scroll pozisyonunu koru
    const scrollY = window.scrollY

    setIsLoading(true)
    setResult(null)

    try {
      console.log(`🚀 [MODAL] Starting PULL & BEAR API scraping for category:`, category.name, 'API ID:', category.apiId)

      const scrapingResult = await scrapePullBearApi(category.apiId, category.id, testCount)

      console.log(`📊 [MODAL] PULL & BEAR API scraping result:`, scrapingResult)

      if (scrapingResult.success) {
        setResult({
          success: true,
          message: scrapingResult.message,
          savedCount: scrapingResult.created + scrapingResult.updated
        })
        toast.success(`${scrapingResult.created + scrapingResult.updated} ürün başarıyla kaydedildi!`)
        console.log(`✅ [MODAL] PULL & BEAR API scraping completed successfully`)
      } else {
        const errorMessage = scrapingResult.message || "Pull & Bear API scraping başarısız"
        setResult({
          success: false,
          error: errorMessage
        })
        toast.error(errorMessage)
        console.error(`❌ [MODAL] PULL & BEAR API scraping failed:`, errorMessage)
      }
    } catch (error) {
      console.error(`❌ [MODAL] Exception during PULL & BEAR API scraping:`, error)
      const errorMsg = error instanceof Error ? error.message : "Bilinmeyen hata oluştu"
      setResult({
        success: false,
        error: errorMsg
      })
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)

      // Scroll pozisyonunu geri yükle
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY)
      })
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setResult(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bot className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {category.apiId ? `${category.brand.name} Scraper` : 'Kategori Scraper'}
          </DialogTitle>
          <DialogDescription>
            Bu kategorideki ürünleri otomatik olarak çek ve veritabanına kaydet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Kategori Bilgileri */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Kategori Detayları</h3>
              <Badge variant="secondary">{category.brand.name}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Kategori:</span>
                <span className="ml-2 font-medium">{category.name}</span>
              </div>

              {category.parent && (
                <div>
                  <span className="text-muted-foreground">Üst Kategori:</span>
                  <span className="ml-2">{category.parent.name}</span>
                </div>
              )}

              <div>
                <span className="text-muted-foreground">Seviye:</span>
                <span className="ml-2">{category.level}</span>
              </div>

              {category.apiId && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{category.brand.name} API ID:</span>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {category.apiId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* "Tümünü Gör" Kategorisi için Özel Ürün Bağlama - Tüm Markalar (Leaf ve Parent) */}
          {category.name.includes('Tümünü Gör') || category.name.includes('Tümü') ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-800">"Tümünü Gör" Kategorisi</span>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                {category.isLeaf
                  ? "Bu leaf kategori aynı seviyedeki diğer leaf kategorilerdeki ürünleri otomatik olarak kendisine bağlar. API çekimi yapmaz, sadece mevcut ürünleri organize eder."
                  : "Bu kategori aynı seviyedeki leaf kategorilerdeki ürünleri otomatik olarak kendisine bağlar. API çekimi yapmaz, sadece mevcut ürünleri organize eder."
                }
              </p>

              <Button
                onClick={handleSeeAllScrape}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ürünler Bağlanıyor...
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 mr-2 bg-white rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">🔗</span>
                    </div>
                    Aynı Seviyedeki Ürünleri Buraya Bağla
                  </>
                )}
              </Button>
            </div>
          ) : !category.apiId ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{category.brand.name} API ID Eksik</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Bu kategorinin {category.brand.name} API ID'si tanımlı değil. Scraping yapabilmek için önce kategoriyi düzenleyip manuel olarak API ID ekleyiniz.
              </p>
              {category.brand.apiProductsUrl && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-700">
                    <strong>Brand API URL:</strong> {category.brand.apiProductsUrl}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Test Ürün Sayısı Seçenekleri */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="font-medium text-gray-800">Test Ürün Sayısı</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    onClick={() => setTestCount(null)}
                    variant={testCount === null ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    Tümü
                  </Button>
                  <Button
                    onClick={() => setTestCount(1)}
                    variant={testCount === 1 ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    1 Adet
                  </Button>
                  <Button
                    onClick={() => setTestCount(10)}
                    variant={testCount === 10 ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    10 Adet
                  </Button>
                  <Button
                    onClick={() => setTestCount(50)}
                    variant={testCount === 50 ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    50 Adet
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {testCount === null
                    ? "Tüm ürünler çekilecek"
                    : `Sadece ${testCount} adet test ürün çekilecek`
                  }
                </p>
              </div>


              {/* Marka-Spesifik API Scraping Butonları */}
              {(() => {
                // Dinamik marka konfigürasyonu
                const baseConfig = getBrandConfig(category.brand.name)

                if (!baseConfig) {
                  // Bilinmeyen marka için varsayılan konfigürasyon
                  return (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="font-medium text-gray-800">{category.brand.name} API Scraping</span>
                      </div>
                      <Button
                        onClick={() => toast.info(`${category.brand.name} API entegrasyonu henüz hazır değil`)}
                        disabled={isLoading}
                        className="w-full"
                        variant="outline"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        {category.brand.name} API Entegrasyonu Bekleniyor
                      </Button>
                    </div>
                  )
                }

                // Marka-spesifik handler'ları ayarla
                const handlers: Record<string, () => void> = {
                  'Zara': handleZaraScrape,
                  'Pull & Bear': handlePullBearScrape,
                  'H&M': () => toast.info('H&M API entegrasyonu henüz hazır değil'),
                  'Mango': () => toast.info('Mango API entegrasyonu henüz hazır değil'),
                  'Nike': () => toast.info('Nike API entegrasyonu henüz hazır değil'),
                  'Adidas': () => toast.info('Adidas API entegrasyonu henüz hazır değil')
                }

                const handler = handlers[category.brand.name] || (() => toast.info(`${category.brand.name} API entegrasyonu henüz hazır değil`))

                // Dinamik buton metni
                const buttonText = testCount === null
                  ? baseConfig.buttonText
                  : baseConfig.buttonText.replace('Tüm Ürünleri', `${testCount} Test Ürünü`)

                return (
                  <div className={`p-4 border rounded-lg ${baseConfig.colors}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${baseConfig.dotColor}`}></div>
                      <span className="font-medium">{category.brand.name} API Scraping</span>
                    </div>
                    <Button
                      onClick={handler}
                      disabled={isLoading}
                      className="w-full"
                      variant="default"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {baseConfig.loadingText}
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 mr-2" />
                          {buttonText}
                        </>
                      )}
                    </Button>
                  </div>
                )
              })()}

              {/* Sonuçlar */}
              {result && (
                <div className={`p-4 rounded-lg border ${result.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="space-y-1">
                      <div className="font-medium">
                        {result.success ? 'Başarılı!' : 'Hata'}
                      </div>
                      <div className="text-sm">
                        {result.success ? result.message : result.error}
                      </div>
                      {result.success && result.jobId && (
                        <div className="text-xs opacity-75">
                          Job ID: {result.jobId}
                        </div>
                      )}
                      {result.success && result.savedCount && (
                        <div className="text-xs opacity-75">
                          Kaydedilen Ürün: {result.savedCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bilgi Notları */}
              {(() => {
                // Dinamik marka bilgi konfigürasyonu
                const info = getBrandInfo(category.brand.name)

                return (
                  <div className={`text-xs text-muted-foreground p-3 rounded-lg ${info.bgColor}`}>
                    <div className="font-medium mb-1">
                      ℹ️ {category.brand.name} API Scraping Bilgileri:
                    </div>
                    <ul className="space-y-1">
                      <li>• <strong>Hızlı ve Güvenilir:</strong> Doğrudan API'lerden veri çeker</li>
                      <li>• <strong>Otomatik Ürün Bilgileri:</strong> İsim, fiyat, görsel, renk, beden bilgileri</li>
                      <li>• <strong>Veritabanına Kayıt:</strong> Ürünler otomatik olarak veritabanına kaydedilir</li>
                      <li>• <strong>Marka Ataması:</strong> Ürünler otomatik olarak ilgili markaya atanır</li>
                      <li>• <strong>Kategori Bağlantısı:</strong> Ürünler bu kategoriye otomatik bağlanır</li>
                      <li>• <strong>Test Modu:</strong> Küçük miktarlarda test yapabilirsiniz</li>
                      <li>• <strong>{category.brand.name} API Özellikleri:</strong> {info.features.join(', ')}</li>
                    </ul>
                  </div>
                )
              })()}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
