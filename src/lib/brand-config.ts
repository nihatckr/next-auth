// Marka konfigürasyonu - yeni markalar kolayca eklenebilir
export interface BrandConfig {
  colors: string
  dotColor: string
  handler: () => void
  loadingText: string
  buttonText: string
}

export interface BrandInfo {
  bgColor: string
  features: string[]
}

// Marka konfigürasyonları
export const brandConfigs: Record<string, BrandConfig> = {
  'Zara': {
    colors: 'bg-blue-50 border-blue-200 text-blue-800',
    dotColor: 'bg-blue-500',
    handler: () => {}, // handleZaraScrape fonksiyonu buraya geçilecek
    loadingText: 'Zara API\'den Çekiliyor...',
    buttonText: 'Zara API\'den Tüm Ürünleri Çek'
  },
  'Pull & Bear': {
    colors: 'bg-green-50 border-green-200 text-green-800',
    dotColor: 'bg-green-500',
    handler: () => {}, // handlePullBearScrape fonksiyonu buraya geçilecek
    loadingText: 'Pull & Bear API\'den Çekiliyor...',
    buttonText: 'Pull & Bear API\'den Tüm Ürünleri Çek'
  },
  'H&M': {
    colors: 'bg-red-50 border-red-200 text-red-800',
    dotColor: 'bg-red-500',
    handler: () => {}, // handleHMScrape fonksiyonu buraya geçilecek
    loadingText: 'H&M API\'den Çekiliyor...',
    buttonText: 'H&M API\'den Tüm Ürünleri Çek'
  },
  'Mango': {
    colors: 'bg-purple-50 border-purple-200 text-purple-800',
    dotColor: 'bg-purple-500',
    handler: () => {}, // handleMangoScrape fonksiyonu buraya geçilecek
    loadingText: 'Mango API\'den Çekiliyor...',
    buttonText: 'Mango API\'den Tüm Ürünleri Çek'
  },
  'Nike': {
    colors: 'bg-orange-50 border-orange-200 text-orange-800',
    dotColor: 'bg-orange-500',
    handler: () => {}, // handleNikeScrape fonksiyonu buraya geçilecek
    loadingText: 'Nike API\'den Çekiliyor...',
    buttonText: 'Nike API\'den Tüm Ürünleri Çek'
  },
  'Adidas': {
    colors: 'bg-black bg-opacity-10 border-black border-opacity-20 text-black',
    dotColor: 'bg-black',
    handler: () => {}, // handleAdidasScrape fonksiyonu buraya geçilecek
    loadingText: 'Adidas API\'den Çekiliyor...',
    buttonText: 'Adidas API\'den Tüm Ürünleri Çek'
  }
}

// Marka bilgi konfigürasyonları
export const brandInfos: Record<string, BrandInfo> = {
  'Zara': {
    bgColor: 'bg-blue-50',
    features: ['Gerçek ürün verileri', 'Fiyat bilgileri', 'Çoklu renk seçenekleri']
  },
  'Pull & Bear': {
    bgColor: 'bg-green-50',
    features: ['Güncel ürün kataloğu', 'Detaylı ürün bilgileri', 'Stok durumu']
  },
  'H&M': {
    bgColor: 'bg-red-50',
    features: ['Moda trendleri', 'Sürdürülebilir ürünler', 'Geniş ürün yelpazesi']
  },
  'Mango': {
    bgColor: 'bg-purple-50',
    features: ['İspanyol moda', 'Premium kalite', 'Sezonluk koleksiyonlar']
  },
  'Nike': {
    bgColor: 'bg-orange-50',
    features: ['Spor giyim', 'Teknoloji', 'Performans odaklı']
  },
  'Adidas': {
    bgColor: 'bg-gray-50',
    features: ['Spor giyim', 'Klasik tasarım', 'Yüksek kalite']
  }
}

// Yeni marka eklemek için yardımcı fonksiyon
export function addBrandConfig(
  brandName: string,
  config: BrandConfig,
  info: BrandInfo
) {
  brandConfigs[brandName] = config
  brandInfos[brandName] = info
}

// Marka konfigürasyonunu al
export function getBrandConfig(brandName: string): BrandConfig | null {
  return brandConfigs[brandName] || null
}

// Marka bilgisini al
export function getBrandInfo(brandName: string): BrandInfo {
  return brandInfos[brandName] || {
    bgColor: 'bg-gray-50',
    features: ['API entegrasyonu', 'Ürün verileri', 'Marka özellikleri']
  }
}

// Desteklenen markaları listele
export function getSupportedBrands(): string[] {
  return Object.keys(brandConfigs)
}

// Marka destekleniyor mu kontrol et
export function isBrandSupported(brandName: string): boolean {
  return brandName in brandConfigs
}
