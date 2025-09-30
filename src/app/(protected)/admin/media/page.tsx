import { Suspense } from 'react'
import { MediaLibraryDashboard } from '@/components/admin/media/media-library-dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MediaLibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medya Kütüphanesi</h1>
        <p className="text-muted-foreground">
          Tüm yüklenen görselleri organize edin ve yönetin
        </p>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="aspect-square w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }>
        <MediaLibraryDashboard />
      </Suspense>
    </div>
  )
}
