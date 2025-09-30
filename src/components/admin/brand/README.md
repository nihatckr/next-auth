# Brand API Konfigürasyonu

## Birden Fazla API Adresi Nasıl Eklenir?

### 1. JSON Konfigürasyon Formatı

```json
{
  "endpoints": {
    "productDetails": "/products-details?productIds={productId}&ajax=true",
    "productExtra": "/product/{productId}/extra-detail?ajax=true",
    "categories": "/categories",
    "products": "/products"
  },
  "baseUrls": {
    "main": "https://www.zara.com/tr/tr",
    "api": "https://api.zara.com"
  },
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8"
  }
}
```

### 2. Kullanım Örnekleri

#### Zara için Örnek Konfigürasyon:

```json
{
  "endpoints": {
    "productDetails": "/products-details?productIds={productId}&ajax=true",
    "productExtra": "/product/{productId}/extra-detail?ajax=true",
    "categories": "/categories",
    "products": "/products"
  },
  "baseUrls": {
    "main": "https://www.zara.com/tr/tr"
  },
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json"
  }
}
```

#### Pull & Bear için Örnek Konfigürasyon:

```json
{
  "endpoints": {
    "productDetails": "/api/products/{productId}",
    "productExtra": "/api/products/{productId}/details",
    "categories": "/api/categories",
    "products": "/api/products"
  },
  "baseUrls": {
    "main": "https://www.pullandbear.com/tr",
    "api": "https://api.pullandbear.com"
  },
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json"
  }
}
```

### 3. Parametreler

- `{productId}`: Ürün ID'si ile değiştirilir
- `{categoryId}`: Kategori ID'si ile değiştirilir
- `{brandId}`: Marka ID'si ile değiştirilir

### 4. Kodda Kullanım

```typescript
import { parseBrandApiConfig, buildApiUrl } from '@/lib/brand-api-config'

// Brand'den API konfigürasyonunu al
const apiConfig = parseBrandApiConfig(brand.apiConfig)

// Belirli bir endpoint için URL oluştur
const productDetailsUrl = buildApiUrl(apiConfig, 'productDetails', {
  productId: '452697181'
})
// Sonuç: https://www.zara.com/tr/tr/products-details?productIds=452697181&ajax=true

const productExtraUrl = buildApiUrl(apiConfig, 'productExtra', {
  productId: '461890050'
})
// Sonuç: https://www.zara.com/tr/tr/product/461890050/extra-detail?ajax=true
```

### 5. Avantajlar

- ✅ **Esnek**: Her marka için farklı API yapısı
- ✅ **Parametrik**: Dinamik URL oluşturma
- ✅ **Merkezi**: Tüm API konfigürasyonu tek yerde
- ✅ **Genişletilebilir**: Yeni endpoint'ler kolayca eklenebilir
- ✅ **Tip Güvenli**: TypeScript desteği

### 6. Desteklenen Endpoint'ler

- `productDetails`: Ürün detayları
- `productExtra`: Ek ürün bilgileri
- `categories`: Kategori listesi
- `products`: Ürün listesi
- `search`: Arama sonuçları
- `filters`: Filtre seçenekleri

### 7. Özel Header'lar

Her marka için özel header'lar tanımlanabilir:

```json
{
  "headers": {
    "User-Agent": "Custom Bot 1.0",
    "Authorization": "Bearer token123",
    "X-API-Key": "your-api-key",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8"
  }
}
```
