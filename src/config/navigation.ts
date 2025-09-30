import { UserRole } from '@prisma/client'
import {
  Home,
  User,
  Settings,
  CreditCard,
  Shield,
  Users,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  FolderPlus
} from 'lucide-react'

// Icon mapping for string-based configuration
export const iconMap = {
  Home,
  User,
  Settings,
  CreditCard,
  Shield,
  Users,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  FolderPlus,
} as const

export type IconName = keyof typeof iconMap

// Navigation item interface
export interface NavigationItem {
  title: string
  href: string
  icon: IconName
  roles?: UserRole[]
  badge?: string
  description?: string
  children?: NavigationItem[]
  external?: boolean
}

// Main navigation configuration
export const mainNavigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: 'Home',
    description: 'Overview and analytics'
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: 'User',
    description: 'Your personal information'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'Settings',
    description: 'Application preferences'
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: 'CreditCard',
    description: 'Manage subscription and payments'
  }
]

// Admin navigation
export const adminNavigation: NavigationItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/admin',
    icon: 'Shield',
    roles: ['ADMIN'],
    badge: 'Admin',
    description: 'Administrative controls'
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: 'FolderPlus',
    roles: ['ADMIN'],
    description: 'Manage brand categories and subcategories'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: 'Users',
    roles: ['ADMIN'],
    description: 'Manage all users'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: 'BarChart3',
    roles: ['ADMIN'],
    description: 'System analytics and reports'
  }
]

// Footer navigation
export const footerNavigation: NavigationItem[] = [
  {
    title: 'Help',
    href: '/help',
    icon: 'HelpCircle',
    description: 'Get help and support'
  },
  {
    title: 'Documentation',
    href: '/docs',
    icon: 'FileText',
    description: 'API and user documentation',
    external: true
  }
]

// Mobile navigation (simplified)
export const mobileNavigation: NavigationItem[] = [
  ...mainNavigation,
  ...adminNavigation.filter(item => !item.roles || item.roles.length === 0),
  ...footerNavigation
]

// Navigation utilities
export function filterNavigationByRole(
  navigation: NavigationItem[],
  userRole: UserRole
): NavigationItem[] {
  return navigation.filter(item => {
    // If no roles specified, item is available to all users
    if (!item.roles || item.roles.length === 0) {
      return true
    }

    // Check if user has required role
    return item.roles.includes(userRole)
  })
}

export function getNavigationIcon(iconName: IconName) {
  return iconMap[iconName]
}

export function findNavigationItem(
  navigation: NavigationItem[],
  href: string
): NavigationItem | null {
  for (const item of navigation) {
    if (item.href === href) {
      return item
    }

    if (item.children) {
      const found = findNavigationItem(item.children, href)
      if (found) return found
    }
  }

  return null
}

// Breadcrumb generation
export function generateBreadcrumbs(
  pathname: string,
  navigation: NavigationItem[] = [...mainNavigation, ...adminNavigation]
): { label: string; href: string; isLast?: boolean }[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; href: string; isLast?: boolean }[] = []

  // Add home
  breadcrumbs.push({ label: 'Home', href: '/' })

  // Build breadcrumbs from segments
  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`

    // Try to find navigation item
    const navItem = findNavigationItem(navigation, currentPath)

    breadcrumbs.push({
      label: navItem?.title || segments[i].charAt(0).toUpperCase() + segments[i].slice(1),
      href: currentPath,
      isLast: i === segments.length - 1
    })
  }

  return breadcrumbs
}
