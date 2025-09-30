"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { getBrands } from "@/actions/categories/brand"
import { Button } from "@/components/ui/button"
import { BrandCard } from "./brand-card"
import { BrandDialog } from "./brand-dialog"

interface Brand {
  id: number
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  url?: string | null
  isActive: boolean
  categories: { id: number; text: string }[]
}

export function BrandList() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const loadBrands = async () => {
    setLoading(true)
    setError("")

    const result = await getBrands()

    if (result.error) {
      setError(result.error)
    } else {
      setBrands(result.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadBrands()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={loadBrands}>Tekrar Dene</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Markalar</h2>
          <p className="text-muted-foreground">
            Toplam {brands.length} marka
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Marka
        </Button>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <div className="space-y-3">
            <div className="text-muted-foreground text-lg">
              Henüz marka eklenmemiş
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Markayı Ekle
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onUpdate={loadBrands}
            />
          ))}
        </div>
      )}

      <BrandDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          loadBrands()
        }}
      />
    </div>
  )
}
