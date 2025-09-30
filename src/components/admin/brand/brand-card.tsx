"use client"

import { useState } from "react"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BrandDialog } from "./brand-dialog"
import { deleteBrand } from "@/actions/categories/brand"
import NextImage from "next/image"
interface Brand {
  id: number
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  url?: string | null
  isActive: boolean
  category?: { id: number; text: string }[]
  // ✅ API KONFIGÜRASYONU - Schema'ya uygun
  apiProductsUrl?: string | null
  apiProductDetailsUrl?: string | null
  apiConfig?: string | null
}

interface BrandCardProps {
  brand: Brand
  onUpdate: () => void
}

export function BrandCard({ brand, onUpdate }: BrandCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`"${brand.name}" markasını silmek istediğinizden emin misiniz?`)) {
      return
    }

    setIsDeleting(true)
    const result = await deleteBrand(brand.id)

    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || "Silme işlemi başarısız!")
    }

    setIsDeleting(false)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {brand.logo && (
                <NextImage
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={80}
                  className="   object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div>
                <CardTitle className="text-lg">{brand.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  /{brand.slug}
                </CardDescription>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting || (brand.category && brand.category.length > 0)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {brand.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {brand.description}
              </p>
            )}

            {brand.url && (
              <div className="text-sm">
                <span className="text-muted-foreground">Web sitesi: </span>
                <a
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {brand.url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* ✅ API KONFIGÜRASYONU BİLGİLERİ */}
            {brand.apiProductsUrl && (
              <div className="text-sm">
                <span className="text-muted-foreground">📋 Kategori API: </span>
                <div className="text-primary font-mono text-xs break-all truncate" title={brand.apiProductsUrl}>
                  {brand.apiProductsUrl.length > 50
                    ? `${brand.apiProductsUrl.substring(0, 50)}...`
                    : brand.apiProductsUrl}
                </div>
              </div>
            )}

            {brand.apiProductDetailsUrl && (
              <div className="text-sm">
                <span className="text-muted-foreground">🛍️ Ürün Detay API: </span>
                <div className="text-primary font-mono text-xs break-all truncate" title={brand.apiProductDetailsUrl}>
                  {brand.apiProductDetailsUrl.length > 50
                    ? `${brand.apiProductDetailsUrl.substring(0, 50)}...`
                    : brand.apiProductDetailsUrl}
                </div>
              </div>
            )}

            {brand.apiConfig && (
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">API Config: </span>
                  <Badge variant="outline" className="ml-1">
                    {(() => {
                      try {
                        const config = JSON.parse(brand.apiConfig)
                        const hasCategoryApi = config.categoryApi ? '📋' : '✗'
                        const hasProductApi = config.productApi ? '🛍️' : '✗'
                        const scrapingConfig = config.scraping ? '✓' : '✗'
                        return `${hasCategoryApi}${hasProductApi} ${scrapingConfig} scraping`
                      } catch {
                        return "JSON Config"
                      }
                    })()}
                  </Badge>
                </div>
                {(() => {
                  try {
                    const config = JSON.parse(brand.apiConfig)
                    if (config.categoryApi && config.productApi) {
                      return (
                        <div className="text-xs text-muted-foreground">
                          📋 Kategori: {config.categoryApi.endpoint?.split('/').pop() || 'N/A'} |
                          🛍️ Ürün: {config.productApi.endpoint?.split('/').pop() || 'N/A'}
                        </div>
                      )
                    }
                  } catch { }
                  return null
                })()}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={brand.isActive ? "default" : "secondary"}>
                  {brand.isActive ? "Aktif" : "Pasif"}
                </Badge>

                <Badge variant="outline">
                  {brand.category?.length || 0} kategori
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BrandDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        brand={brand}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          onUpdate()
        }}
      />
    </>
  )
}
