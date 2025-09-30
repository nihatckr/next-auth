"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Upload,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Trash2,
  Edit,
  Eye,
  Download,
  Star,
  Image as ImageIcon,
  FolderOpen,
  Calendar,
  HardDrive,
  Plus,
  UploadCloud
} from 'lucide-react'
import { toast } from 'sonner'

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
  isPrimary?: boolean
  category?: string
  tags?: string[]
}

interface MediaStats {
  totalImages: number
  totalSize: number
  recentUploads: number
  categories: { [key: string]: number }
}

export function MediaLibraryDashboard() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([])
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents'>('all')
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Media items yükle
  useEffect(() => {
    loadMediaItems()
  }, [])

  const loadMediaItems = async () => {
    setLoading(true)
    try {
      // Gerçek API'den veri çek
      const response = await fetch('/api/media')
      const result = await response.json()

      if (result.success) {
        const { items, stats } = result.data

        // Tags'ı parse et
        const processedItems = items.map((item: any) => ({
          ...item,
          uploadedAt: new Date(item.uploadedAt),
          tags: item.tags ? JSON.parse(item.tags) : []
        }))

        setMediaItems(processedItems)
        setFilteredItems(processedItems)
        setStats(stats)
      } else {
        toast.error(result.error || 'Medya öğeleri yüklenemedi!')
      }
    } catch (error) {
      console.error('Media items yüklenemedi:', error)
      toast.error('Medya öğeleri yüklenemedi!')
    } finally {
      setLoading(false)
    }
  }

  // Search ve filter
  useEffect(() => {
    let filtered = mediaItems

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.altText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'images') {
        filtered = filtered.filter(item => item.type.startsWith('image/'))
      } else if (filterType === 'documents') {
        filtered = filtered.filter(item => !item.type.startsWith('image/'))
      }
    }

    // Sort
    filtered.sort((a, b) => {
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
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredItems(filtered)
  }, [mediaItems, searchTerm, sortBy, sortOrder, filterType])

  // Item seçimi
  const toggleItemSelection = (item: MediaItem) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id)

    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  // Single delete
  const handleSingleDelete = async (item: MediaItem) => {
    try {
      console.log(`🗑️ Silinecek item:`, item)
      console.log(`🗑️ Dosya adı: ${item.fileName}`)

      const response = await fetch(`/api/media?id=${item.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      console.log(`🗑️ Delete response:`, result)

      if (result.success) {
        // Local state'i güncelle
        const newItems = mediaItems.filter(mediaItem => mediaItem.id !== item.id)
        setMediaItems(newItems)
        setSelectedItems(prev => prev.filter(selected => selected.id !== item.id))

        if (result.fileDeleted) {
          toast.success('Medya öğesi ve dosya başarıyla silindi!')
        } else {
          toast.success('Medya öğesi silindi! (Dosya silinemedi)')
        }
      } else {
        toast.error(result.error || 'Silme işlemi başarısız!')
      }
    } catch (error) {
      console.error('Single delete error:', error)
      toast.error('Silme işlemi başarısız!')
    }
  }

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Silinecek öğe seçin!')
      return
    }

    try {
      console.log(`🗑️ Bulk delete: ${selectedItems.length} öğe silinecek`)

      // API'ye silme isteği gönder
      const ids = selectedItems.map(item => item.id).join(',')
      const response = await fetch(`/api/media?ids=${ids}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Local state'i güncelle
        const newItems = mediaItems.filter(item =>
          !selectedItems.some(selected => selected.id === item.id)
        )
        setMediaItems(newItems)
        setSelectedItems([])

        // Başarı mesajı
        if (result.fileErrors && result.fileErrors.length > 0) {
          toast.success(`${result.deletedCount} öğe silindi! ${result.fileErrors.length} dosya silinemedi.`)
        } else {
          toast.success(`${result.deletedCount} öğe başarıyla silindi!`)
        }
      } else {
        toast.error(result.error || 'Silme işlemi başarısız!')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Silme işlemi başarısız!')
    }
  }

  // Upload functions
  const handleSingleUpload = () => {
    setUploadMode('single')
    setShowUploadModal(true)
  }

  const handleMultipleUpload = () => {
    setUploadMode('multiple')
    setShowUploadModal(true)
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          const newMediaItem: MediaItem = {
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: result.url,
            fileName: result.fileName,
            originalName: result.originalName,
            size: result.size,
            type: result.type,
            altText: '',
            title: '',
            description: '',
            uploadedAt: new Date(),
            isPrimary: false,
            category: 'uploads',
            tags: []
          }

          // Progress update
          setUploadProgress(((index + 1) / files.length) * 100)

          return newMediaItem
        } else {
          throw new Error(result.error || 'Upload failed')
        }
      })

      const uploadedItems = await Promise.all(uploadPromises)

      // Uploaded items'ları veritabanına kaydet
      for (const item of uploadedItems) {
        try {
          const response = await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: item.url,
              fileName: item.fileName,
              originalName: item.originalName,
              size: item.size,
              type: item.type,
              altText: item.altText,
              title: item.title,
              description: item.description,
              category: item.category,
              tags: item.tags
            })
          })

          if (response.ok) {
            const result = await response.json()
            console.log('✅ Media item veritabanına kaydedildi:', result.data)
          } else {
            console.error('❌ Media item kaydedilemedi:', await response.text())
          }
        } catch (error) {
          console.error('❌ Media item kaydetme hatası:', error)
        }
      }

      // Add to media items
      setMediaItems(prev => [...prev, ...uploadedItems])

      // Media Library'yi yeniden yükle
      await loadMediaItems()

      toast.success(`${uploadedItems.length} dosya başarıyla yüklendi!`)
      setShowUploadModal(false)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Dosya yükleme hatası!')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Resim</p>
                  <p className="text-2xl font-bold">{stats.totalImages}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Boyut</p>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                </div>
                <HardDrive className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bu Hafta</p>
                  <p className="text-2xl font-bold">{stats.recentUploads}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kategoriler</p>
                  <p className="text-2xl font-bold">{Object.keys(stats.categories).length}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Medya ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('name')}
                  className={sortBy === 'name' ? 'bg-primary text-primary-foreground' : ''}
                >
                  İsim
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('date')}
                  className={sortBy === 'date' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Tarih
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('size')}
                  className={sortBy === 'size' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Boyut
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Upload Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSingleUpload}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tek Görsel Yükle
            </Button>
            <Button
              onClick={handleMultipleUpload}
              disabled={uploading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UploadCloud className="h-4 w-4" />
              Çoklu Görsel Yükle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Medya bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                Arama kriterlerinize uygun medya bulunamadı
              </p>
              <Button onClick={() => setSearchTerm('')}>
                Filtreleri Temizle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            : "space-y-2"
          }>
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some(selected => selected.id === item.id)

              return (
                <Card
                  key={item.id}
                  className={`relative group cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                  onClick={() => toggleItemSelection(item)}
                >
                  {viewMode === 'grid' ? (
                    <div className="aspect-square relative">
                      <img
                        src={item.url}
                        alt={item.altText || item.originalName}
                        className="w-full h-full object-cover rounded-t-lg"
                      />

                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2">
                        <div className={`w-4 h-4 rounded border-2 ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                          }`}>
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs">
                              ✓
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Primary Badge */}
                      {item.isPrimary && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          <Star className="h-3 w-3 mr-1" />
                          Ana
                        </Badge>
                      )}

                      {/* Category Badge */}
                      {item.category && (
                        <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
                          {item.category}
                        </Badge>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSingleDelete(item)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center p-3">
                      <div className="flex-shrink-0 w-12 h-12 mr-3">
                        <img
                          src={item.url}
                          alt={item.altText || item.originalName}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.size)} • {item.uploadedAt.toLocaleDateString()}
                        </p>
                        {item.category && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                          }`}>
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs">
                              ✓
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSingleDelete(item)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedItems.length} öğe seçildi
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedItems([])}>
                  Seçimi Temizle
                </Button>
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Seçilenleri Sil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {uploadMode === 'single' ? 'Tek Görsel Yükle' : 'Çoklu Görsel Yükle'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {uploadMode === 'single' ? 'Tek Görsel Seç' : 'Çoklu Görsel Seç'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {uploadMode === 'single'
                  ? 'Bir görsel dosyası seçin veya buraya sürükleyin'
                  : 'Birden fazla görsel dosyası seçin veya buraya sürükleyin'
                }
              </p>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress.toFixed(0)}% tamamlandı
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple={uploadMode === 'multiple'}
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files)
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploadMode === 'single' ? 'Dosya Seç' : 'Dosyalar Seç'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Desteklenen formatlar: JPG, PNG, WebP (Maksimum 5MB)
              </p>
            </div>

            {/* Upload Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Yükleme Bilgileri</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maksimum dosya boyutu: 5MB</li>
                <li>• Desteklenen formatlar: JPG, PNG, WebP</li>
                {uploadMode === 'multiple' && (
                  <li>• Birden fazla dosya seçebilirsiniz</li>
                )}
                <li>• Dosyalar otomatik olarak optimize edilir</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
