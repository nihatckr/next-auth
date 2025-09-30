"use client"

import { useState } from "react"
import { Edit, Trash2, MoreVertical, Leaf, Folder, FolderOpen, Users, User, Link, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CategoryDialog } from "./category-dialog"
import { deleteCategory } from "@/actions/categories/category"

interface Category {
  id: number
  name: string // Schema'ya uygun: name alanı
  slug: string
  level: number
  sortOrder: number
  isActive: boolean
  isLeaf: boolean
  gender?: string | null
  apiId?: string | null // Schema'ya uygun: apiId alanı
  createdAt?: string
  updatedAt?: string
  brand: { id: number; name: string }
  parent?: { id: number; name: string } | null // Schema'ya uygun: name alanı
  subCategories: { id: number; name: string }[] // Schema'ya uygun: name alanı
  _count: { subCategories: number }
  // Diğer alanlar için optional
  icon?: string | null
  image?: string | null
  url?: string | null
}

interface CategoryCardProps {
  category: Category
  onUpdate: () => void
}

export function CategoryCard({ category, onUpdate }: CategoryCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`"${category.name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      return
    }

    setIsDeleting(true)
    try {
      console.log("Deleting category:", category.id, category.name)
      const result = await deleteCategory(category.id)
      console.log("Delete result:", result)

      if (result.success) {
        console.log("Category deleted successfully")
        onUpdate()
      } else {
        console.error("Delete failed:", result.error)
        alert(result.error || "Silme işlemi başarısız!")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Silme işlemi sırasında hata oluştu!")
    } finally {
      setIsDeleting(false)
    }
  }

  const getIcon = () => {
    if (category.isLeaf) {
      return <Leaf className="h-4 w-4 text-green-600" />
    }
    return category.subCategories.length > 0
      ? <FolderOpen className="h-4 w-4 text-blue-600" />
      : <Folder className="h-4 w-4 text-gray-600" />
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-purple-100 text-purple-800"
      case 1: return "bg-blue-100 text-blue-800"
      case 2: return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <div className="flex-1">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  /{category.slug}
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
                  disabled={isDeleting || category.subCategories.length > 0}
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
          <div className="space-y-4">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{category.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Marka:</span>
                  <div className="font-medium">{category.brand.name}</div>
                </div>
                {category.parent && (
                  <div>
                    <span className="text-muted-foreground">Parent:</span>
                    <div className="font-medium">{category.parent.name}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">Sıralama:</span>
                  <div className="font-medium">#{category.sortOrder}</div>
                </div>
                {category.gender && (
                  <div className="flex items-center gap-2">
                    {category.gender === 'woman' ? (
                      <User className="h-3 w-3 text-pink-500" />
                    ) : category.gender === 'man' ? (
                      <User className="h-3 w-3 text-blue-500" />
                    ) : (
                      <Users className="h-3 w-3 text-gray-500" />
                    )}
                    <span className="text-muted-foreground">Cinsiyet:</span>
                    <span className="font-medium">
                      {category.gender === 'woman' ? 'Kadın' :
                        category.gender === 'man' ? 'Erkek' : 'Unisex'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Badge'ler */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs ${getLevelColor(category.level)}`}
              >
                Level {category.level}
              </Badge>

              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? "Aktif" : "Pasif"}
              </Badge>

              {category.isLeaf && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Leaf className="h-3 w-3 mr-1" />
                  Leaf Category
                </Badge>
              )}

              {category.subCategories.length > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Folder className="h-3 w-3 mr-1" />
                  {category.subCategories.length} alt kategori
                </Badge>
              )}

              {category.gender && (
                <Badge variant="outline" className={
                  category.gender === 'woman'
                    ? "bg-pink-50 text-pink-700 border-pink-200"
                    : category.gender === 'man'
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                }>
                  {category.gender === 'woman' ? (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Kadın
                    </>
                  ) : category.gender === 'man' ? (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Erkek
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Unisex
                    </>
                  )}
                </Badge>
              )}
            </div>

            {/* Alt kategoriler listesi */}
            {category.subCategories.length > 0 && (
              <div className="border-t pt-3">
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  Alt Kategoriler:
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {category.subCategories.slice(0, 4).map(sub => (
                    <div key={sub.id} className="flex items-center gap-1 text-muted-foreground">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                      {sub.name}
                    </div>
                  ))}
                  {category.subCategories.length > 4 && (
                    <div className="text-muted-foreground italic">
                      ... ve {category.subCategories.length - 4} tane daha
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        category={category}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          onUpdate()
        }}
      />
    </>
  )
}
