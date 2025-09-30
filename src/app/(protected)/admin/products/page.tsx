import { ProductsList } from "@/components/admin/products/products-list"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ürünler</h1>
        <p className="text-muted-foreground">
          Scraping ile çekilen ürünleri görüntüleyin ve yönetin
        </p>
      </div>
      
      <ProductsList />
    </div>
  )
}
