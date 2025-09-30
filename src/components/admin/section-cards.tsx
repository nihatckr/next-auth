import { IconTrendingUp, IconCategory, IconTags, IconUsers, IconChartBar } from "@tabler/icons-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      {/* Kategori Yönetimi Kartı */}
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <Link href="/admin/categories">
          <div className="px-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1.5">
              <IconCategory className="size-4" />
              Kategori Yönetimi
            </div>
            <div className="text-2xl font-semibold tabular-nums mb-1.5">
              0
            </div>
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline">
                <IconTrendingUp />
                İlk kategoriyi ekleyin
              </Badge>
            </div>
            <div className="flex items-center px-6">
              <div className="flex flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Toplam kategori sayısı <IconCategory className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Hiyerarşik yapıda yönetim
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Marka Yönetimi Kartı */}
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <Link href="/admin/brands">
          <div className="px-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1.5">
              <IconTags className="size-4" />
              Marka Yönetimi
            </div>
            <div className="text-2xl font-semibold tabular-nums mb-1.5">
              0
            </div>
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline">
                <IconTrendingUp />
                İlk markayı ekleyin
              </Badge>
            </div>
            <div className="flex items-center px-6">
              <div className="flex flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Aktif marka sayısı <IconTags className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Marka ekleme ve düzenleme
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Kullanıcı Yönetimi Kartı */}
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <Link href="/admin/users">
          <div className="px-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1.5">
              <IconUsers className="size-4" />
              Kullanıcı Yönetimi
            </div>
            <div className="text-2xl font-semibold tabular-nums mb-1.5">
              0
            </div>
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline">
                <IconTrendingUp />
                Henüz kullanıcı yok
              </Badge>
            </div>
            <div className="flex items-center px-6">
              <div className="flex flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Aktif kullanıcı sayısı <IconUsers className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Kullanıcı rolleri ve yetkileri
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Analytics Kartı */}
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <Link href="/admin/analytics">
          <div className="px-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1.5">
              <IconChartBar className="size-4" />
              Sistem Analitikleri
            </div>
            <div className="text-2xl font-semibold tabular-nums mb-1.5">
              --
            </div>
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline">
                <IconTrendingUp />
                Veri yok
              </Badge>
            </div>
            <div className="flex items-center px-6">
              <div className="flex flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Sistem performansı <IconChartBar className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Raporlar ve istatistikler
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
