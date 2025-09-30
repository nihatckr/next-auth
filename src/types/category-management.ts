/**
 * Category Management Types for Admin Dashboard
 * Tree-based CRUD system for Brand → Category → Subcategory hierarchy
 */

export interface CategoryNode {
  id: number
  text: string
  slug: string
  level: number
  sortOrder: number
  isActive: boolean
  brandId: number
  parentId: number | null

  // Relations
  brand: {
    id: number
    name: string
  }
  parent?: CategoryNode
  subcategories: CategoryNode[]

  // UI specific
  expanded?: boolean
  selected?: boolean
  loading?: boolean

  // Metadata
  productCount?: number
  path?: string
  createdAt: Date
  updatedAt: Date
}

export interface CategoryTreeState {
  selectedBrandId: number | null
  categories: CategoryNode[]
  expandedNodes: Set<number>
  selectedNode: number | null
  draggedNode: number | null
  searchQuery: string
  loading: boolean
}

export interface CategoryFormData {
  text: string
  slug: string
  parentId: number | null
  brandId: number
  sortOrder: number
  isActive: boolean
  gender?: 'woman' | 'man' | null
  icon?: string
  image?: string
}

export interface CategoryCRUDActions {
  // Tree operations
  loadCategories: (brandId: number) => Promise<CategoryNode[]>
  expandNode: (nodeId: number) => void
  collapseNode: (nodeId: number) => void
  selectNode: (nodeId: number | null) => void

  // CRUD operations
  createCategory: (data: CategoryFormData) => Promise<CategoryNode>
  updateCategory: (id: number, data: Partial<CategoryFormData>) => Promise<CategoryNode>
  deleteCategory: (id: number) => Promise<void>
  reorderCategories: (parentId: number | null, orderedIds: number[]) => Promise<void>

  // Drag & Drop
  moveCategory: (categoryId: number, newParentId: number | null, newPosition: number) => Promise<void>

  // Bulk operations
  bulkToggleActive: (ids: number[], active: boolean) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>

  // Search & Filter
  searchCategories: (query: string, brandId: number) => Promise<CategoryNode[]>
  filterByLevel: (level: number) => CategoryNode[]
}

export interface AdminCategoryPageProps {
  brands: { id: number; name: string }[]
  initialSelectedBrand?: number
  permissions: {
    canCreate: boolean
    canUpdate: boolean
    canDelete: boolean
    canReorder: boolean
  }
}
