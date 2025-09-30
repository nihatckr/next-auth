/**
 * Pull & Bear Brand API Konfigürasyonu
 * Birden fazla API endpoint'ini yönetmek için
 */

import { ApiConfig, parseBrandApiConfig, buildApiUrl } from './brand-api-config'

/**
 * Pull & Bear için varsayılan API konfigürasyonu
 */
export const PULLBEAR_DEFAULT_CONFIG: ApiConfig = {
  endpoints: {
    // Ana API endpoint'leri
    categories: "/api/categories",
    products: "/api/products",
    productDetails: "/api/products/{productId}",
    productExtra: "/api/products/{productId}/details",

    // Pull & Bear özel endpoint'leri
    categoryProducts: "/api/categories/{categoryId}/products",
    search: "/api/search",
    filters: "/api/filters",

    // Scraping endpoint'leri
    scrapeCategory: "/api/categories/{categoryId}/scrape",
    scrapeProduct: "/api/products/{productId}/scrape"
  },
  baseUrls: {
    main: "https://www.pullandbear.com/tr",
    api: "https://api.pullandbear.com",
    scraping: "https://scraping.pullandbear.com"
  },
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.pullandbear.com/tr/",
    "Origin": "https://www.pullandbear.com",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin"
  }
}

/**
 * Pull & Bear API URL'lerini oluşturur
 */
export function buildPullBearApiUrls(
  apiConfig: ApiConfig | null,
  params: {
    categoryId?: string
    productId?: string
    searchQuery?: string
  } = {}
): {
  categories: string | null
  products: string | null
  productDetails: string | null
  productExtra: string | null
  categoryProducts: string | null
  search: string | null
  filters: string | null
} {
  return {
    categories: buildApiUrl(apiConfig, 'categories'),
    products: buildApiUrl(apiConfig, 'products'),
    productDetails: buildApiUrl(apiConfig, 'productDetails', { productId: params.productId || '' }),
    productExtra: buildApiUrl(apiConfig, 'productExtra', { productId: params.productId || '' }),
    categoryProducts: buildApiUrl(apiConfig, 'categoryProducts', { categoryId: params.categoryId || '' }),
    search: buildApiUrl(apiConfig, 'search', { query: params.searchQuery || '' }),
    filters: buildApiUrl(apiConfig, 'filters')
  }
}

/**
 * Pull & Bear kategori scraping için URL oluşturur
 */
export function buildPullBearCategoryScrapingUrl(
  apiConfig: ApiConfig | null,
  categoryId: string
): string | null {
  return buildApiUrl(apiConfig, 'categoryProducts', { categoryId })
}

/**
 * Pull & Bear ürün scraping için URL oluşturur
 */
export function buildPullBearProductScrapingUrl(
  apiConfig: ApiConfig | null,
  productId: string
): string | null {
  return buildApiUrl(apiConfig, 'productDetails', { productId })
}

/**
 * Pull & Bear API isteği yapar
 */
export async function makePullBearApiRequest(
  apiConfig: ApiConfig | null,
  endpointKey: string,
  params: Record<string, string | number> = {}
): Promise<Response | null> {
  const url = buildApiUrl(apiConfig, endpointKey, params)
  if (!url) return null

  const headers = apiConfig?.headers || {}

  try {
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
  } catch (error) {
    console.error('Pull & Bear API isteği başarısız:', error)
    return null
  }
}

/**
 * Pull & Bear kategori API ID'sini doğrular
 */
export function validatePullBearCategoryApiId(apiId: string): boolean {
  // Pull & Bear API ID'leri genellikle sayısal string'ler
  return /^\d+$/.test(apiId) && apiId.length >= 6
}

/**
 * Pull & Bear ürün API ID'sini doğrular
 */
export function validatePullBearProductApiId(apiId: string): boolean {
  // Pull & Bear ürün ID'leri genellikle sayısal string'ler
  return /^\d+$/.test(apiId) && apiId.length >= 8
}

/**
 * Pull & Bear API konfigürasyonu için örnek JSON
 */
export const PULLBEAR_CONFIG_EXAMPLE = {
  endpoints: {
    categories: "/api/categories",
    products: "/api/products",
    productDetails: "/api/products/{productId}",
    productExtra: "/api/products/{productId}/details",
    categoryProducts: "/api/categories/{categoryId}/products",
    search: "/api/search",
    filters: "/api/filters"
  },
  baseUrls: {
    main: "https://www.pullandbear.com/tr",
    api: "https://api.pullandbear.com"
  },
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8"
  }
}
