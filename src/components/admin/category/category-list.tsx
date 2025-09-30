"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Filter, Settings } from "lucide-react"
import { getCategories, deleteCategory } from "@/actions/categories/category"
import { getBrands } from "@/actions/categories/brand"
import { Button } from "@/components/ui/button"
import { CategoryDialog } from "./category-dialog"
import { CategoryTable } from "./category-table"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Category {
  id: number
  name: string // Schema'ya uygun: name alanı
  slug: string
  level: number
  sortOrder: number
  isActive: boolean
  isLeaf: boolean
  gender?: string | null
  icon?: string | null
  image?: string | null
  apiId?: string | null // Schema'ya uygun: apiId alanı
  createdAt?: Date | string
  updatedAt?: Date | string
  brand: { id: number; name: string }
  parent?: { id: number; name: string } | null // Schema'ya uygun: name alanı
  subCategories: { id: number; name: string }[] // Schema'ya uygun: name alanı
  _count: { subCategories: number }
}

interface Brand {
  id: number
  name: string
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null)
  const [parentIdForCreate, setParentIdForCreate] = useState<number | null>(null)
  const [contextBrandName, setContextBrandName] = useState<string>("")
  const [contextParentName, setContextParentName] = useState<string>("")
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [expandedBrands, setExpandedBrands] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [lastCreatedParentId, setLastCreatedParentId] = useState<number | null>(null)

  // Modal açılmadan önceki accordion durumlarını kaydet
  const [savedExpandedBrands, setSavedExpandedBrands] = useState<string[]>([])
  const [savedExpandedCategories, setSavedExpandedCategories] = useState<string[]>([])
  const [shouldRestoreAccordionState, setShouldRestoreAccordionState] = useState(false)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError("")

    const result = await getCategories(selectedBrandId || undefined)

    if (result.error) {
      setError(result.error)
    } else {
      setCategories(result.data || [])
    }

    setLoading(false)
  }, [selectedBrandId])

  const loadBrands = async () => {
    const result = await getBrands()
    if (result.success) {
      setBrands(result.data || [])
    }
  }



  // Modal açıldığında accordion durumlarını restore et
  useEffect(() => {
    loadBrands()
    loadCategories()

    if (!isCreateDialogOpen && !isEditDialogOpen && shouldRestoreAccordionState) {
      setExpandedBrands([...savedExpandedBrands])
      setExpandedCategories([...savedExpandedCategories])
      setShouldRestoreAccordionState(false)
    }

    if (isCreateDialogOpen && shouldRestoreAccordionState) {
      // Küçük bir delay ile restore et (DOM güncellemelerini bekle)
      const timeoutId = setTimeout(() => {
        setExpandedBrands([...savedExpandedBrands])
        setExpandedCategories([...savedExpandedCategories])
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [selectedBrandId, isCreateDialogOpen, shouldRestoreAccordionState, savedExpandedBrands, savedExpandedCategories, isEditDialogOpen, loadCategories])


  const handleAddCategory = (brandId?: number, parentId?: number) => {
    // Scroll pozisyonunu koru
    const currentScrollY = window.scrollY

    // Modal açılmadan önce mevcut accordion durumlarını kaydet
    setSavedExpandedBrands([...expandedBrands])
    setSavedExpandedCategories([...expandedCategories])

    if (brandId) setSelectedBrandId(brandId)
    setParentIdForCreate(parentId || null)
    setLastCreatedParentId(parentId || null) // Parent ID'yi sakla
    setEditingCategory(undefined)

    // Brand ismini bul ve set et
    const brand = brands.find(b => b.id === brandId)
    setContextBrandName(brand?.name || "")

    // Parent ismini bul ve set et
    const parent = categories.find(c => c.id === parentId)
    setContextParentName(parent?.name || "")

    // Tüm kategori ekleme işlemlerinde accordion durumlarını koru (restore mode)
    // Kullanıcı dropdown'ların kapanmasını istemiyor
    setShouldRestoreAccordionState(true)

    setIsCreateDialogOpen(true)

    // Scroll pozisyonunu koru
    setTimeout(() => {
      window.scrollTo(0, currentScrollY)
    }, 50)
  }

  const handleEditCategory = (category: Category) => {
    // Scroll pozisyonunu koru
    const currentScrollY = window.scrollY

    setEditingCategory(category)
    setSelectedBrandId(category.brand.id)
    setParentIdForCreate(null)
    setIsEditDialogOpen(true)

    // Scroll pozisyonunu koru
    setTimeout(() => {
      window.scrollTo(0, currentScrollY)
    }, 50)
  }

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`"${categoryName}" kategorisini silmek istediğinizden emin misiniz?`)) {
      return
    }

    // Scroll pozisyonunu koru
    const currentScrollY = window.scrollY

    try {
      console.log("Deleting category:", categoryId, categoryName)
      const result = await deleteCategory(categoryId)
      console.log("Delete result:", result)

      if (result.error) {
        console.error("Delete failed:", result.error)
        alert(`Hata: ${result.error}`)
      } else {
        console.log("Category deleted successfully")
        await loadCategories()
        // Scroll pozisyonunu geri yükle
        setTimeout(() => {
          window.scrollTo(0, currentScrollY)
        }, 100)
      }
    } catch (error) {
      console.error("Delete category error:", error)
      alert("Silme işlemi sırasında hata oluştu!")
    }
  }

  const handleBulkScrapeBrand = (brandId: number, brandName: string) => {
    // Bulk scrape brand functionality
    console.log("Bulk scrape brand:", brandId, brandName)
  }

  const handleBulkScrapeCategory = (categoryId: number, categoryName: string) => {
    // Bulk scrape category functionality
    console.log("Bulk scrape category:", categoryId, categoryName)
  }

  const handleDialogSuccess = () => {
    // Scroll pozisyonunu koru
    const currentScrollY = window.scrollY

    // Mevcut accordion durumlarını sakla
    const currentExpandedBrands = [...expandedBrands]
    const currentExpandedCategories = [...expandedCategories]

    // Parent ID'yi sakla (reset edilmeden önce)
    const savedLastCreatedParentId = lastCreatedParentId

    // Eğer alt kategori eklendiyse parent kategoriyi aç (level bazlı exclusive mode)
    if (savedLastCreatedParentId) {
      const parentIdStr = `category-${savedLastCreatedParentId}`
      const parentCategory = categories.find(c => c.id === savedLastCreatedParentId)
      if (parentCategory) {
        // Aynı level'daki diğer kategorileri kapat, sadece parent'ı aç
        const sameLevelCategories = categories
          .filter(c =>
            c.brand.id === parentCategory.brand.id &&
            c.level === parentCategory.level &&
            (parentCategory.parent?.id ? c.parent?.id === parentCategory.parent.id : !c.parent)
          )
          .map(c => `category-${c.id}`)

        setExpandedCategories(prev =>
          prev.filter(id => !sameLevelCategories.includes(id)).concat([parentIdStr])
        )
      }
    }

    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setParentIdForCreate(null)
    setLastCreatedParentId(null) // Reset parent ID
    setEditingCategory(undefined)
    // Context bilgilerini temizle ama accordion durumunu koru
    setContextBrandName("")
    setContextParentName("")

    // Kategorileri yenile
    loadCategories().then(() => {
      // Eğer restore flag'i varsa, kaydedilmiş durumları kullan
      if (shouldRestoreAccordionState) {
        setExpandedBrands([...savedExpandedBrands])
        if (!savedLastCreatedParentId) {
          setExpandedCategories([...savedExpandedCategories])
        }
      } else {
        // Normal brand/kategori ekleme durumunda mevcut durumları koru
        setExpandedBrands(currentExpandedBrands)
        if (!savedLastCreatedParentId) {
          setExpandedCategories(currentExpandedCategories)
        }
      }

      // Restore flag'ini temizle
      setShouldRestoreAccordionState(false)

      // Scroll pozisyonunu geri yükle
      setTimeout(() => {
        window.scrollTo(0, currentScrollY)
      }, 100)
    })
  }

  const handleBrandExpandChange = (brandId: string, expanded: boolean) => {
    // Modal açıkken accordion değişikliklerini engelle
    if (isCreateDialogOpen || isEditDialogOpen) {
      return
    }

    setExpandedBrands(prev => {
      if (expanded) {
        // Sadece seçilen brand'ı aç, diğerlerini kapat (exclusive mode)
        return [brandId]
      } else {
        // Kapatıyorsa sadece bu brand'ı çıkar
        return prev.filter(id => id !== brandId)
      }
    })

    // Brand değiştiğinde kategori accordion'larını da temizle
    if (expanded) {
      setExpandedCategories([])
    }
  }

  const handleCategoryExpandChange = (categoryId: string, expanded: boolean) => {
    // Modal açıkken accordion değişikliklerini engelle
    if (isCreateDialogOpen || isEditDialogOpen) {
      return
    }

    setExpandedCategories(prev => {
      if (expanded) {
        const currentCategory = categories.find(c => `category-${c.id}` === categoryId)
        if (currentCategory) {
          // Aynı level ve aynı brand'daki kategorileri filtrele
          const sameLevelCategories = categories
            .filter(c =>
              c.brand.id === currentCategory.brand.id &&
              c.level === currentCategory.level &&
              (currentCategory.parent?.id ? c.parent?.id === currentCategory.parent.id : !c.parent)
            )
            .map(c => `category-${c.id}`)

          // Aynı level'daki diğer açık kategorileri kapat, farklı level'dakileri koru
          return prev.filter(id => !sameLevelCategories.includes(id)).concat([categoryId])
        }
        return [...prev, categoryId]
      } else {
        // Kapatıyorsa sadece bu kategoriyi çıkar
        return prev.filter(id => id !== categoryId)
      }
    })
  }

  // İstatistikler hesapla
  const stats = {
    totalBrands: brands.length,
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.isActive).length,
    leafCategories: categories.filter(c => c.isLeaf).length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Kategori Yönetimi</h2>
            <p className="text-muted-foreground">
              Ürün kategorilerini yönetin ve düzenleyin
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kategori Yönetimi</h2>
          <p className="text-muted-foreground">
            Ürün kategorilerini yönetin ve düzenleyin
          </p>
        </div>

        <div className="flex items-center gap-2">

          <Button onClick={() => handleAddCategory()}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kategori
          </Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Marka</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBrands}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kategori</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kategoriler</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaf Kategoriler</CardTitle>
            <Badge variant="outline" className="text-xs">Ürün Atanabilir</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.leafCategories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtreler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Select
                value={selectedBrandId?.toString() || "all"}
                onValueChange={(value) => {
                  setSelectedBrandId(value === "all" ? null : Number(value))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Marka seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Markalar</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBrandId && (
              <Button
                variant="outline"
                onClick={() => setSelectedBrandId(null)}
              >
                Filtreyi Temizle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Category Table */}
      <CategoryTable
        categories={categories}
        brands={brands}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onBulkScrapeBrand={handleBulkScrapeBrand}
        onBulkScrapeCategory={handleBulkScrapeCategory}
        expandedBrands={expandedBrands}
        expandedCategories={expandedCategories}
        onBrandExpandChange={handleBrandExpandChange}
        onCategoryExpandChange={handleCategoryExpandChange}
      />

      {/* Create Dialog */}
      <CategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        parentId={parentIdForCreate}
        brandName={contextBrandName}
        parentName={contextParentName}
        onSuccess={handleDialogSuccess}
      />

      {/* Edit Dialog */}
      <CategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        category={editingCategory}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
