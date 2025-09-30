'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Palette,
  Calendar,
  TrendingUp,
  Eye,
  RefreshCw,
  Plus,
  Heart
} from 'lucide-react'
import { getProducts, getProductStats } from '@/actions/scraping/products'

interface ProductVariant {
  id: string
  colorName: string
  colorCode?: string
  price?: string
  backgroundColor?: string
  images: any[]
  sizes: any[]
}

interface Product {
  id: string
  name: string
  slug: string
  basePrice?: string
  url?: string
  description?: string
  productCode?: string
  primaryImage?: string
  scrapedAt?: Date
  createdAt: Date
  brand: {
    name: string
  }
  categories: Array<{
    category: {
      text: string
    }
  }>
  variants: ProductVariant[]
}

interface ProductStats {
  total: number
  withVariants: number
  withImages: number
}

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownProductId, setDropdownProductId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsResult, statsResult] = await Promise.all([
        getProducts(),
        getProductStats()
      ])

      setProducts(productsResult as any)
      setStats(statsResult as any)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price?: string) => {
    if (!price) return 'Fiyat belirtilmemiş'
    return price
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse mb-2" />
                <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Scraping ile çekilen ürünler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Varyantlı Ürünler</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withVariants}</div>
              <p className="text-xs text-muted-foreground">
                Renk varyantı olan ürünler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Görselli Ürünler</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withImages}</div>
              <p className="text-xs text-muted-foreground">
                Ürün görseli olan ürünler
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ürün, marka veya kod ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz ürün yok'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Farklı arama terimleri deneyin'
                : 'Scraping yaparak ürün ekleyebilirsiniz'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer relative"
              onClick={() => window.location.href = `/admin/products/${product.id}`}
            >
              {/* Product Image Container */}
              <div className="relative bg-gray-100 aspect-[3/4] overflow-hidden mb-3">
                {/* Primary Product Image */}
                {product.primaryImage ? (
                  <img
                    src={product.primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Size Overlay - Zara Style */}
                {dropdownProductId === product.id && product.variants && product.variants[0]?.sizes && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-200">
                      <div className="text-xs font-medium text-gray-700 mb-2 text-center">BEDEN</div>
                      <div className="grid grid-cols-4 gap-1">
                        {product.variants[0].sizes.map((size, index) => (
                          <button
                            key={index}
                            className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 font-medium bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {size.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Action Buttons - Zara Style */}
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 bg-white hover:bg-gray-50 shadow-sm rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDropdownProductId(dropdownProductId === product.id ? null : product.id)
                    }}
                  >
                    <Plus className="h-4 w-4 text-black" />
                  </Button>
                </div>

              </div>

              {/* Product Info */}
              <div className="space-y-2">
                {/* Product Name - Zara Style */}
                <h3 className="text-sm font-medium leading-tight text-black">
                  {product.name}
                </h3>

                {/* Price - Zara Style */}
                <div className="text-sm font-medium text-black">
                  {formatPrice(product.basePrice)}
                </div>

                {/* Color Variants - Zara Style */}
                {product.variants && product.variants.length > 0 && (
                  <div className="flex items-center gap-1">
                    {/* Show first color swatch */}
                    {product.variants.slice(0, 1).map((variant) => (
                      <div
                        key={variant.id}
                        className="w-4 h-4 rounded-sm border border-gray-300"
                        style={{
                          backgroundColor: variant.backgroundColor || '#000000'
                        }}
                        title={variant.colorName}
                      />
                    ))}
                    {/* Show additional colors count */}
                    {product.variants.length > 1 && (
                      <span className="text-xs text-gray-600 font-normal">
                        +{product.variants.length - 1}
                      </span>
                    )}
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination info */}
      {filteredProducts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {filteredProducts.length} ürün gösteriliyor
          {products.length >= 50 && ' (ilk 50 ürün)'}
        </div>
      )}

    </div>
  )
}
