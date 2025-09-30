"use client"

import { useState } from 'react'
import { ImageSelector } from '@/components/ui/image-selector'

interface UploadedImage {
  url: string
  fileName?: string
  originalName?: string
  size?: number
  type?: string
  isPrimary?: boolean
}

interface VariantImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void
  initialImages?: UploadedImage[]
  maxImages?: number
  maxSize?: number // MB
  acceptedTypes?: string[]
  className?: string
  colorName?: string
}

export function VariantImageUpload({
  onImagesChange,
  initialImages = [],
  maxImages = 10,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  colorName = 'Bu Renk'
}: VariantImageUploadProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ImageSelector
        onImagesChange={onImagesChange}
        initialImages={initialImages}
        maxImages={maxImages}
        maxSize={maxSize}
        acceptedTypes={acceptedTypes}
        title={`${colorName} Resimleri`}
        allowMultiple={true}
        showPrimarySelection={true}
        className="w-full"
      />
    </div>
  )
}
