import { UserRole } from '@prisma/client'
import { NavigationItem } from '@/components/types'
import { cn } from '@/lib/utils'

/**
 * Check if user has required role for navigation item
 */
export function hasRequiredRole(userRole: UserRole, requiredRole?: UserRole): boolean {
  if (!requiredRole) return true

  const roleHierarchy: Record<UserRole, number> = {
    USER: 0,
    ADMIN: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Filter navigation items based on user role
 */
export function filterNavigationByRole(
  items: NavigationItem[],
  userRole: UserRole
): NavigationItem[] {
  return items.filter(item => {
    // Check main item role
    if (!hasRequiredRole(userRole, item.requiredRole)) {
      return false
    }

    // Filter submenu items if they exist
    if (item.submenu) {
      item.submenu = filterNavigationByRole(item.submenu, userRole)
    }

    return true
  })
}

/**
 * Generate breadcrumb items from pathname
 */
export function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)

  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      href,
      label,
      isLast: index === segments.length - 1
    }
  })
}

/**
 * Get active navigation state
 */
export function getActiveNavigationState(
  items: NavigationItem[],
  currentPath: string
): {
  activeItem: NavigationItem | null
  activeParent: NavigationItem | null
} {
  for (const item of items) {
    // Check exact match
    if (item.href === currentPath) {
      return { activeItem: item, activeParent: null }
    }

    // Check submenu items
    if (item.submenu) {
      for (const subItem of item.submenu) {
        if (subItem.href === currentPath) {
          return { activeItem: subItem, activeParent: item }
        }
      }
    }

    // Check if current path starts with item href (for nested routes)
    if (currentPath.startsWith(item.href + '/')) {
      return { activeItem: item, activeParent: null }
    }
  }

  return { activeItem: null, activeParent: null }
}

/**
 * Component className utilities
 */
export const componentStyles = {
  // Layout styles
  sidebar: {
    base: "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800",
    collapsed: "w-16",
    mobile: "lg:translate-x-0 -translate-x-full"
  },

  header: {
    base: "sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur",
    content: "flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
  },

  // Navigation styles
  navItem: {
    base: "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
    active: "bg-gray-100 dark:bg-gray-800 text-black dark:text-white",
    inactive: "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
  },

  // Button variants
  button: {
    primary: "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200",
    secondary: "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
  }
}

/**
 * Merge component styles with custom classes
 */
export function mergeStyles(
  baseStyles: string,
  customStyles?: string,
  conditionalStyles?: Record<string, boolean>
): string {
  let styles = baseStyles

  if (customStyles) {
    styles = cn(styles, customStyles)
  }

  if (conditionalStyles) {
    Object.entries(conditionalStyles).forEach(([style, condition]) => {
      if (condition) {
        styles = cn(styles, style)
      }
    })
  }

  return styles
}
