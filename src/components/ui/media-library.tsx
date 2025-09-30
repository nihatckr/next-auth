"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Image as ImageIcon, Grid, List, Search, Filter, Trash2, Check } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  fileName: string
  originalName: string
  size: number
  type: string
  altText?: string
  title?: string
  description?: string
  uploadedAt: Date
  isPrimary: boolean
  category?: string
  tags?: string[]
}

interface MediaLibraryProps {
  onImageSelect: (images: MediaItem[]) => void
  selectedImages?: MediaItem[]
  maxImages?: number
  allowMultiple?: boolean
}

export function MediaLibrary({
  onImageSelect,
  selectedImages = [],
  maxImages = 10,
  allowMultiple = true
}: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('uploadedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Media items yükle
  useEffect(() => {
    loadMediaItems()
  }, [])

  const loadMediaItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/media')
      const result = await response.json()

      if (result.success) {
        const { items } = result.data

        // Tags'ı parse et
        const processedItems = items.map((item: any) => ({
          ...item,
          uploadedAt: new Date(item.uploadedAt),
          tags: item.tags ? JSON.parse(item.tags) : []
        }))

        setMediaItems(processedItems)
      } else {
        console.error('Media items yüklenemedi:', result.error)
      }
    } catch (error) {
      console.error('Media items yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter ve search
  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.altText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || !categoryFilter || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Sort
  const sortedItems = filteredItems.sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy) {
      case 'name':
        aValue = a.originalName
        bValue = b.originalName
        break
      case 'date':
        aValue = a.uploadedAt
        bValue = b.uploadedAt
        break
      case 'size':
        aValue = a.size
        bValue = b.size
        break
      default:
        aValue = a.uploadedAt
        bValue = b.uploadedAt
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleImageSelect = (item: MediaItem) => {
    if (allowMultiple) {
      const isSelected = selectedImages.some(selected => selected.id === item.id)
      let newSelection: MediaItem[]

      if (isSelected) {
        newSelection = selectedImages.filter(selected => selected.id !== item.id)
      } else {
        if (selectedImages.length >= maxImages) {
          alert(`Maksimum ${maxImages} resim seçebilirsiniz!`)
          return
        }
        newSelection = [...selectedImages, item]
      }

      onImageSelect(newSelection)
    } else {
      onImageSelect([item])
    }
  }

  const isSelected = (item: MediaItem) => {
    return selectedImages.some(selected => selected.id === item.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Medya öğeleri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Resim ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="products">Ürünler</SelectItem>
              <SelectItem value="categories">Kategoriler</SelectItem>
              <SelectItem value="uploads">Yüklenenler</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uploadedAt">Tarih</SelectItem>
              <SelectItem value="name">İsim</SelectItem>
              <SelectItem value="size">Boyut</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Henüz medya öğesi yok</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          : "space-y-2"
        }>
          {sortedItems.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-md ${isSelected(item) ? 'ring-2 ring-primary' : ''
                }`}
              onClick={() => handleImageSelect(item)}
            >
              <CardContent className="p-2">
                {viewMode === 'grid' ? (
                  <div className="aspect-square relative">
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.altText || item.originalName}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                        <span className="text-muted-foreground text-sm">Resim yok</span>
                      </div>
                    )}
                    {isSelected(item) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 relative">
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.originalName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                          <span className="text-muted-foreground text-xs">Resim yok</span>
                        </div>
                      )}
                      {isSelected(item) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.originalName || 'İsimsiz'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size ? (item.size / 1024).toFixed(1) : '0'} KB
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selection Info */}
      {selectedImages.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm">
            {selectedImages.length} resim seçildi
            {maxImages && ` (Maksimum ${maxImages})`}
          </p>
        </div>
      )}
    </div>
  )
}
