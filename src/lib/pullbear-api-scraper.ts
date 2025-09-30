import { NextRequest } from 'next/server';

interface PullBearProduct {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  currency: string;
  images: string[];
  primaryImage: string;
  url: string;
  description?: string;
  rawDescription?: string;
  productCode?: string;
  composition?: string;
  careInstructions?: string;
  metaTitle?: string;
  metaDescription?: string;
  sizes: string[];
  colors: Array<{
    name: string;
    code: string;
    backgroundColor?: string;
    sku?: string;
    images: string[];
  }>;
}

interface PullBearApiResponse {
  products: Array<{
    id: string;
    name: string;
    price: string;
    currency: string;
    images: string[];
    url: string;
    description?: string;
    rawDescription?: string;
    productCode?: string;
    composition?: string;
    careInstructions?: string;
    sizes: string[];
    colors: Array<{
      name: string;
      code: string;
      images: string[];
    }>;
  }>;
  total: number;
  hasMore: boolean;
}

interface PullBearCategoryResponse {
  gridElements: Array<{
    ccIds: number[];
    type: string;
    commercialComponentIds: Array<{
      ccId: number;
      defaultImageType: string;
      hiddenFields: any[];
      isAddToCartDisabled: boolean;
      mediaCompete: any[];
      type: string;
      kind: string;
      xmedia: any[];
    }>;
  }>;
  productIds: number[]; // Ana ürün ID'leri burada
}

interface PullBearProductDetailResponse {
  id: number;
  type: string;
  state: string;
  name: string;
  nameEn: string;
  image: string | null;
  backSoon: string;
  unitsLot: number;
  isTop: number;
  subFamily: string;
  productType: string;
  bundleColors: Array<{
    id: number;
    name: string;
  }>;
  tags: any[];
  attributes: Array<{
    id: string;
    name: string;
    value: string;
    type: string;
  }>;
  relatedCategories: Array<{
    id: number;
    identifier: string;
    name: string;
    urlCategory: boolean;
  }>;
  attachments: any[];
  bundleProductSummaries: Array<{
    id: number;
    type: string;
    name: string;
    nameEn: string;
    backSoon: string;
    unitsLot: number;
    isTop: number;
    sizeSystem: string;
    subFamily: string;
    productType: string;
    bundleColors: any[];
    tags: any[];
    attributes: any[];
    attachments: any[];
    price: string;
    color: {
      id: number;
      name: string;
      colorCode: string;
    };
    sizes: Array<{
      id: string;
      name: string;
      visibilityValue: string;
      weight: string;
      sizeSystem: string;
      attributes: any[];
      priceIdentifier: string;
    }>;
    composition: Array<{
      part: string;
      composition: Array<{
        id: string;
        name: string;
        description: string;
        percentage: string;
      }>;
    }>;
    xmedia: Array<{
      path: string;
      xmediaItems: Array<{
        medias: Array<{
          format: number;
          clazz: number;
          idMedia: string;
          timestamp: number;
          extraInfo: {
            originalName: string;
            assetId: string;
            deliveryUrl: string;
            deliveryPath: string;
            url: string;
          };
          url: string;
          metaUrl: string;
        }>;
      }>;
    }>;
  }>;
}

export class PullBearApiScraper {
  private baseUrl = 'https://www.pullandbear.com';
  private storeId = '25009521';
  private countryId = '20309457';
  private languageId = '-43';
  private appId = '1';

  /**
   * Fetch with retry mechanism
   */
  private async fetchWithRetry(
    url: string,
    retries: number = 3,
    timeout: number = 30000
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
            'Referer': 'https://www.pullandbear.com/',
            'Origin': 'https://www.pullandbear.com'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        console.warn(`Attempt ${i + 1} failed with status ${response.status}`);
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }

    throw new Error(`Failed to fetch after ${retries} attempts`);
  }

  /**
   * Get category products (product IDs)
   */
  private async getCategoryProducts(categoryId: string): Promise<string[]> {
    const url = `${this.baseUrl}/itxrest/3/catalog/store/${this.storeId}/${this.countryId}/category/${categoryId}/product?languageId=${this.languageId}&showProducts=false&priceFilter=true&appId=${this.appId}`;

    console.log(`🔍 Fetching category products for categoryId: ${categoryId}`);

    try {
      const response = await this.fetchWithRetry(url);
      const data: PullBearCategoryResponse = await response.json();

      console.log(`✅ Category API response:`, {
        categoryId,
        hasProductIds: Array.isArray(data.productIds),
        productIdsCount: Array.isArray(data.productIds) ? data.productIds.length : 0,
        sampleProductIds: Array.isArray(data.productIds) ? data.productIds.slice(0, 5) : []
      });

      // pullandbear.md'ye göre productIds array'inden direkt alıyoruz
      if (data.productIds && Array.isArray(data.productIds)) {
        const productIds = data.productIds.map(String);
        console.log(`📦 Found ${productIds.length} product IDs in category ${categoryId}`);
        return productIds;
      }

      return [];
    } catch (error) {
      console.error(`❌ Error fetching category products for ${categoryId}:`, error);
      return [];
    }
  }

  /**
   * Get product details
   */
  private async getProductDetails(productId: string): Promise<PullBearProductDetailResponse | null> {
    const url = `${this.baseUrl}/itxrest/2/catalog/store/${this.storeId}/${this.countryId}/category/0/product/${productId}/detail?languageId=${this.languageId}&appId=${this.appId}`;

    console.log(`🔍 Fetching product details for productId: ${productId}`);

    try {
      const response = await this.fetchWithRetry(url, 3, 20000);
      const data: PullBearProductDetailResponse = await response.json();

      console.log(`✅ Product details API response for ${productId}:`, {
        productName: data.name || 'N/A',
        bundleColorsCount: data.bundleColors?.length || 0,
        bundleProductSummariesCount: data.bundleProductSummaries?.length || 0,
        hasXmedia: !!data.xmedia
      });

      return data;
    } catch (error) {
      console.error(`❌ Error fetching product details for ${productId}:`, error);
      return null;
    }
  }

  /**
   * Transform product data to our format
   */
  private transformProduct(productId: string, detail: PullBearProductDetailResponse): PullBearProduct {
    const productName = detail.name || 'Ürün Adı Yok';

    // Extract price from first bundle product summary's first color's first size
    const firstBundle = detail.bundleProductSummaries?.[0];
    const firstColor = firstBundle?.detail?.colors?.[0];
    const firstSize = firstColor?.sizes?.[0];
    const price = firstSize?.price || firstBundle?.price || '0';
    const priceNum = parseInt(price) / 100 || 0; // Pull & Bear API'si kuruş cinsinden fiyat veriyor

    console.log(`🔍 Debug for ${productName} (ID: ${productId}):`, {
      hasFirstBundle: !!firstBundle,
      bundlePrice: firstBundle?.price,
      hasFirstColor: !!firstColor,
      hasFirstSize: !!firstSize,
      sizePrice: firstSize?.price,
      finalPrice: price,
      finalPriceNum: priceNum,
      hasBundleDetail: !!firstBundle?.detail,
      hasBundleXmedia: !!firstBundle?.detail?.xmedia,
      bundleXmediaCount: firstBundle?.detail?.xmedia?.length || 0,
      hasBundleColors: !!firstBundle?.detail?.colors,
      bundleColorsCount: firstBundle?.detail?.colors?.length || 0,
      hasMainXmedia: !!detail.xmedia,
      mainXmediaCount: detail.xmedia?.length || 0,
      hasMainColors: !!detail.colors,
      mainColorsCount: detail.colors?.length || 0
    });

    // Extract images from bundleProductSummaries[0].detail.xmedia - productdetails.md'ye göre gerçek yapı
    const images: string[] = [];
    const xmediaData = firstBundle?.detail?.xmedia || detail.xmedia;
    if (xmediaData && Array.isArray(xmediaData)) {
      xmediaData.forEach(xmediaGroup => {
        if (xmediaGroup.xmediaItems && Array.isArray(xmediaGroup.xmediaItems)) {
          xmediaGroup.xmediaItems.forEach(item => {
            if (item.medias && Array.isArray(item.medias)) {
              item.medias.forEach(media => {
                // productdetails.md'ye göre gerçek image URL formatı
                if (media.url) {
                  if (!images.includes(media.url)) {
                    images.push(media.url);
                  }
                }
              });
            }
          });
        }
      });
    }

    const primaryImage = images[0] || '';

    console.log(`🖼️ Image extraction for ${productId}:`, {
      totalImagesFound: images.length,
      primaryImage: primaryImage,
      sampleImages: images.slice(0, 3)
    });

    // Extract colors from bundleProductSummaries[0].detail.colors array (Pull & Bear'da gerçek yapı)
    const colorsData = firstBundle?.detail?.colors || detail.colors;
    const colors = colorsData?.map((color, index) => {
      // Her renk için ayrı görselleri çıkar
      const colorImages: string[] = [];
      if (xmediaData && Array.isArray(xmediaData)) {
        xmediaData.forEach(xmediaGroup => {
          if (xmediaGroup.colorCode === color.id && xmediaGroup.xmediaItems && Array.isArray(xmediaGroup.xmediaItems)) {
            xmediaGroup.xmediaItems.forEach(item => {
              if (item.medias && Array.isArray(item.medias)) {
                item.medias.forEach(media => {
                  if (media.url && !colorImages.includes(media.url)) {
                    colorImages.push(media.url);
                  }
                });
              }
            });
          }
        });
      }

      return {
        name: color.name || `Renk ${index + 1}`,
        code: color.id || `color-${index}`,
        backgroundColor: '#000000', // Pull & Bear'da hex code yok
        sku: color.reference || `${productId}-${color.id || index}`,
        images: colorImages.length > 0 ? colorImages : images // Eğer renk spesifik görsel yoksa genel görselleri kullan
      };
    }) || [];

    // Extract sizes from first color's sizes array
    const sizes = colorsData?.[0]?.sizes?.map(size => size.name) || [];

    // Extract composition from bundleProductSummaries[0].detail.composition
    const composition = firstBundle?.detail?.composition?.map(comp =>
      comp.composition?.map(c => `${c.name} %${c.percentage}`).join(', ') || ''
    ).join(' | ') || '';

    // Extract care instructions from bundleProductSummaries[0].detail.care
    const careInstructions = firstBundle?.detail?.care?.map(care =>
      care.description || care.name || ''
    ).join(' ') || '';

    // Extract description from bundleProductSummaries[0].detail
    const description = firstBundle?.detail?.longDescription || firstBundle?.detail?.description || '';

    // Extract reference from bundleProductSummaries[0].detail
    const reference = firstBundle?.detail?.reference || productId;

    // Create product URL using productUrl from bundle
    const productUrl = firstBundle?.productUrl ?
      `https://www.pullandbear.com/tr/tr/product/${firstBundle.productUrl}` :
      `https://www.pullandbear.com/tr/tr/product/${productId}`;

    return {
      id: productId,
      name: productName,
      price: `${priceNum.toFixed(2)} TL`,
      priceNum: priceNum,
      currency: 'TL',
      images: images,
      primaryImage: primaryImage,
      url: productUrl,
      description: description,
      rawDescription: description,
      productCode: reference,
      composition: composition,
      careInstructions: careInstructions,
      metaTitle: productName,
      metaDescription: description,
      sizes: sizes,
      colors: colors
    };
  }

  /**
   * Scrape category products
   */
  async scrapeCategoryProducts(categoryId: string, testCount?: number | null): Promise<PullBearProduct[]> {
    console.log(`🚀 Starting Pull & Bear scraping for categoryId: ${categoryId}`);

    try {
      // Get product IDs from category
      const productIds = await this.getCategoryProducts(categoryId);

      if (productIds.length === 0) {
        console.log(`⚠️ No products found for categoryId: ${categoryId}`);
        return [];
      }

      console.log(`📦 Found ${productIds.length} products for categoryId: ${categoryId}`);

      // Apply test count limit early to avoid unnecessary API calls
      let limitedProductIds = productIds;
      if (testCount && testCount > 0 && productIds.length > testCount) {
        limitedProductIds = productIds.slice(0, testCount);
        console.log(`🧪 Test mode: Limited from ${productIds.length} to ${testCount} products early`);
      }

      // Fetch product details sequentially to avoid rate limiting
      const products: PullBearProduct[] = [];

      for (const productId of limitedProductIds) {
        try {
          const detailResponse = await this.getProductDetails(productId);

          if (detailResponse) {
            const product = this.transformProduct(productId, detailResponse);
            products.push(product);
            console.log(`✅ Processed product: ${product.name} (${productId})`);
          } else {
            console.warn(`⚠️ No detail data for product: ${productId}`);
          }
        } catch (error) {
          console.error(`❌ Error processing product ${productId}:`, error);
          continue;
        }
      }

      console.log(`🎉 Pull & Bear scraping completed. Total products: ${products.length}`);
      return products;

    } catch (error) {
      console.error(`❌ Error in Pull & Bear scraping:`, error);
      return [];
    }
  }
}

export const pullBearApiScraper = new PullBearApiScraper();
