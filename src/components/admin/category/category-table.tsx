"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Package,
  FolderOpen,
  Leaf,
  ExternalLink,
  Bot,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryScraperModal } from "./category-scraper-modal"


interface Category {
  id: number
  name: string
  slug: string
  level: number
  sortOrder: number
  isActive: boolean
  isLeaf: boolean
  gender?: string | null
  apiId?: string | null // Schema'ya uygun: apiId alanı
  createdAt?: Date | string
  updatedAt?: Date | string
  brand: { id: number; name: string }
  parent?: { id: number; name: string } | null
  subCategories: { id: number; name: string }[] // Schema'ya uygun: subCategories alanı
  _count: { subCategories: number } // Schema'ya uygun: subCategories alanı
}

interface Brand {
  id: number
  name: string
}

interface CategoryTableProps {
  categories: Category[]
  brands: Brand[]
  onAddCategory: (brandId?: number, parentId?: number) => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (categoryId: number, categoryName: string) => void
  onBulkScrapeBrand: (brandId: number, brandName: string) => void
  onBulkScrapeCategory: (categoryId: number, categoryName: string) => void
  expandedBrands?: string[]
  expandedCategories?: string[]
  onBrandExpandChange?: (brandId: string, expanded: boolean) => void
  onCategoryExpandChange?: (categoryId: string, expanded: boolean) => void
}

export function CategoryTable({
  categories,
  brands,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onBulkScrapeBrand,
  onBulkScrapeCategory,
  expandedBrands: controlledExpandedBrands,
  expandedCategories: controlledExpandedCategories,
  onBrandExpandChange,
  onCategoryExpandChange,
}: CategoryTableProps) {
  const [internalExpandedBrands, setInternalExpandedBrands] = useState<string[]>([])
  const [internalExpandedCategories, setInternalExpandedCategories] = useState<string[]>([])

  // Controlled veya uncontrolled mode
  const expandedBrands = controlledExpandedBrands ?? internalExpandedBrands
  const expandedCategories = controlledExpandedCategories ?? internalExpandedCategories

  // Hierarchical yapı oluştur
  const buildCategoryHierarchy = (categories: Category[]) => {
    const categoryMap = new Map<number, Category & { children: Category[] }>()

    // Önce tüm kategorileri map'e ekle ve children array'i ekle
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    // Parent-child ilişkilerini kur
    const rootCategories: (Category & { children: Category[] })[] = []
    categories.forEach(cat => {
      const categoryWithChildren = categoryMap.get(cat.id)!

      if (cat.parent) {
        const parent = categoryMap.get(cat.parent.id)
        if (parent) {
          parent.children.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    // Recursive olarak tüm seviyelerde sıralama yap
    const sortCategories = (cats: (Category & { children: Category[] })[]) => {
      cats.sort((a, b) => a.sortOrder - b.sortOrder)
      cats.forEach(cat => {
        if (cat.children.length > 0) {
          sortCategories(cat.children as (Category & { children: Category[] })[])
        }
      })
    }

    sortCategories(rootCategories)
    return rootCategories
  }

  // Brand başına kategorileri grupla
  const brandHierarchy = brands.map(brand => {
    const brandCategories = categories.filter(c => c.brand.id === brand.id)
    const rootCategories = buildCategoryHierarchy(brandCategories)

    return {
      brand,
      rootCategories,
      totalCount: brandCategories.length
    }
  }).filter(b => b.totalCount > 0)

  const toggleBrand = (brandId: string) => {
    const isExpanded = expandedBrands.includes(brandId)
    if (onBrandExpandChange) {
      onBrandExpandChange(brandId, !isExpanded)
    } else {
      setInternalExpandedBrands((prev: string[]) =>
        prev.includes(brandId)
          ? prev.filter((id: string) => id !== brandId)
          : [...prev, brandId]
      )
    }
  }

  const toggleCategory = (categoryId: string) => {
    const isExpanded = expandedCategories.includes(categoryId)
    if (onCategoryExpandChange) {
      onCategoryExpandChange(categoryId, !isExpanded)
    } else {
      setInternalExpandedCategories((prev: string[]) =>
        prev.includes(categoryId)
          ? prev.filter((id: string) => id !== categoryId)
          : [...prev, categoryId]
      )
    }
  }

  const getLevelIcon = (level: number, hasChildren: boolean) => {
    if (level === 1) return <Package className="h-4 w-4 text-blue-600" />
    if (level === 2) return <FolderOpen className="h-4 w-4 text-green-600" />
    if (hasChildren) return <FolderOpen className="h-4 w-4 text-purple-600" />
    return <Leaf className="h-4 w-4 text-green-500" />
  }

  const getLevelBadge = (level: number, isLeaf: boolean) => {
    const colors = {
      0: "bg-blue-100 text-blue-800 border-blue-200",
      1: "bg-green-100 text-green-800 border-green-200",
      2: "bg-orange-100 text-orange-800 border-orange-200",
      3: "bg-purple-100 text-purple-800 border-purple-200"
    }

    // Level ve isLeaf durumuna göre label belirle
    let label = ""
    if (level === 0) {
      label = "Ana Kategori"
    } else if (isLeaf) {
      label = "Yaprak Kategori"
    } else if (level === 1) {
      label = "Alt Kategori"
    } else {
      label = `Level ${level}`
    }

    return (
      <Badge variant="outline" className={`text-xs ${colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {label}
      </Badge>
    )
  }

  const CategoryRow = ({ category, depth = 0 }: { category: Category & { children: Category[] }; depth?: number }) => {
    const hasChildren = category.children.length > 0
    const isExpanded = expandedCategories.includes(`category-${category.id}`)
    const paddingLeft = depth * 24

    return (
      <>
        <TableRow className={`group hover:bg-muted/50 transition-all duration-200 ease-in-out ${!category.isActive ? 'opacity-60' : ''} ${isExpanded ? 'animate-in slide-in-from-top-1 duration-300' : ''}`}>
          <TableCell style={{ paddingLeft: `${16 + paddingLeft}px` }}>
            <div className="flex items-center gap-3">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => toggleCategory(`category-${category.id}`)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 ease-in-out" />
                  ) : (
                    <ChevronRight className="h-3 w-3 transition-transform duration-200 ease-in-out" />
                  )}
                </Button>
              ) : (
                <div className="w-6" />
              )}

              {getLevelIcon(category.level, hasChildren)}

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  {(category.name.includes('Tümünü Gör') || category.name.includes('Tümü')) && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🔗</span>
                    </div>
                  )}
                  {!category.isActive && (
                    <Badge variant="secondary" className="text-xs">Pasif</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  /{category.slug}
                </div>
              </div>
            </div>
          </TableCell>

          <TableCell>
            {getLevelBadge(category.level, category.isLeaf)}
          </TableCell>

          <TableCell>
            {category.gender && (
              <Badge variant="outline" className="text-xs">
                {category.gender === 'woman' ? 'Kadın' : 'Erkek'}
              </Badge>
            )}
          </TableCell>

          <TableCell>
            {hasChildren && (
              <Badge variant="secondary" className="text-xs">
                {category.children.length} alt kategori
              </Badge>
            )}
          </TableCell>

          <TableCell>
            <div className="flex items-center justify-end gap-1">
              {/* Scraper butonu - sadece leaf kategoriler için ve API ID'si olanlar için */}
              {category.isLeaf && category.apiId && (
                <CategoryScraperModal
                  category={category}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${category.brand.name === 'Zara'
                        ? 'hover:bg-blue-50 hover:text-blue-600 text-blue-600'
                        : 'hover:bg-green-50 hover:text-green-600 text-green-600'
                        }`}
                      title={`${category.brand.name} API'den Ürün Çek`}
                    >
                      <Bot className="h-4 w-4" />
                    </Button>
                  }
                />
              )}

              {/* API ID eksik uyarısı - leaf kategoriler için API ID'si olmayanlar için */}
              {category.isLeaf && !category.apiId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                  title={`${category.brand.name} API ID eksik - Manuel olarak ekleyiniz`}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              )}

              {/* Alt kategoriler için toplu scraping butonu */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => onBulkScrapeCategory(category.id, category.name)}
                  title="Tüm Alt Kategorileri Scrape Et"
                >
                  <Bot className="h-4 w-4" />
                </Button>
              )}


              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 text-green-600"
                onClick={() => onEditCategory(category)}
                title="Düzenle"
              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 text-red-600"
                onClick={() => onDeleteCategory(category.id, category.name)}
                disabled={hasChildren}
                title={hasChildren ? "Alt kategorileri olan kategori silinemez" : "Sil"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              {category.level < 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => onAddCategory(category.brand.id, category.id)}
                  title="Alt Kategori Ekle"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>

        {isExpanded && hasChildren && (
          <>
            {category.children
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((childCategory) => (
                <CategoryRow
                  key={childCategory.id}
                  category={childCategory as Category & { children: Category[] }}
                  depth={depth + 1}
                />
              ))}
          </>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {brandHierarchy.map((brandData) => {
        const isExpanded = expandedBrands.includes(`brand-${brandData.brand.id}`)

        return (
          <Card key={brandData.brand.id} className="overflow-hidden">
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleBrand(`brand-${brandData.brand.id}`)}
              className="transition-all duration-300 ease-in-out"
            >
              <CardHeader className="pb-3">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between w-full cursor-pointer hover:bg-muted/30 p-2 -m-2 rounded-md transition-colors">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 ease-in-out" />
                        ) : (
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 ease-in-out" />
                        )}
                      </Button>

                      <div className="w-3 h-3 bg-primary rounded-full" />

                      <CardTitle className="text-lg text-primary">
                        {brandData.brand.name}
                      </CardTitle>

                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {brandData.rootCategories.length} ana kategori
                      </Badge>

                      <Badge variant="outline">
                        Toplam: {brandData.totalCount} kategori
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddCategory(brandData.brand.id)
                        }}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ana Kategori Ekle
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onBulkScrapeBrand(brandData.brand.id, brandData.brand.name)
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        <Bot className="h-3 w-3 mr-1" />
                        Tüm Kategorileri Scrape Et
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>

              <CollapsibleContent className="transition-all duration-300 ease-in-out">
                <CardContent className="pt-0">
                  {brandData.rootCategories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kategori Adı</TableHead>
                          <TableHead className="w-32">Seviye</TableHead>
                          <TableHead className="w-24">Cinsiyet</TableHead>
                          <TableHead className="w-32">Alt Kategoriler</TableHead>
                          <TableHead className="w-28 text-right">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {brandData.rootCategories
                          .sort((a, b) => (a as { sortOrder: number }).sortOrder - (b as { sortOrder: number }).sortOrder)
                          .map((category) => (
                            <CategoryRow key={category.id} category={category} />
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Bu marka için henüz kategori eklenmemiş</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => onAddCategory(brandData.brand.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        İlk Kategoriyi Ekle
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )
      })}

      {brandHierarchy.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Henüz kategori yok</h3>
            <p className="text-muted-foreground mb-4">
              Kategori eklemek için önce bir marka seçin
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
