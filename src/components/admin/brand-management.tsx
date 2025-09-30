"use client"

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,

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
// import { toast } from 'sonner' // Toast functionality will be added later

// Types
interface Brand {
  id: number
  name: string
  categoryCount?: number
  createdAt?: string
}

export function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newBrandName, setNewBrandName] = useState("")
  const [editingBrand, setEditingBrand] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  const startEdit = (brand: Brand) => {
    setEditingBrand(brand.id)
    setEditValue(brand.name)
  }

  const saveEdit = async () => {
    if (!editingBrand || !editValue.trim()) return

    try {
      // API call would go here
      setBrands(brands.map(brand =>
        brand.id === editingBrand
          ? { ...brand, name: editValue }
          : brand
      ))
      console.log('Marka güncellendi')
      setEditingBrand(null)
      setEditValue("")
    } catch (error) {
      console.error('Güncelleme başarısız: ', error)
    }
  }

  const cancelEdit = () => {
    setEditingBrand(null)
    setEditValue("")
  }

  const deleteBrand = async (brandId: number) => {
    const brand = brands.find(b => b.id === brandId)
    if (brand?.categoryCount && brand.categoryCount > 0) {
      alert('Bu markaya ait kategoriler var. Önce kategorileri silin.')
      return
    }

    try {
      // API call would go here
      setBrands(brands.filter(brand => brand.id !== brandId))
      console.log('Marka silindi')
    } catch (error) {
      console.error('Silme başarısız: ', error)
    }
  }

  const addBrand = async () => {
    if (!newBrandName.trim()) return

    try {
      // API call would go here
      const newBrand: Brand = {
        id: Date.now(), // In real app, this would come from API
        name: newBrandName,
        categoryCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }

      setBrands([...brands, newBrand])
      console.log('Marka eklendi')
      setIsAddDialogOpen(false)
      setNewBrandName("")
    } catch (error) {
      console.error(`Ekleme başarısız: ${error}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Markalar</h2>
          <p className="text-sm text-gray-600">
            Toplam {brands.length} marka
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Marka
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Brands List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {brands.map((brand) => (
              <div key={brand.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {editingBrand === brand.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 max-w-xs"
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
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{brand.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="secondary" className="text-xs">
                              {brand.categoryCount || 0} kategori
                            </Badge>
                            {brand.createdAt && (
                              <span>Eklendi: {brand.createdAt}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {editingBrand !== brand.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(brand)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/admin/categories?brand=${brand.id}`}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Kategorileri Yönet
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteBrand(brand.id)}
                          className="text-red-600"
                          disabled={!!(brand.categoryCount && brand.categoryCount > 0)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}

            {brands.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Henüz marka bulunmuyor. İlk markayı ekleyin.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Brand Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Marka Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand-name">Marka Adı</Label>
              <Input
                id="brand-name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Marka adını girin"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={addBrand} disabled={!newBrandName.trim()}>
                Ekle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
