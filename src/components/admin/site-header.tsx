
"use client"
import * as React from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { NotificationMenu } from "@/components/navigation/notification"
import { UserButton } from "@/components/navigation/user-button"
import { useSession } from "next-auth/react"

export function SiteHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname?.split('/').filter(Boolean) || []
    const breadcrumbs = []

    // Add Home/Admin as first item
    breadcrumbs.push({
      href: '/admin',
      label: 'Admin',
      isCurrentPage: pathname === '/admin'
    })

    // Process remaining path segments
    let currentPath = ''
    for (let i = 0; i < paths.length; i++) {
      const segment = paths[i]
      currentPath += `/${segment}`

      // Skip 'admin' since it's already added as first item
      if (segment === 'admin') continue

      // Format segment name
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbs.push({
        href: currentPath,
        label,
        isCurrentPage: i === paths.length - 1
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isCurrentPage ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          {session?.user && (
            <>
              <NotificationMenu />
              <UserButton
                userName={session.user.name || "User"}
                userEmail={session.user.email || ""}
                userAvatar={session.user.image || ""}
                onItemClick={(item) => {
                  if (item === "profile") {
                    window.location.href = "/profile";
                  } else if (item === "settings") {
                    window.location.href = "/profile";
                  }
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
