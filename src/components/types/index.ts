// Global Component Types
import { ReactNode } from 'react'
import { ExtendedUser } from '@/../next-auth'
import { UserRole } from '@prisma/client'

// Layout Component Types
export interface LayoutProps {
  children: ReactNode
  user: ExtendedUser
}

export interface SidebarProps {
  user: ExtendedUser
  collapsed?: boolean
}

export interface HeaderProps {
  user: ExtendedUser
  onMenuToggle?: () => void
}

export interface BreadcrumbItem {
  href: string
  label: string
  isLast?: boolean
}

// Navigation Types
export interface NavigationItem {
  label: string
  href: string
  icon?: ReactNode
  badge?: string
  submenu?: NavigationItem[]
  requiredRole?: UserRole
}

export interface NavigationProps {
  items: NavigationItem[]
  currentPath: string
  userRole: UserRole
}

// Error Boundary Types
export interface ErrorInfo {
  componentStack: string
  errorBoundary?: string
  errorInfo?: string
}

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system'

// Form Types
export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  disabled?: boolean
}

// Modal Types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Table Types
export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (item: T) => ReactNode
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  emptyMessage?: string
}
