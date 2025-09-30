"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CategoryForm } from "./category-form-enhanced"

interface Category {
  id: number
  name: string // Schema'ya uygun: name alanı
  slug: string
  level: number
  sortOrder: number
  isActive: boolean
  isLeaf: boolean // Schema'ya uygun: isLeaf alanı
  gender?: string | null
  apiId?: string | null // Schema'ya uygun: apiId alanı
  brand: { id: number; name: string }
  parent?: { id: number; name: string } | null // Schema'ya uygun: name alanı
  subCategories?: { id: number; name: string }[] // Schema'ya uygun: subCategories alanı
}

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  parentId?: number | null
  brandName?: string
  parentName?: string
  onSuccess?: () => void
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  parentId,
  brandName,
  parentName,
  onSuccess
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] transition-all duration-200 ease-in-out">
        <DialogHeader className="pb-4">
          <DialogTitle>
            {category ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
          </DialogTitle>
          {(brandName || parentName) && (
            <DialogDescription className="text-sm text-muted-foreground">
              Kategori bilgilerini doldurun
            </DialogDescription>
          )}
          {(brandName || parentName) && (
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <div className="flex flex-col gap-1">
                {brandName && (
                  <div className="text-xs">
                    <span className="font-medium">Marka:</span> {brandName}
                  </div>
                )}
                {parentName && (
                  <div className="text-xs">
                    <span className="font-medium">Ana Kategori:</span> {parentName}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogHeader>

        <CategoryForm
          category={category}
          parentId={parentId}
          brandName={brandName}
          parentName={parentName}
          onSuccess={() => {
            onSuccess?.()
            onOpenChange(false) // Modal'ı kapat
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
