/**
 * Brand API Konfigürasyonu Utility Fonksiyonları
 * Birden fazla API endpoint'ini yönetmek için
 */

export interface ApiConfig {
  endpoints: {
    productDetails?: string
    productExtra?: string
    categories?: string
    products?: string
    [key: string]: string | undefined
  }
  baseUrls: {
    main?: string
    api?: string
    [key: string]: string | undefined
  }
  headers?: {
    [key: string]: string
  }
}

/**
 * Brand'in API konfigürasyonunu parse eder
 */
export function parseBrandApiConfig(apiConfigString?: string | null): ApiConfig | null {
  if (!apiConfigString || apiConfigString.trim() === '') {
    return null
  }

  try {
    return JSON.parse(apiConfigString) as ApiConfig
  } catch (error) {
    console.error('API konfigürasyonu parse edilemedi:', error)
    return null
  }
}

/**
 * Belirli bir endpoint için tam URL oluşturur
 */
export function buildApiUrl(
  apiConfig: ApiConfig | null,
  endpointKey: string,
  params: Record<string, string | number> = {}
): string | null {
  if (!apiConfig) return null

  const endpoint = apiConfig.endpoints[endpointKey]
  if (!endpoint) return null

  // Base URL'i belirle
  const baseUrl = apiConfig.baseUrls.main || apiConfig.baseUrls.api || ''

  // Parametreleri endpoint'e ekle
  let finalEndpoint = endpoint
  Object.entries(params).forEach(([key, value]) => {
    finalEndpoint = finalEndpoint.replace(`{${key}}`, String(value))
  })

  return `${baseUrl}${finalEndpoint}`
}

/**
 * Zara için özel API URL'leri oluşturur
 */
export function buildZaraApiUrls(
  apiConfig: ApiConfig | null,
  productId: string
): {
  productDetails: string | null
  productExtra: string | null
} {
  return {
    productDetails: buildApiUrl(apiConfig, 'productDetails', { productId }),
    productExtra: buildApiUrl(apiConfig, 'productExtra', { productId })
  }
}

/**
 * API konfigürasyonu için varsayılan template
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  endpoints: {
    productDetails: '/products-details?productIds={productId}&ajax=true',
    productExtra: '/product/{productId}/extra-detail?ajax=true',
    categories: '/categories',
    products: '/products'
  },
  baseUrls: {
    main: 'https://www.zara.com/tr/tr',
    api: 'https://api.zara.com'
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8'
  }
}

/**
 * Brand API konfigürasyonunu kullanarak istek yapar
 */
export async function makeBrandApiRequest(
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
    console.error('API isteği başarısız:', error)
    return null
  }
}
