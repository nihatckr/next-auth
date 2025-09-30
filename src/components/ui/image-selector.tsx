"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MediaLibrary } from '@/components/ui/media-library'
import { ImageUpload } from '@/components/ui/image-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Image as ImageIcon,
  Upload,
  FolderOpen,
  Plus,
  X,
  Star
} from 'lucide-react'

interface SelectedImage {
  id: string
  url: string
  fileName?: string
  originalName?: string
  size?: number
  type?: string
  altText?: string
  title?: string
  description?: string
  isPrimary?: boolean
}

interface ImageSelectorProps {
  onImagesChange: (images: SelectedImage[]) => void
  initialImages?: SelectedImage[]
  maxImages?: number
  maxSize?: number
  acceptedTypes?: string[]
  className?: string
  title?: string
  allowMultiple?: boolean
  showPrimarySelection?: boolean
}

export function ImageSelector({
  onImagesChange,
  initialImages = [],
  maxImages = 10,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  title = 'Resim Seç',
  allowMultiple = true,
  showPrimarySelection = true
}: ImageSelectorProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(initialImages)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('library')

  const handleImagesChange = (images: SelectedImage[]) => {
    setSelectedImages(images)
    onImagesChange(images)
  }

  const handleMediaLibrarySelect = (images: SelectedImage[]) => {
    if (allowMultiple) {
      const newImages = [...selectedImages, ...images]
      if (newImages.length > maxImages) {
        // Maksimum sayıyı aşarsa, sadece ilk N tanesini al
        handleImagesChange(newImages.slice(0, maxImages))
      } else {
        handleImagesChange(newImages)
      }
    } else {
      handleImagesChange(images.slice(0, 1))
    }
    setShowMediaLibrary(false)
  }

  const handleUploadImages = (images: SelectedImage[]) => {
    if (allowMultiple) {
      const newImages = [...selectedImages, ...images]
      if (newImages.length > maxImages) {
        handleImagesChange(newImages.slice(0, maxImages))
      } else {
        handleImagesChange(newImages)
      }
    } else {
      handleImagesChange(images.slice(0, 1))
    }
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)

    // Eğer silinen resim ana resimse, ilk resmi ana resim yap
    if (selectedImages[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }

    handleImagesChange(newImages)
  }

  const setPrimaryImage = (index: number) => {
    const newImages = selectedImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    handleImagesChange(newImages)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <Badge variant="secondary">
          {selectedImages.length}/{maxImages} resim
        </Badge>
      </div>

      {/* Selection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Medya Kütüphanesi
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Yeni Yükle
          </TabsTrigger>
        </TabsList>

        {/* Media Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Medya Kütüphanesinden Seç</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Daha önce yüklenen resimlerden seçim yapın
            </p>
            <Button onClick={() => setShowMediaLibrary(true)}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Medya Kütüphanesini Aç
            </Button>
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <ImageUpload
            onImagesChange={handleUploadImages}
            maxImages={maxImages - selectedImages.length}
            maxSize={maxSize}
            acceptedTypes={acceptedTypes}
            className="w-full"
          />
        </TabsContent>
      </Tabs>

      {/* Selected Images */}
      {selectedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium">Seçilen Resimler</h5>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImagesChange([])}
            >
              <X className="mr-2 h-4 w-4" />
              Tümünü Temizle
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedImages.map((image, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.altText || image.originalName || `Resim ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      <Star className="mr-1 h-3 w-3" />
                      Ana
                    </Badge>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {showPrimarySelection && !image.isPrimary && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPrimaryImage(index)}
                        title="Ana resim yap"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                      title="Sil"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate" title={image.originalName || `Resim ${index + 1}`}>
                    {image.originalName || `Resim ${index + 1}`}
                  </p>
                  {image.size && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaLibrarySelect}
        selectedImages={selectedImages}
        maxSelection={maxImages - selectedImages.length}
        allowMultiple={allowMultiple}
        title="Medya Kütüphanesi"
      />
    </div>
  )
}
