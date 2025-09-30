'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ExternalLink, Package, Image as ImageIcon, Palette } from 'lucide-react'
import Link from 'next/link'
import { getProducts } from '@/actions/scraping/products'

interface ProductImage {
  id: string
  url: string
  altText?: string | null
  order: number
  colorVariantId: string
  createdAt: Date
}

interface ProductSize {
  id: string
  size: string
  availability?: string | null
  colorVariantId: string
  createdAt: Date
  isSelected?: boolean | null
  originalOrder?: number | null
}

interface ProductVariant {
  id: string
  colorName: string
  colorCode?: string | null
  price?: string | null
  priceNum?: number | null
  discountPrice?: number | null
  backgroundColor?: string | null
  availability?: string | null
  sku?: string | null
  productId: string
  createdAt: Date
  updatedAt: Date
  originalIndex?: number | null
  scrapedImages?: number | null
  images: ProductImage[]
  sizes: ProductSize[]
}

interface Product {
  id: string
  name: string
  slug: string
  basePrice?: string | null
  discountPrice?: number | null
  currencyCode?: string | null
  url?: string | null
  description?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  productCode?: string | null
  composition?: string | null
  careInstructions?: string | null
  primaryImage?: string | null
  brandId: number
  lastSyncedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  scrapedAt?: Date | null
  brand: {
    id: number
    name: string
  }
  productCategory: Array<{
    category: {
      id: number
      name: string
    }
  }>
  variants: ProductVariant[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<ProductVariant | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const products = await getProducts()
      // foundProduct'u Product tipine uygun şekilde dönüştür
      const foundProductRaw = products.find((p: any) => p.id === productId)

      if (foundProductRaw) {
        // colorVariants ve diğer alanları Product tipine uygun şekilde dönüştür
        const productToSet: Product = {
          ...foundProductRaw,
          brandId: foundProductRaw.brand?.id ?? 0,
          updatedAt: (foundProductRaw as any).updatedAt
            ? new Date((foundProductRaw as any).updatedAt)
            : new Date(),
          brand: {
            id: foundProductRaw.brand?.id ?? 0,
            name: foundProductRaw.brand?.name ?? "",
          },
          productCategory: foundProductRaw.productCategories
            ? foundProductRaw.productCategories.map((cat: any) => ({
              category: {
                id: cat.category?.id,
                name: cat.category?.name,
              },
            }))
            : [],
          variants: foundProductRaw.colorVariants
            ? foundProductRaw.colorVariants.map((variant: any) => ({
              ...variant,
              images: variant.images || [],
              sizes: variant.sizes || [],
            }))
            : [],
        }

        setProduct(productToSet)

        // Varsayılan olarak ilk varyantı seç
        if (productToSet.variants && productToSet.variants.length > 0) {
          setSelectedColor(productToSet.variants[0])
        }
      } else {
        setProduct(null)
      }
      setSelectedImageIndex(0) // Ürün yüklendiğinde görsel indexini sıfırla
    } catch (error) {
      console.error('Ürün yüklenirken hata oluştu:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price?: string | null) => {
    if (!price) return 'Fiyat belirtilmemiş'
    return price
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 'loading' değişkeni tanımlı değilse, onu bir state olarak eklemelisiniz.
  // Örneğin, sayfanın başında şunu ekleyin:
  // const [loading, setLoading] = useState(false);

  if (typeof loading !== "undefined" && loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          {/* Yorum satırı kaldırıldı, kod düzeltildi */}
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 bg-muted rounded animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Ürün Bulunamadı</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Ürün bulunamadı</h3>
            <p className="text-muted-foreground">
              Aradığınız ürün mevcut değil veya silinmiş olabilir.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Ürün Detayları</h1>
      </div>

      {/* Product Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            {selectedColor?.images && selectedColor.images.length > 0 ? (
              <img
                src={selectedColor.images[selectedImageIndex]?.url || selectedColor.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : product.primaryImage ? (
              <img
                src={product.primaryImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ImageIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Color Variant Images - Tüm görselleri göster */}
          {selectedColor?.images && selectedColor.images.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Görseller ({selectedColor.images.length} adet)
              </h4>
              <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                {selectedColor.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity border-2 ${selectedImageIndex === index ? 'border-black' : 'border-transparent'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} - Görsel ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <div className="text-3xl font-semibold text-black">
                {formatPrice(product.basePrice)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.brand.name}</Badge>
              {product.productCode && (
                <Badge variant="outline">Kod: {product.productCode}</Badge>
              )}
            </div>
          </div>

          {/* Color Selection */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Renk Seçimi</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedColor(variant)
                      setSelectedImageIndex(0) // Reset to first image when color changes
                    }}
                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${selectedColor?.id === variant.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{
                        backgroundColor: variant.backgroundColor || '#000000'
                      }}
                    />
                    <span className="text-sm font-medium">{variant.colorName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {selectedColor?.sizes && selectedColor.sizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Beden Seçimi</h3>
              <div className="grid grid-cols-4 gap-2">
                {selectedColor.sizes.map((size, index) => (
                  <button
                    key={index}
                    className="p-3 border border-gray-300 rounded-lg hover:border-gray-400 text-sm font-medium transition-colors"
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="space-y-4">
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Açıklama</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.composition && (
              <div>
                <h3 className="font-semibold mb-2">Malzeme</h3>
                <p className="text-gray-700">{product.composition}</p>
              </div>
            )}

            {product.careInstructions && (
              <div>
                <h3 className="font-semibold mb-2">Bakım Talimatları</h3>
                <p className="text-gray-700">{product.careInstructions}</p>
              </div>
            )}

          </div>

          {/* Variant Details */}
          {selectedColor && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Seçilen Varyant</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Renk:</span> {selectedColor.colorName}
                </div>
                <div>
                  <span className="font-medium">SKU:</span> {selectedColor.sku || 'Belirtilmemiş'}
                </div>
                <div>
                  <span className="font-medium">Görsel Sayısı:</span> {selectedColor.images?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Beden Sayısı:</span> {selectedColor.sizes?.length || 0}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {product.url && (
              <Button
                onClick={() => window.open(product.url!, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {product.brand.name} web sitesinde görüntüle.
              </Button>
            )}
          </div>

          {/* Metadata */}
          <div className="text-sm text-gray-500 space-y-1">
            <div>Scraping Tarihi: {formatDate(product.scrapedAt || product.createdAt)}</div>
            <div>Toplam Varyant: {product.variants.length}</div>
            {product.productCategory && product.productCategory.length > 0 && (
              <div>Kategoriler: {product.productCategory.map(c => c.category.name).join(', ')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tüm Renk Varyantları ve Görselleri */}
      {product.variants && product.variants.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Tüm Renk Varyantları ve Görselleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {product.variants.map((variant, variantIndex) => (
                  <div key={variant.id || variantIndex} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: variant.backgroundColor || '#000000' }}
                      />
                      <h4 className="font-medium text-gray-900">
                        {variant.colorName} ({variant.images?.length || 0} görsel)
                      </h4>
                      {variant.colorCode && (
                        <Badge variant="secondary" className="text-xs">
                          {variant.colorCode}
                        </Badge>
                      )}
                    </div>

                    {variant.images && variant.images.length > 0 && (
                      <div className="grid grid-cols-6 gap-2">
                        {variant.images.map((image, imageIndex) => (
                          <div
                            key={imageIndex}
                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                          >
                            <img
                              src={image.url}
                              alt={`${product.name} - ${variant.colorName} - Görsel ${imageIndex + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => {
                                setSelectedColor(variant)
                                setSelectedImageIndex(imageIndex)
                                // Sayfayı yukarı kaydır
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
