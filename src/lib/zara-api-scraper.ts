import { NextRequest } from 'next/server';

interface ZaraProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
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

interface ZaraApiResponse {
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

export class ZaraApiScraper {
  private baseUrl = 'https://www.zara.com/tr/tr/category';
  private apiUrl = 'https://www.zara.com/tr/tr/category/{categoryId}/products?ajax=true';

  /**
   * Fetch with retry logic for better reliability
   */
  private async fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for: ${url}`);

        const response = await fetch(url, options);

        if (response.ok) {
          console.log(`✅ Success on attempt ${attempt}`);
          return response;
        } else {
          console.log(`⚠️ Response not ok: ${response.status} ${response.statusText}`);
          if (attempt === maxRetries) {
            throw new Error(`API request failed after ${maxRetries} attempts: ${response.status} ${response.statusText}`);
          }
        }
      } catch (error) {
        lastError = error as Error;
        console.log(`❌ Attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error');

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Scrape products from Zara API endpoint
   */
  async scrapeCategoryProducts(categoryUrl: string, testCount?: number | null): Promise<ZaraProduct[]> {
    try {
      console.log(`🔄 Starting Zara API scraping for: ${categoryUrl}`);

      // Extract category ID from URL
      const categoryId = this.extractCategoryId(categoryUrl);
      if (!categoryId) {
        throw new Error('Invalid Zara category URL format');
      }

      // Construct API URL
      const apiUrl = this.apiUrl.replace('{categoryId}', categoryId);
      console.log(`📡 API URL: ${apiUrl}`);

      // Make API request with proper headers and timeout
      const response = await this.fetchWithRetry(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.zara.com/tr/tr/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Chromium";v="123", "Not(A:Brand";v="24", "Google Chrome";v="123"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📊 API response received, checking structure...`);
      console.log(`📊 Response keys:`, Object.keys(data));

      // Log the structure for debugging
      if (data.productGroups) {
        console.log(`📊 ProductGroups structure:`, {
          count: data.productGroups.length,
          firstGroup: data.productGroups[0] ? {
            id: data.productGroups[0].id,
            type: data.productGroups[0].type,
            elementsCount: data.productGroups[0].elements?.length || 0
          } : null
        });
      }

      // Eğer elements varsa detaylı log
      if (data.elements) {
        console.log(`📊 Elements count:`, data.elements.length);
        data.elements.forEach((element: any, index: number) => {
          console.log(`📊 Element ${index}:`, {
            id: element.id,
            type: element.type,
            commercialComponents: element.commercialComponents?.length || 0
          });
        });
      }

      // Eğer productGroups varsa detaylı log
      if (data.productGroups) {
        console.log(`📊 ProductGroups count:`, data.productGroups.length);
        data.productGroups.forEach((group: any, index: number) => {
          console.log(`📊 ProductGroup ${index}:`, {
            id: group.id,
            name: group.name,
            commercialComponents: group.commercialComponents?.length || 0
          });

          // Tüm group anahtarlarını göster
          console.log(`📊 Group ${index} keys:`, Object.keys(group));

          // Eğer commercialComponents varsa ama boşsa, diğer anahtarları kontrol et
          if (group.commercialComponents && group.commercialComponents.length === 0) {
            console.log(`📊 Group ${index} has empty commercialComponents, checking other keys...`);
            Object.keys(group).forEach(key => {
              if (key !== 'commercialComponents' && group[key] && Array.isArray(group[key])) {
                console.log(`📊 Group ${index} has array in key '${key}':`, group[key].length, 'items');
              }
            });
          }
        });
      }

      // Zara API'sinin gerçek yapısını kontrol et
      let products: any[] = [];

      if (data.productGroups && Array.isArray(data.productGroups)) {
        console.log(`📊 Processing ${data.productGroups.length} productGroups...`);

        // productGroups -> elements -> commercialComponents yapısından ürünleri al
        products = data.productGroups.flatMap((group: any) =>
          group.elements?.flatMap((element: any) =>
            element.commercialComponents || []
          ) || []
        );
        console.log(`📦 Found ${products.length} products from productGroups->elements->commercialComponents`);
      } else if (data.elements && Array.isArray(data.elements)) {
        // Zara API'sinin gerçek yapısı: elements -> commercialComponents
        products = data.elements.flatMap((element: any) =>
          element.commercialComponents || []
        );
        console.log(`📦 Found ${products.length} products from elements`);
      } else if (data.products && Array.isArray(data.products)) {
        products = data.products;
      } else if (data.items && Array.isArray(data.items)) {
        products = data.items;
      } else if (Array.isArray(data)) {
        products = data;
      } else if (data.data && Array.isArray(data.data)) {
        products = data.data;
      } else {
        console.log('📊 API response structure:', Object.keys(data));
        throw new Error('No products found in the category - API response structure unknown');
      }

      console.log(`📦 Found ${products.length} products from API`);

      // Apply test count limit early to avoid unnecessary API calls
      if (testCount && testCount > 0 && products.length > testCount) {
        products = products.slice(0, testCount);
        console.log(`🧪 Test mode: Limited from ${products.length} to ${testCount} products early`);
      }

      if (products.length === 0) {
        console.log('⚠️ No products found in API response');
        console.log('📊 Available keys in response:', Object.keys(data));

        // API response yapısını daha detaylı logla
        if (data.elements) {
          console.log('📊 Elements structure:', data.elements.map((el: any) => ({
            id: el.id,
            type: el.type,
            commercialComponents: el.commercialComponents?.length || 0
          })));
        }

        throw new Error('No products found in the category. Please check if the Zara API URL is correct and contains products.');
      }

      // Get detailed product information from products-details API
      console.log(`🔍 Fetching detailed product information...`);
      const productIds = products.map(p => p.id?.toString()).filter(Boolean);

      // Try batch first, then individual calls if needed
      let detailedProducts = await this.getProductDetails(productIds);
      const detailedProductsMap = new Map();

      // If batch call didn't return enough products, try individual calls
      if (detailedProducts.length < products.length) {
        console.log(`⚠️ Batch API returned ${detailedProducts.length}/${products.length} products, trying individual calls...`);

        for (const productId of productIds) {
          if (!detailedProductsMap.has(productId)) {
            console.log(`🔍 Fetching individual product details for ID: ${productId}`);
            const individualProducts = await this.getProductDetails([productId]);
            if (individualProducts.length > 0) {
              detailedProducts.push(individualProducts[0]);
            }
          }
        }
      }

      // Create a map for quick lookup - include all color variants
      detailedProducts.forEach(product => {
        detailedProductsMap.set(product.id.toString(), product);

        // Also map color variants by their productId
        if (product.detail?.colors && Array.isArray(product.detail.colors)) {
          product.detail.colors.forEach((color: any) => {
            if (color.productId) {
              detailedProductsMap.set(color.productId.toString(), product);
            }
          });
        }
      });

      // Get filters data (colors and sizes) from filters API
      console.log(`🎨 Fetching filters data for colors and sizes...`);
      const filtersData = await this.getFiltersData(categoryUrl);
      console.log(`📊 Filters data received:`, filtersData ? 'Success' : 'Failed');

      // Transform API data to our format based on real Zara API structure
      const transformedProducts: ZaraProduct[] = [];

      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        const detailedProduct = detailedProductsMap.get(product.id?.toString());

        try {

        console.log(`🔄 Processing product ${index}:`, {
          id: product.id,
          name: product.name,
          price: product.price,
          reference: product.reference,
          hasDetailedInfo: !!detailedProduct
        });

        // Use detailed product info if available, otherwise fall back to basic info
        const sourceProduct = detailedProduct || product;

        // Zara API'sinden gelen ürün yapısını işle
        const productId = product.id?.toString() || product.reference || `product-${index}`;
        const productName = product.name || 'Unknown Product';

        // Debug: Log detailed product structure
        if (detailedProduct) {
          console.log(`🔍 Detailed product structure for ${productName}:`, {
            hasDetail: !!detailedProduct.detail,
            hasColors: !!detailedProduct.detail?.colors,
            colorsCount: detailedProduct.detail?.colors?.length || 0,
            colorsStructure: detailedProduct.detail?.colors?.map((c: any) => ({
              id: c.id,
              name: c.name,
              hexCode: c.hexCode,
              productId: c.productId,
              imagesCount: c.xmedia?.length || 0,
              sizesCount: c.sizes?.length || 0
            })) || []
          });
        }
        const productPrice = product.price || 0;
        const productPriceText = this.formatPrice(productPrice);

        // Get extra details (materials, care) for this product using productId
        let extraDetails: {composition?: string, careInstructions?: string} = {};
        try {
          extraDetails = await this.getProductExtraDetails(productId);
        } catch (error) {
          console.log(`⚠️ Failed to get extra details for ${productName}, continuing without them:`, error instanceof Error ? error.message : 'Unknown error');
          extraDetails = {};
        }

        // Resimleri işle - detailed product'tan veya fallback olarak basic product'tan
        const images: string[] = [];

        // Productdetails.md yapısına göre görselleri al
        const sourceXmedia = sourceProduct.detail?.colors?.[0]?.xmedia || sourceProduct.xmedia || [];
        if (sourceXmedia && Array.isArray(sourceXmedia)) {
          sourceXmedia.forEach((media: any) => {
            if (media.url) {
              images.push(media.url.replace('{width}', '800'));
            }
          });
        }

        // Ana ürün için mainImgs array'ini de kontrol et
        if (sourceProduct.mainImgs && Array.isArray(sourceProduct.mainImgs)) {
          sourceProduct.mainImgs.forEach((img: any) => {
            if (img.url) {
              images.push(img.url.replace('{width}', '800'));
            }
          });
        }

        // Renkleri işle - filters API'den veya fallback olarak detailed/basic product'tan
        const colors: Array<{name: string, code: string, backgroundColor?: string, sku?: string, images: string[]}> = [];

        // Try to get colors from filters API first
        let productColors: any[] = [];
        console.log(`🔍 Debug for ${productName} (ID: ${productId}):`, {
          hasFiltersData: !!filtersData,
          hasFilters: !!filtersData?.filters,
          filtersCount: filtersData?.filters?.length || 0
        });

        if (filtersData?.filters) {
          const colorFilter = filtersData.filters.find((f: any) => f.id === 'color');
          console.log(`🎨 Color filter found:`, {
            hasColorFilter: !!colorFilter,
            colorFilterId: colorFilter?.id,
            colorOptionsCount: colorFilter?.value?.length || 0
          });

          if (colorFilter && colorFilter.value) {
            // Find colors that include this product ID
            const matchingColors = colorFilter.value.filter((colorOption: any) =>
              colorOption.catentries && colorOption.catentries.includes(parseInt(productId))
            );

            console.log(`🎨 Matching colors for product ${productId}:`, {
              totalColorOptions: colorFilter.value.length,
              matchingColorsCount: matchingColors.length,
              matchingColors: matchingColors.map((c: any) => ({ id: c.id, name: c.value, catentries: c.catentries }))
            });

            if (matchingColors.length > 0) {
              productColors = matchingColors.map((colorOption: any) => ({
                id: colorOption.id,
                name: colorOption.value,
                hexCode: colorOption.colorHexCode || '#000000'
              }));
              console.log(`🎨 Found ${productColors.length} colors from filters API for ${productName}`);
            }
          }
        }

        // Fallback to detailed/basic product colors if filters API didn't work or returned insufficient colors
        if (productColors.length === 0) {
          // Try multiple sources for colors
          const detailedColors = detailedProduct?.detail?.colors || [];
          const basicColors = product?.detail?.colors || [];
          const sourceColors = detailedColors.length > 0 ? detailedColors : basicColors;

          console.log(`🎨 Using fallback colors from product data:`, {
            detailedColorsCount: detailedColors.length,
            basicColorsCount: basicColors.length,
            finalColorsCount: sourceColors.length
          });

          if (sourceColors && Array.isArray(sourceColors)) {
            productColors = sourceColors.map((color: any) => ({
              id: color.id,
              name: color.name,
              hexCode: color.hexCode || color.colorInfo?.mainColorHexCode,
              xmedia: color.xmedia || [],
              mainImgs: color.mainImgs || []
            }));
          }
        } else if (productColors.length < 2) {
          // If filters API returned only 1 color but we expect more, try fallback
          const detailedColors = detailedProduct?.detail?.colors || [];
          const basicColors = product?.detail?.colors || [];
          const sourceColors = detailedColors.length > 0 ? detailedColors : basicColors;

          console.log(`🎨 Filters API returned only ${productColors.length} color(s), checking fallback data:`, {
            detailedColorsCount: detailedColors.length,
            basicColorsCount: basicColors.length,
            finalColorsCount: sourceColors.length
          });

          if (sourceColors && Array.isArray(sourceColors) && sourceColors.length > productColors.length) {
            console.log(`🎨 Using fallback colors instead of filters API (${sourceColors.length} vs ${productColors.length})`);
            productColors = sourceColors.map((color: any) => ({
              id: color.id,
              name: color.name,
              hexCode: color.hexCode || color.colorInfo?.mainColorHexCode,
              xmedia: color.xmedia || [],
              mainImgs: color.mainImgs || []
            }));
          }
        }

        // Always prioritize detailed product colors if available (they have all variants)
        if (detailedProduct?.detail?.colors && Array.isArray(detailedProduct.detail.colors) && detailedProduct.detail.colors.length > 0) {
          console.log(`🎨 Using detailed product colors (${detailedProduct.detail.colors.length} colors) instead of other sources`);
          productColors = detailedProduct.detail.colors.map((color: any) => ({
            id: color.id,
            name: color.name,
            hexCode: color.hexCode || color.colorInfo?.mainColorHexCode,
            xmedia: color.xmedia || [],
            mainImgs: color.mainImgs || []
          }));
        }

        // Process colors - Productdetails.md yapısına göre düzeltildi
        productColors.forEach((color: any) => {
          const colorImages: string[] = [];

          console.log(`🎨 Processing color: ${color.name}`, {
            hasMainImgs: color.mainImgs && Array.isArray(color.mainImgs),
            mainImgsCount: color.mainImgs?.length || 0,
            hasXmedia: color.xmedia && Array.isArray(color.xmedia),
            xmediaCount: color.xmedia?.length || 0
          });

          // mainImgs array'inden görselleri al
          if (color.mainImgs && Array.isArray(color.mainImgs)) {
            color.mainImgs.forEach((img: any) => {
              if (img.url) {
                const imageUrl = img.url.replace('{width}', '800');
                colorImages.push(imageUrl);
                console.log(`📸 Added mainImg: ${imageUrl}`);
              }
            });
          }

          // xmedia array'inden görselleri al
          if (color.xmedia && Array.isArray(color.xmedia)) {
            color.xmedia.forEach((media: any) => {
              if (media.url) {
                const imageUrl = media.url.replace('{width}', '800');
                colorImages.push(imageUrl);
                console.log(`📸 Added xmedia: ${imageUrl}`);
              }
            });
          }

          console.log(`🎨 Color ${color.name} has ${colorImages.length} images:`, colorImages);

          colors.push({
            name: color.name || 'Unknown Color',
            code: color.id || 'default',
            backgroundColor: color.hexCode || '#000000',
            sku: `${productId}-${color.id || 'default'}`,
            images: colorImages
          });
        });

        // If still no colors found, skip this product
        if (colors.length === 0) {
          console.log(`⚠️ No colors found for ${productName}, skipping product`);
          throw new Error(`No colors found for ${productName}`);
        }

        // Bedenleri işle - filters API'den veya fallback olarak detailed/basic product'tan
        const sizes: string[] = [];

        // Try to get sizes from filters API first
        let productSizes: string[] = [];
        if (filtersData?.filters) {
          const sizeFilter = filtersData.filters.find((f: any) => f.id === 'size');
          if (sizeFilter && sizeFilter.value) {
            // Find sizes that include this product ID
            const matchingSizes = sizeFilter.value.filter((sizeOption: any) =>
              sizeOption.catentries && sizeOption.catentries.includes(parseInt(productId))
            );

            if (matchingSizes.length > 0) {
              productSizes = matchingSizes.map((sizeOption: any) => sizeOption.value);
              console.log(`📏 Found ${productSizes.length} sizes from filters API for ${productName}`);
            }
          }
        }

        // Fallback to detailed/basic product sizes if filters API didn't work or returned insufficient sizes
        if (productSizes.length === 0) {
          // Try multiple sources for sizes
          const detailedColorsForSizes = detailedProduct?.detail?.colors || [];
          const basicColorsForSizes = product?.detail?.colors || [];
          const sourceColorsForSizes = detailedColorsForSizes.length > 0 ? detailedColorsForSizes : basicColorsForSizes;

          console.log(`📏 Using fallback sizes from product data:`, {
            detailedColorsCount: detailedColorsForSizes.length,
            basicColorsCount: basicColorsForSizes.length,
            finalColorsCount: sourceColorsForSizes.length
          });

          if (sourceColorsForSizes && Array.isArray(sourceColorsForSizes)) {
            const allSizes = new Set<string>();
            sourceColorsForSizes.forEach((color: any) => {
              if (color.sizes && Array.isArray(color.sizes)) {
                color.sizes.forEach((size: any) => {
                  // Productdetails.md yapısına göre size.name kullan
                  if (size.name) {
                    allSizes.add(size.name);
                  }
                });
              }
            });
            productSizes = Array.from(allSizes);
          }
        } else if (productSizes.length < 2) {
          // If filters API returned only few sizes but we expect more, try fallback
          const detailedColorsForSizes = detailedProduct?.detail?.colors || [];
          const basicColorsForSizes = product?.detail?.colors || [];
          const sourceColorsForSizes = detailedColorsForSizes.length > 0 ? detailedColorsForSizes : basicColorsForSizes;

          console.log(`📏 Filters API returned only ${productSizes.length} size(s), checking fallback data:`, {
            detailedColorsCount: detailedColorsForSizes.length,
            basicColorsCount: basicColorsForSizes.length,
            finalColorsCount: sourceColorsForSizes.length
          });

          if (sourceColorsForSizes && Array.isArray(sourceColorsForSizes)) {
            const allSizes = new Set<string>();
            sourceColorsForSizes.forEach((color: any) => {
              if (color.sizes && Array.isArray(color.sizes)) {
                color.sizes.forEach((size: any) => {
                  if (size.name) {
                    allSizes.add(size.name);
                  }
                });
              }
            });
            const fallbackSizes = Array.from(allSizes);

            if (fallbackSizes.length > productSizes.length) {
              console.log(`📏 Using fallback sizes instead of filters API (${fallbackSizes.length} vs ${productSizes.length})`);
              productSizes = fallbackSizes;
            }
          }
        }

        sizes.push(...productSizes);

        // Eğer beden bulunamazsa ürünü atla
        if (sizes.length === 0) {
          console.log(`⚠️ No sizes found for ${productName}, skipping product`);
          throw new Error(`No sizes found for ${productName}`);
        }
        const finalSizes = sizes;

        // Primary image - use first color image or first product image
        let primaryImage = '';
        if (colors.length > 0 && colors[0].images.length > 0) {
          primaryImage = colors[0].images[0];
        } else if (images.length > 0) {
          primaryImage = images[0];
        } else {
          console.log(`⚠️ No images found for ${productName}, skipping product`);
          throw new Error(`No images found for ${productName}`);
        }

        const transformedProduct = {
          id: sourceProduct.id.toString(),
          name: productName,
          slug: productName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim(),
          price: productPriceText,
          currency: 'TL',
          images: images.length > 0 ? images : [],
          primaryImage: primaryImage,
          url: (() => {
            const metaTitle = sourceProduct.seo?.keyword || productName.toLowerCase().replace(/\s+/g, '-');
            const productCode = (product.reference || product.canonicalReference || sourceProduct.detail?.reference || '').split('-')[0];
            const firstColorProductId = product.colors?.[0]?.productId || productId;
            return `https://www.zara.com/tr/tr/${metaTitle}-p${productCode}.html?v1=${firstColorProductId}&v2=2458839`;
          })(),
          description: (detailedProduct?.detail?.colors?.[0]?.description || detailedProduct?.detail?.description || sourceProduct.description || product.description || product.rawDescription || '').substring(0, 1000),
          productCode: (product.reference || product.canonicalReference || sourceProduct.detail?.reference || '').substring(0, 191),
          composition: (extraDetails.composition || product.composition || '').substring(0, 1000),
          careInstructions: (extraDetails.careInstructions || product.careInstructions || '').substring(0, 1000),
          metaTitle: (sourceProduct.seo?.keyword || productName).substring(0, 191),
          metaDescription: (sourceProduct.seo?.description || sourceProduct.description || product.description || product.rawDescription || '').substring(0, 191),
          sizes: finalSizes,
          colors: colors // Only use real colors, no fallback
        };

        transformedProducts.push(transformedProduct);
        console.log(`✅ Product ${productName} added successfully with ${colors.length} colors and ${finalSizes.length} sizes`);

        } catch (error) {
          console.log(`⚠️ Skipping product ${product.name || 'Unknown'} due to missing data:`, error instanceof Error ? error.message : 'Unknown error');
          continue; // Skip this product and continue with the next one
        }
      }

      console.log(`✅ Successfully scraped ${transformedProducts.length} products`);

      return transformedProducts;

    } catch (error) {
      console.error('❌ Zara API scraping error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        categoryUrl: categoryUrl
      });
      throw error;
    }
  }

  /**
   * Extract category ID from Zara URL
   */
  private extractCategoryId(url: string): string | null {
    try {
      console.log(`🔍 Extracting category ID from URL: ${url}`);

      // Handle different URL formats:
      // Format 1: https://www.zara.com/tr/tr/category/2443335/products?ajax=true
      // Format 2: https://www.zara.com/tr/tr/categories?categoryId=2476849&categorySeoId=715&ajax=true

      // Try format 1: /category/{id}
      let match = url.match(/\/category\/(\d+)/);
      if (match) {
        console.log(`✅ Extracted category ID (format 1): ${match[1]}`);
        return match[1];
      }

      // Try format 2: /categories?categoryId={id}
      match = url.match(/[?&]categoryId=(\d+)/);
      if (match) {
        console.log(`✅ Extracted category ID (format 2): ${match[1]}`);
        return match[1];
      }

      console.log(`❌ No category ID found in URL: ${url}`);
      return null;
    } catch (error) {
      console.error('Error extracting category ID:', error);
      return null;
    }
  }

  /**
   * Parse price string to number
   */
  private parsePrice(priceStr: string): number {
    try {
      // Remove currency symbols and parse
      const cleanPrice = priceStr.replace(/[^\d,.-]/g, '').replace(',', '.');
      return parseFloat(cleanPrice) || 0;
    } catch (error) {
      console.error('Error parsing price:', error);
      return 0;
    }
  }

  /**
   * Format price from Zara API (kuruş to TL)
   */
  private formatPrice(priceInCents: number): string {
    try {
      const priceInTL = priceInCents / 100;
      return `${priceInTL.toFixed(2)} TL`;
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0,00 TL';
    }
  }

  /**
   * Get detailed product information from products-details API
   */
  async getProductDetails(productIds: string[]): Promise<any[]> {
    try {
      console.log(`🔍 Getting detailed product info for IDs: ${productIds.join(', ')}`);

      const productsDetailsUrl = `https://www.zara.com/tr/tr/products-details?productIds=${productIds.join(',')}&ajax=true`;
      console.log(`📡 Products details URL: ${productsDetailsUrl}`);

      const response = await this.fetchWithRetry(productsDetailsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.zara.com/tr/tr/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Chromium";v="123", "Not(A:Brand";v="24", "Google Chrome";v="123"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: AbortSignal.timeout(20000) // 20 seconds timeout
      }, 2); // 2 retries

      if (!response.ok) {
        console.log(`⚠️ Products details API failed: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      console.log(`📊 Products details response received: ${Array.isArray(data) ? data.length : 0} products`);

      // Debug: Log the structure of the response
      if (Array.isArray(data) && data.length > 0) {
        console.log(`🔍 Sample product structure from products-details API:`, {
          hasDetail: !!data[0].detail,
          hasColors: !!data[0].detail?.colors,
          colorsCount: data[0].detail?.colors?.length || 0,
          sampleColor: data[0].detail?.colors?.[0] || null
        });
      }

      return Array.isArray(data) ? data : [];

    } catch (error) {
      console.error('❌ Error getting products details:', error);
      return [];
    }
  }

  /**
   * Get filters data (colors and sizes) from filters API
   */
  async getFiltersData(categoryUrl: string): Promise<any> {
    try {
      // Extract category ID from URL
      const urlMatch = categoryUrl.match(/category\/(\d+)/);
      if (!urlMatch) {
        console.log('⚠️ Could not extract category ID from URL');
        return null;
      }

      const categoryId = urlMatch[1];
      const filtersUrl = `https://www.zara.com/tr/tr/category/${categoryId}/filters?ajax=true`;
      console.log(`📡 Filters URL: ${filtersUrl}`);

      const response = await this.fetchWithRetry(filtersUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': categoryUrl,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Chromium";v="123", "Not(A:Brand";v="24", "Google Chrome";v="123"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: AbortSignal.timeout(20000)
      }, 2);

      if (!response.ok) {
        console.log(`⚠️ Filters API failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log(`📊 Filters response received:`, {
        hasFilters: !!data.filters,
        filtersCount: data.filters?.length || 0,
        filterIds: data.filters?.map((f: any) => f.id) || []
      });

      // Log color filter details
      if (data.filters) {
        const colorFilter = data.filters.find((f: any) => f.id === 'color');
        if (colorFilter) {
          console.log(`🎨 Color filter details:`, {
            colorOptionsCount: colorFilter.value?.length || 0,
            firstFewColors: colorFilter.value?.slice(0, 3).map((c: any) => ({
              id: c.id,
              name: c.value,
              hexCode: c.colorHexCode,
              catentriesCount: c.catentries?.length || 0
            })) || []
          });
        }
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting filters data:', error);
      return null;
    }
  }

  /**
   * Get extra product details (materials, care) from extra-detail API
   */
  async getProductExtraDetails(productReference: string): Promise<{composition?: string, careInstructions?: string}> {
    try {
      console.log(`🔍 Getting extra details for product: ${productReference}`);

      const extraDetailUrl = `https://www.zara.com/tr/tr/product/${productReference}/extra-detail?ajax=true`;
      console.log(`📡 Extra detail URL: ${extraDetailUrl}`);

      const response = await this.fetchWithRetry(extraDetailUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.zara.com/tr/tr/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Chromium";v="123", "Not(A:Brand";v="24", "Google Chrome";v="123"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: AbortSignal.timeout(20000) // 20 seconds timeout for extra details
      }, 2); // 2 retries for extra details

      if (!response.ok) {
        console.log(`⚠️ Extra detail API failed: ${response.status} ${response.statusText}`);
        return {};
      }

      const data = await response.json();
      console.log(`📊 Extra detail response received`);

      // Parse materials and care information
      let composition = '';
      let careInstructions = '';

      if (Array.isArray(data)) {
        data.forEach((section: any) => {
          if (section.sectionType === 'materials' && section.components) {
            const materialTexts: string[] = [];
            section.components.forEach((component: any) => {
              if (component.datatype === 'paragraph' && component.text?.value) {
                materialTexts.push(component.text.value);
              }
            });
            composition = materialTexts.join(' ');
          }

          if (section.sectionType === 'care' && section.components) {
            const careTexts: string[] = [];
            section.components.forEach((component: any) => {
              if (component.datatype === 'paragraph' && component.text?.value) {
                careTexts.push(component.text.value);
              }
            });
            careInstructions = careTexts.join(' ');
          }
        });
      }

      console.log(`✅ Extra details parsed:`, {
        composition: composition ? composition.substring(0, 100) + '...' : 'none',
        careInstructions: careInstructions ? careInstructions.substring(0, 100) + '...' : 'none'
      });

      return {
        composition: composition || undefined,
        careInstructions: careInstructions || undefined
      };

    } catch (error) {
      console.error('❌ Error getting extra details:', error);
      return {};
    }
  }


  /**
   * Extract product ID from URL
   */
  private extractProductId(url: string): string {
    try {
      const match = url.match(/\/p(\d+)/);
      return match ? match[1] : Date.now().toString();
    } catch (error) {
      return Date.now().toString();
    }
  }
}

export const zaraApiScraper = new ZaraApiScraper();
