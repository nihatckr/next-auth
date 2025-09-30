"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BrandForm } from "./brand-form"

interface Brand {
  id: number
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  isActive: boolean
  // ✅ API KONFIGÜRASYONU - Schema'ya uygun
  apiProductsUrl?: string | null
  apiProductDetailsUrl?: string | null
  apiConfig?: string | null
}

interface BrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand?: Brand
  onSuccess?: () => void
}

export function BrandDialog({
  open,
  onOpenChange,
  brand,
  onSuccess
}: BrandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {brand ? "Markayı Düzenle" : "Yeni Marka Ekle"}
          </DialogTitle>
          <DialogDescription>
            {brand
              ? "Marka bilgilerini güncelleyin."
              : "Yeni bir marka oluşturun."
            }
          </DialogDescription>
        </DialogHeader>

        <BrandForm
          brand={brand}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
