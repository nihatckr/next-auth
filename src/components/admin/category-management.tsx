"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Save, X, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// Types
interface Brand {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
  brandId: number
  parentId?: number
  children?: Category[]
  level: number
}

interface CategoryManagementProps {
  brands: Brand[]
  permissions: {
    canCreate: boolean
    canUpdate: boolean
    canDelete: boolean
    canReorder: boolean
  }
}

// Boş başlangıç - gerçek veri API'den gelecek

export function CategoryManagementPage({ brands, permissions }: CategoryManagementProps) {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", parentId: null as number | null })

  // Load categories when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      // Mock data loading - replace with actual API call
      const brandCategories = mockCategories.filter(cat => cat.brandId === selectedBrand)
      setCategories(brandCategories)
      setExpandedItems(new Set([1, 2, 5])) // Auto expand some items for demo
    } else {
      setCategories([])
    }
  }, [selectedBrand])

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedItems)
    if (expandedItems.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const startEdit = (category: Category) => {
    if (!permissions.canUpdate) return
    setEditingItem(category.id)
    setEditValue(category.name)
  }

  const saveEdit = async () => {
    if (!editingItem || !editValue.trim()) return

    try {
      // API call would go here
      console.log('Saving edit:', editingItem, editValue)
      toast.success('Kategori güncellendi')
      setEditingItem(null)
      setEditValue("")
      // Refresh categories
    } catch (error) {
      toast.error(`Güncelleme başarısız. ${error}`)
    }
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditValue("")
  }

  const deleteCategory = async (categoryId: number) => {
    if (!permissions.canDelete) return

    try {
      // API call would go here
      console.log('Deleting category:', categoryId)
      toast.success('Kategori silindi')
      // Refresh categories
    } catch (error) {
      toast.error(`Silme başarısız. ${error}`)
    }
  }

  const addCategory = async () => {
    if (!newCategory.name.trim() || !selectedBrand) return

    try {
      // API call would go here
      console.log('Adding category:', newCategory)
      toast.success('Kategori eklendi')
      setIsAddDialogOpen(false)
      setNewCategory({ name: "", parentId: null })
      // Refresh categories
    } catch (error) {
      toast.error(`Ekleme başarısız. ${error}`)
    }
  }

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className="w-full">
        <div
          className={`flex items-center gap-2 p-2 hover:bg-gray-50 border-l-2 border-gray-200 ${level > 0 ? `ml-${level * 6}` : ''
            }`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Expand/Collapse */}
          {category.children && category.children.length > 0 ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
            >
              {expandedItems.has(category.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex-shrink-0" />
          )}

          {/* Category Name */}
          <div className="flex-1 min-w-0">
            {editingItem === category.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8"
                  autoFocus
                />
                <Button size="sm" onClick={saveEdit} className="h-8 px-2">
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 px-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Level {level}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {permissions.canCreate && (
                        <DropdownMenuItem
                          onClick={() => {
                            setNewCategory({ name: "", parentId: category.id })
                            setIsAddDialogOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Alt Kategori Ekle
                        </DropdownMenuItem>
                      )}
                      {permissions.canUpdate && (
                        <DropdownMenuItem onClick={() => startEdit(category)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Düzenle
                        </DropdownMenuItem>
                      )}
                      {permissions.canDelete && (
                        <DropdownMenuItem
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render children if expanded */}
        {category.children &&
          expandedItems.has(category.id) &&
          renderCategoryTree(category.children, level + 1)}
      </div>
    ))
  }

  const getAllCategories = (categories: Category[]): Category[] => {
    let allCategories: Category[] = []
    categories.forEach(cat => {
      allCategories.push(cat)
      if (cat.children) {
        allCategories = [...allCategories, ...getAllCategories(cat.children)]
      }
    })
    return allCategories
  }

  return (
    <div className="space-y-6">
      {/* Brand Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Marka Seçimi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="brand-select">Marka</Label>
              <Select
                value={selectedBrand?.toString() || ""}
                onValueChange={(value) => setSelectedBrand(parseInt(value))}
              >
                <SelectTrigger id="brand-select">
                  <SelectValue placeholder="Bir marka seçin" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBrand && permissions.canCreate && (
              <div className="mt-6">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setNewCategory({ name: "", parentId: null })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ana Kategori Ekle
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Tree */}
      {selectedBrand && (
        <Card>
          <CardHeader>
            <CardTitle>
              {brands.find(b => b.id === selectedBrand)?.name} - Kategori Hiyerarşisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <div className="border rounded-lg">
                {renderCategoryTree(categories)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Bu markaya ait kategori bulunmuyor.
                {permissions.canCreate && " Yeni kategori eklemek için yukarıdaki butonu kullanın."}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newCategory.parentId ? "Alt Kategori Ekle" : "Ana Kategori Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {newCategory.parentId && (
              <div>
                <Label>Üst Kategori</Label>
                <p className="text-sm text-gray-600">
                  {getAllCategories(categories).find(c => c.id === newCategory.parentId)?.name}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="category-name">Kategori Adı</Label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Kategori adını girin"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={addCategory} disabled={!newCategory.name.trim()}>
                Ekle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { CategoryManagementPage as CategoryManagement }
