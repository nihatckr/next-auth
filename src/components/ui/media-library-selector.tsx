"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageSelector } from '@/components/ui/image-selector'
import { MediaLibrary } from '@/components/ui/media-library'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Image as ImageIcon, X } from 'lucide-react'

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

interface MediaLibrarySelectorProps {
  onImagesChange: (images: MediaItem[]) => void
  initialImages?: MediaItem[]
  maxImages?: number
  maxSize?: number
  acceptedTypes?: string[]
  className?: string
  title?: string
}

export function MediaLibrarySelector({
  onImagesChange,
  initialImages = [],
  maxImages = 10,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  title = 'Resim Seç'
}: MediaLibrarySelectorProps) {
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>(initialImages)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [showImageSelector, setShowImageSelector] = useState(false)

  // Initial images'ı set et
  useEffect(() => {
    setSelectedImages(initialImages)
  }, [initialImages])

  const handleImageSelect = (images: MediaItem[]) => {
    // Max images kontrolü
    if (images.length > maxImages) {
      alert(`Maksimum ${maxImages} resim seçebilirsiniz!`)
      return
    }

    setSelectedImages(images)
    onImagesChange(images)
  }

  const handleRemoveImage = (imageId: string) => {
    const newImages = selectedImages.filter(img => img.id !== imageId)
    setSelectedImages(newImages)
    onImagesChange(newImages)
  }

  const handleSetPrimary = (imageId: string) => {
    const newImages = selectedImages.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }))
    setSelectedImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMediaLibrary(true)}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Medya Kütüphanesi
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowImageSelector(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Yeni Yükle
          </Button>
        </div>
      </div>

      {/* Seçilen Resimler */}
      {selectedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Seçilen Resimler ({selectedImages.length}/{maxImages})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedImages.map((image, index) => (
                <div key={`${image.id}-${index}`} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-muted">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.altText || image.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Resim yok</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                      Ana Resim
                    </Badge>
                  )}

                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(image.id)}
                      disabled={image.isPrimary}
                    >
                      {image.isPrimary ? 'Ana' : 'Ana Yap'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Info */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p className="truncate">{image.originalName || 'İsimsiz'}</p>
                    <p>{image.size ? (image.size / 1024).toFixed(1) : '0'} KB</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Library Dialog */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Medya Kütüphanesi</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <MediaLibrary
              onImageSelect={(images) => {
                handleImageSelect(images)
                setShowMediaLibrary(false)
              }}
              selectedImages={selectedImages}
              maxImages={maxImages}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Selector Dialog */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Yeni Resim Yükle</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <ImageSelector
              onImagesChange={(images) => {
                handleImageSelect(images)
                setShowImageSelector(false)
              }}
              initialImages={selectedImages}
              maxImages={maxImages}
              maxSize={maxSize}
              acceptedTypes={acceptedTypes}
              title="Resim Yükle"
              allowMultiple={true}
              showPrimarySelection={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
