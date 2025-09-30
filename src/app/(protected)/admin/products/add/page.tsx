import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProductForm } from '@/components/admin/products/product-form'

export default async function AddProductPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">Yeni Ürün Ekle</h1>
              <p className="text-muted-foreground">
                Sisteme yeni ürün ekleyin ve yönetin
              </p>
            </div>

            <ProductForm />
          </div>
        </div>
      </div>
    </div>
  )
}
