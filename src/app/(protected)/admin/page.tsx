import { ChartAreaInteractive } from "@/components/admin/chart-area-interactivite"
import { SectionCards } from "@/components/admin/section-cards"
import { ScrapingDashboard } from "@/components/admin/scraping-dashboard"
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth()

  // Debug: Session bilgilerini kontrol et
  console.log('Session in admin page:', session)
  console.log('User role:', session?.user?.role)

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/auth/login?error=AccessDenied')
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6 space-y-6">
            <ScrapingDashboard />
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  )
}
