import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getUserById } from '@/data/user'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/admin/app-sidebar'
import { SiteHeader } from '@/components/admin/site-header'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  // Kullanıcının hala veritabanında olup olmadığını kontrol et
  if (session.user.id) {
    const dbUser = await getUserById(session.user.id)
    if (!dbUser) {
      // Kullanıcı veritabanından silinmişse, logout yap ve login'e yönlendir
      redirect('/auth/login?error=UserNotFound')
    }
  }

  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
