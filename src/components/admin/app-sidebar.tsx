"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/admin/nav-main"
import { NavSecondary } from "@/components/admin/nav-secondary"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  IconCategory,
  IconTags,
  IconHome,
  IconUserEdit,
  IconPackage,
  IconPlus,
  IconPhoto,
} from "@tabler/icons-react"
import { Logo } from "../navigation/logo"

const data = {
  navMain: [
    {
      title: "Marka Yönetimi",
      url: "/admin/brands",
      icon: IconTags,
    },
    {
      title: "Kategori Yönetimi",
      url: "/admin/categories",
      icon: IconCategory,
    },
    {
      title: "Ürünler",
      url: "/admin/products",
      icon: IconPackage,
    },
    {
      title: "Ürün Ekle",
      url: "/admin/products/add",
      icon: IconPlus,
    },
    {
      title: "Medya Kütüphanesi",
      url: "/admin/media",
      icon: IconPhoto,
    },
  ],
  navSecondary: [
    {
      title: "Anasayfa",
      url: "/",
      icon: IconHome,
    },
    {
      title: "Profile Settings",
      url: "/profile",
      icon: IconUserEdit,
    }

  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin">
                <Logo />
                <span className="text-base font-semibold">Mapper</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
