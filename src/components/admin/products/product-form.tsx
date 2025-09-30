"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CreateProductSchema } from "@/schemas"
import { createProduct, updateProduct } from "@/actions/products/product"
import { getBrands } from "@/actions/categories/brand"
import { getCategories, getLeafCategories } from "@/actions/categories/category"
import { useFormHandler } from "@/hooks/use-form-handler"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import { VariantImageUpload } from "@/components/ui/variant-image-upload"
import { MediaLibrarySelector } from "@/components/ui/media-library-selector"
import { Plus, X, Trash2 } from "lucide-react"

interface Brand {
  id: number
  name: string
}

interface Category {
  id: number
  text: string
  brand: { id: number; name: string }
}

interface ProductFormProps {
  product?: any
  onSuccess?: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null)
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<number[]>([]) // Seçilen kategori yolu
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]) // Mevcut seviyedeki kategoriler
  const [uploadedImages, setUploadedImages] = useState<any[]>([]) // Yüklenen resimler
  const [bulkImages, setBulkImages] = useState<any[]>([]) // Toplu resim yükleme için

  const { error, success, isPending, handleSubmit } = useFormHandler(
    product ? updateProduct.bind(null, product.id) : createProduct,
    {
      onSuccess: () => {
        onSuccess?.()
        // Başarılı olduğunda ürünler listesine yönlendir
        if (!product) {
          window.location.href = '/admin/products'
        }
      }
    }
  )

  const form = useForm<z.infer<typeof CreateProductSchema>>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      basePrice: product?.basePrice || "",
      discountPrice: product?.discountPrice || 0,
      currencyCode: product?.currencyCode || "TL",
      productCode: product?.productCode || "",
      brandId: product?.brandId || 0,
      categoryId: product?.categoryId || 0,
      primaryImage: product?.primaryImage || "",
      composition: product?.composition || "",
      careInstructions: product?.careInstructions || "",
      metaTitle: product?.metaTitle || "",
      metaDescription: product?.metaDescription || "",
      colors: product?.variants?.map((variant: any) => ({
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        backgroundColor: variant.backgroundColor,
        price: variant.price,
        discountPrice: variant.discountPrice,
        availability: variant.availability,
        sku: variant.sku,
        originalIndex: variant.originalIndex,
        scrapedImages: variant.scrapedImages || 0,
        images: variant.images?.map((image: any) => ({
          url: image.url,
          altText: image.altText,
          order: image.order
        })) || [],
        sizes: variant.sizes?.map((size: any) => ({
          size: size.size,
          availability: size.availability,
          isSelected: size.isSelected || false,
          originalOrder: size.originalOrder
        })) || []
      })) || []
    }
  })

  // Markaları ve kategorileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsResult, categoriesResult] = await Promise.all([
          getBrands(),
          getCategories()
        ])

        if (brandsResult.success) {
          setBrands(brandsResult.data)
        }

        if (categoriesResult.success) {
          setCategories(categoriesResult.data)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [])

  // Marka değiştiğinde level 0 kategorileri yükle
  const handleBrandChange = (brandId: number) => {
    setSelectedBrandId(brandId)
    form.setValue("brandId", brandId)
    form.setValue("categoryId", 0) // Kategoriyi sıfırla

    // Kategori yolunu sıfırla
    setSelectedCategoryPath([])

    // Level 0 kategorileri filtrele - Safe access
    const level0Categories = categories?.filter(cat =>
      cat.brand.id === brandId && cat.level === 0
    ) || []

    setAvailableCategories(level0Categories)
  }

  // Kategori seçildiğinde bir sonraki seviyeyi yükle
  const handleCategorySelect = (categoryId: number) => {
    const newPath = [...selectedCategoryPath, categoryId]
    setSelectedCategoryPath(newPath)

    // Bir sonraki seviyedeki kategorileri bul - Safe access
    const nextLevel = newPath.length
    const nextCategories = categories?.filter(cat =>
      cat.brand.id === selectedBrandId &&
      cat.level === nextLevel &&
      cat.parentId === categoryId
    ) || []

    setAvailableCategories(nextCategories)
    console.log("🔄 Category selected, next level categories:", nextCategories)

    // Eğer alt kategori yoksa, bu leaf kategoridir
    if (nextCategories.length === 0) {
      form.setValue("categoryId", categoryId)
      console.log("✅ Leaf category selected:", categoryId)
    }
  }

  const onSubmit = (values: z.infer<typeof CreateProductSchema>) => {
    // Yüklenen resimleri form verilerine ekle
    const formData = {
      ...values,
      uploadedImages: uploadedImages
    }
    handleSubmit(formData)
  }

  // Renk ekleme
  const addColor = () => {
    const currentColors = form.getValues("colors") || []
    form.setValue("colors", [
      ...currentColors,
      {
        colorName: "",
        colorCode: "",
        backgroundColor: "#000000",
        price: "",
        discountPrice: 0,
        availability: "IN_STOCK" as const,
        sku: "",
        originalIndex: 0,
        scrapedImages: 0,
        images: [],
        sizes: []
      }
    ])
  }

  // Renk silme
  const removeColor = (index: number) => {
    const currentColors = form.getValues("colors") || []
    form.setValue("colors", currentColors.filter((_, i) => i !== index))
  }

  // Resim ekleme
  const addImage = (colorIndex: number) => {
    const currentColors = form.getValues("colors") || []
    const updatedColors = [...currentColors]
    updatedColors[colorIndex].images = [
      ...(updatedColors[colorIndex].images || []),
      { url: "", altText: "", order: 0 }
    ]
    form.setValue("colors", updatedColors)
  }

  // Resim silme
  const removeImage = (colorIndex: number, imageIndex: number) => {
    const currentColors = form.getValues("colors") || []
    const updatedColors = [...currentColors]
    updatedColors[colorIndex].images = updatedColors[colorIndex].images?.filter((_, i) => i !== imageIndex) || []
    form.setValue("colors", updatedColors)
  }

  // Beden ekleme
  const addSize = (colorIndex: number) => {
    const currentColors = form.getValues("colors") || []
    const updatedColors = [...currentColors]
    updatedColors[colorIndex].sizes = [
      ...(updatedColors[colorIndex].sizes || []),
      { size: "", availability: "IN_STOCK" as const, isSelected: false, originalOrder: 0 }
    ]
    form.setValue("colors", updatedColors)
  }

  // Beden silme
  const removeSize = (colorIndex: number, sizeIndex: number) => {
    const currentColors = form.getValues("colors") || []
    const updatedColors = [...currentColors]
    updatedColors[colorIndex].sizes = updatedColors[colorIndex].sizes?.filter((_, i) => i !== sizeIndex) || []
    form.setValue("colors", updatedColors)
  }

  // Toplu resim yükleme fonksiyonu
  const distributeBulkImages = () => {
    if (bulkImages.length === 0) return

    const currentColors = form.getValues("colors") || []
    if (currentColors.length === 0) return

    // Her renk varyantına eşit olarak dağıt
    const imagesPerColor = Math.ceil(bulkImages.length / currentColors.length)

    currentColors.forEach((color: any, colorIndex: number) => {
      const startIndex = colorIndex * imagesPerColor
      const endIndex = Math.min(startIndex + imagesPerColor, bulkImages.length)
      const colorImages = bulkImages.slice(startIndex, endIndex)

      // Mevcut resimlerle birleştir
      const existingImages = color.images || []
      const newImages = colorImages.map((img: any, index: number) => ({
        url: img.url,
        altText: img.originalName || '',
        order: existingImages.length + index
      }))

      color.images = [...existingImages, ...newImages]
    })

    form.setValue("colors", currentColors)
    setBulkImages([]) // Toplu resimleri temizle
  }

  // Mevcut seviyedeki kategorileri kullan
  const filteredCategories = availableCategories || []

  console.log("📊 Selected brand ID:", selectedBrandId)
  console.log("📊 Category path:", selectedCategoryPath)
  console.log("📊 Available categories:", availableCategories)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {product ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ürün Adı *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ürün adını giriniz" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ürün Kodu *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ürün kodunu giriniz" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ürün Açıklaması</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Ürün açıklamasını giriniz" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fiyat Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiyat *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="₺0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="discountPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İndirimli Fiyat</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para Birimi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Para birimi seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TL">TL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            {/* Marka ve Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marka *</FormLabel>
                    <Select onValueChange={(value) => handleBrandChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !brands || brands.length === 0
                                ? "Markalar yükleniyor..."
                                : "Marka seçiniz"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                    {(!brands || brands.length === 0) && (
                      <p className="text-sm text-muted-foreground">
                        Markalar yükleniyor...
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Kategori *</FormLabel>
                <div className="space-y-2">
                  {/* Kategori yolu göster */}
                  {selectedCategoryPath.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Seçilen yol:</span>
                      {selectedCategoryPath.map((catId, index) => {
                        const cat = categories.find(c => c.id === catId)
                        return (
                          <span key={catId} className="flex items-center gap-1">
                            {cat?.text}
                            {index < selectedCategoryPath.length - 1 && <span>→</span>}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Mevcut seviyedeki kategoriler */}
                  {filteredCategories.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {filteredCategories.map((category) => (
                        <Button
                          key={category.id}
                          type="button"
                          variant="outline"
                          onClick={() => handleCategorySelect(category.id)}
                          className="justify-start"
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Durum mesajları */}
                  {!selectedBrandId && (
                    <p className="text-sm text-muted-foreground">
                      Kategori seçmek için önce marka seçmelisiniz
                    </p>
                  )}
                  {selectedBrandId && filteredCategories.length === 0 && selectedCategoryPath.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Bu marka için kategori bulunamadı
                    </p>
                  )}
                  {selectedBrandId && filteredCategories.length === 0 && selectedCategoryPath.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ✅ Leaf kategori seçildi! Form gönderilebilir.
                    </p>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            </div>

            {/* Ana Ürün Resmi */}
            <Card>
              <CardHeader>
                <CardTitle>Ana Ürün Resmi</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaLibrarySelector
                  onImagesChange={(images) => {
                    if (images.length > 0) {
                      form.setValue('primaryImage', images[0].url)
                    } else {
                      form.setValue('primaryImage', '')
                    }
                  }}
                  initialImages={product?.primaryImage ? [{
                    id: 'primary-img',
                    url: product.primaryImage,
                    fileName: product.primaryImage.split('/').pop() || '',
                    originalName: 'Ana Resim',
                    size: 0,
                    type: 'image/jpeg',
                    altText: 'Ana Resim',
                    uploadedAt: new Date(),
                    isPrimary: true,
                    category: 'products'
                  }] : []}
                  maxImages={1}
                  maxSize={5}
                  title="Ana Ürün Resmi Seç"
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Renk Varyantları */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Renk Varyantları</h3>
                <div className="flex gap-2">
                  <Button type="button" onClick={addColor} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Renk Ekle
                  </Button>
                </div>
              </div>

              {/* Toplu Resim Yükleme */}
              {form.watch("colors") && form.watch("colors").length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Toplu Resim Yükleme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <MediaLibrarySelector
                        onImagesChange={setBulkImages}
                        initialImages={bulkImages}
                        maxImages={50}
                        maxSize={5}
                        title="Tüm Renk Varyantları İçin Resimler Seç"
                        className="w-full"
                      />
                      {bulkImages.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={distributeBulkImages}
                            className="w-full"
                          >
                            {bulkImages.length} Resmi Renk Varyantlarına Dağıt
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {form.watch("colors")?.map((color, colorIndex) => (
                <Card key={colorIndex} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Renk {colorIndex + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeColor(colorIndex)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`colors.${colorIndex}.colorName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Renk Adı</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Kırmızı" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`colors.${colorIndex}.colorCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Renk Kodu</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="RED" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  {/* Bedenler */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">Bedenler</h5>
                      <Button
                        type="button"
                        onClick={() => addSize(colorIndex)}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Beden Ekle
                      </Button>
                    </div>

                    {color.sizes?.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="flex gap-2 mb-2">
                        <FormField
                          control={form.control}
                          name={`colors.${colorIndex}.sizes.${sizeIndex}.size`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input {...field} placeholder="S, M, L, XL" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          onClick={() => removeSize(colorIndex, sizeIndex)}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Renk Varyantı Resimleri */}
                  <div className="mt-4">
                    <MediaLibrarySelector
                      onImagesChange={(images) => {
                        // Form'da images array'ini güncelle
                        const currentColors = form.getValues("colors") || []
                        currentColors[colorIndex].images = images.map(img => ({
                          url: img.url,
                          altText: img.originalName || '',
                          order: images.indexOf(img)
                        }))
                        form.setValue("colors", currentColors)
                      }}
                      initialImages={color.images?.map((img: any) => ({
                        id: `img-${img.url}`,
                        url: img.url,
                        fileName: img.url.split('/').pop() || '',
                        originalName: img.altText || '',
                        size: 0,
                        type: 'image/jpeg',
                        altText: img.altText,
                        uploadedAt: new Date(),
                        isPrimary: false,
                        category: 'products'
                      })) || []}
                      maxImages={5}
                      maxSize={5}
                      title={`${color.colorName || `Renk ${colorIndex + 1}`} Resimleri`}
                      className="w-full"
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Media Library Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Ürün Resimleri</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaLibrarySelector
                  onImagesChange={setUploadedImages}
                  initialImages={uploadedImages}
                  maxImages={10}
                  maxSize={5}
                  title="Ürün Resimleri Seç"
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Hata ve Başarı Mesajları */}
            {error && (
              <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-700">
                <p>{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Kaydediliyor..." : product ? "Ürünü Güncelle" : "Ürünü Kaydet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
