"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface UploadedImage {
  url: string
  fileName: string
  originalName: string
  size: number
  type: string
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void
  initialImages?: UploadedImage[]
  maxImages?: number
  maxSize?: number // MB
  acceptedTypes?: string[]
  className?: string
}

export function ImageUpload({
  onImagesChange,
  initialImages = [],
  maxImages = 10,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImagesChange = useCallback((newImages: UploadedImage[]) => {
    setImages(newImages)
    onImagesChange(newImages)
  }, [onImagesChange])

  const uploadFile = async (file: File) => {
    if (!file) return

    // Dosya tipi kontrolü
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Desteklenmeyen dosya tipi! Sadece JPG, PNG, WebP dosyaları kabul edilir.')
      return
    }

    // Dosya boyutu kontrolü
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Dosya boyutu ${maxSize}MB'dan büyük olamaz!`)
      return
    }

    // Maksimum resim sayısı kontrolü
    if (images.length >= maxImages) {
      toast.error(`Maksimum ${maxImages} resim yükleyebilirsiniz!`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        const newImage: UploadedImage = {
          url: result.url,
          fileName: result.fileName,
          originalName: result.originalName,
          size: result.size,
          type: result.type
        }

        handleImagesChange([...images, newImage])
        toast.success('Resim başarıyla yüklendi!')
      } else {
        toast.error(result.error || 'Resim yüklenemedi!')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken bir hata oluştu!')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteImage = async (image: UploadedImage) => {
    try {
      const response = await fetch(`/api/upload/image?fileName=${image.fileName}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        const newImages = images.filter(img => img.fileName !== image.fileName)
        handleImagesChange(newImages)
        toast.success('Resim silindi!')
      } else {
        toast.error(result.error || 'Resim silinemedi!')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Resim silinirken bir hata oluştu!')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0])
    }
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
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Dosyaları buraya sürükleyin veya tıklayarak seçin
            </p>
            <p className="text-xs text-muted-foreground">
              Maksimum {maxImages} resim, {maxSize}MB boyutunda
            </p>
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {uploadProgress}% tamamlandı
              </p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
          >
            <Upload className="mr-2 h-4 w-4" />
            Dosya Seç
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </Card>

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Yüklenen Resimler ({images.length}/{maxImages})</h4>
            <Badge variant="secondary">
              {images.length} resim
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image, index) => (
              <Card key={image.fileName} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteImage(image)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Primary Image Badge */}
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      Ana Resim
                    </Badge>
                  )}
                </div>

                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate" title={image.originalName}>
                    {image.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
