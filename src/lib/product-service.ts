import db from '@/lib/db'

export interface ProductData {
  id?: string
  name: string
  slug: string
  price: string
  primaryImage?: string
  productCode?: string
  description?: string
  metaTitle?: string
  metaDescription?: string
  composition?: string
  careInstructions?: string
  url?: string
  variants?: any[]
}

export class ProductService {
  /**
   * Check if product exists by productCode or URL
   */
  static async findExistingProduct(product: ProductData) {
    try {
      // 1. Önce ID ile ara
      if (product.id) {
        const byId = await db.product.findUnique({
          where: { id: product.id }
        });
        if (byId) {
          console.log(`✅ Found existing product by ID: ${byId.name}`);
          return byId;
        }
      }

      // 2. ProductCode ile ara
      if (product.productCode) {
        const byCode = await db.product.findUnique({
          where: { productCode: product.productCode }
        });
        if (byCode) {
          console.log(`✅ Found existing product by code: ${byCode.name}`);
          return byCode;
        }
      }

      // 3. Slug ile ara
      if (product.slug) {
        const bySlug = await db.product.findUnique({
          where: { slug: product.slug }
        });
        if (bySlug) {
          console.log(`✅ Found existing product by slug: ${bySlug.name}`);
          return bySlug;
        }
      }

      // 4. Son çare: isim ile ara (exact match)
      const byName = await db.product.findFirst({
        where: {
          name: product.name
        }
      });

      if (byName) {
        console.log(`✅ Found existing product by name: ${byName.name}`);
        return byName;
      }

      console.log(`❌ No existing product found for: ${product.name}`);
      return null;
    } catch (error) {
      console.error(`❌ Error finding existing product:`, error);
      return null;
    }
  }

  /**
   * Update existing product with new data
   */
  static async updateProduct(existingProduct: any, product: ProductData, brandId: number, categoryId: number) {
    console.log(`📝 Updating existing product: ${existingProduct.name}`);

    // Check for price changes
    const oldPrice = parseFloat(existingProduct.basePrice || '0');
    const newPrice = parseFloat(product.price || '0');

    if (oldPrice !== newPrice && oldPrice > 0) {
      await db.priceHistory.create({
        data: {
          productId: existingProduct.id,
          oldPrice: oldPrice,
          newPrice: newPrice,
          changedAt: new Date()
        }
      });
    }

    // Get existing variants for comparison
    const existingVariants = await db.colorVariants.findMany({
      where: { productId: existingProduct.id },
      include: { sizes: true }
    });

    // Track changes
    await this.trackColorChanges(existingProduct.id, existingVariants, product.variants || []);
    await this.trackSizeChanges(existingProduct.id, existingVariants, product.variants || []);

    // Delete existing variants first
    await db.colorVariants.deleteMany({
      where: { productId: existingProduct.id }
    });

    // Update product
    const updatedProduct = await db.product.update({
      where: { id: existingProduct.id },
      data: {
        name: product.name,
        slug: product.slug,
        basePrice: product.price,
        primaryImage: product.primaryImage,
        productCode: product.productCode,
        description: product.description,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        composition: product.composition,
        careInstructions: product.careInstructions,
        url: product.url,
        updatedAt: new Date(),
        colorVariants: {
          create: product.variants?.map((variant: any, variantIndex: number) => ({
            id: variant.id || `variant-${variantIndex}`,
            colorName: variant.colorName,
            colorCode: variant.colorCode,
            price: variant.price,
            hexColor: variant.backgroundColor,
            availability: variant.availability || 'IN_STOCK',
            sku: variant.sku,
            sizes: {
              create: variant.sizes?.map((size: any, sizeIndex: number) => ({
                id: size.id || `size-${variantIndex}-${sizeIndex}`,
                size: size.size || size.name || 'OS',
                availability: size.availability || 'IN_STOCK',
                isSelected: size.isSelected || false,
                originalOrder: size.originalOrder || sizeIndex
              })) || []
            }
          })) || []
        }
      }
    });

    console.log(`✅ Product updated successfully: ${product.name}`);
    return updatedProduct;
  }

  /**
   * Track color changes
   */
  static async trackColorChanges(productId: string, existingVariants: any[], newVariants: any[]) {
    const existingColors = new Set(existingVariants.map(v => v.colorName));
    const newColors = new Set(newVariants.map(v => v.colorName));

    // Find added colors
    const addedColors = Array.from(newColors).filter(color => !existingColors.has(color));
    for (const color of addedColors) {
      await db.colorHistory.create({
        data: {
          productId,
          action: 'ADDED',
          colorName: color,
          changedAt: new Date()
        }
      });
    }

    // Find removed colors
    const removedColors = Array.from(existingColors).filter(color => !newColors.has(color));
    for (const color of removedColors) {
      await db.colorHistory.create({
        data: {
          productId,
          action: 'REMOVED',
          colorName: color,
          changedAt: new Date()
        }
      });
    }
  }

  /**
   * Track size changes
   */
  static async trackSizeChanges(productId: string, existingVariants: any[], newVariants: any[]) {
    const existingSizes = new Set();
    const newSizes = new Set();

    // Collect existing sizes
    existingVariants.forEach(variant => {
      variant.sizes.forEach((size: any) => {
        existingSizes.add(`${variant.colorName}-${size.size}`);
      });
    });

    // Collect new sizes
    newVariants.forEach(variant => {
      variant.sizes.forEach((size: any) => {
        newSizes.add(`${variant.colorName}-${size.size}`);
      });
    });

    // Find added sizes
    const addedSizes = Array.from(newSizes).filter(size => !existingSizes.has(size as string));
    for (const size of addedSizes) {
      const [colorName, sizeName] = (size as string).split('-');
      await db.sizeHistory.create({
        data: {
          productId,
          action: 'ADDED',
          size: sizeName,
          changedAt: new Date()
        }
      });
    }

    // Find removed sizes
    const removedSizes = Array.from(existingSizes).filter(size => !newSizes.has(size as string));
    for (const size of removedSizes) {
      const [colorName, sizeName] = (size as string).split('-');
      await db.sizeHistory.create({
        data: {
          productId,
          action: 'REMOVED',
          size: sizeName,
          changedAt: new Date()
        }
      });
    }
  }

  /**
   * Create new product
   */
  static async createProduct(product: ProductData, brandId: number, categoryId: number, uploadedImages?: any[]) {
    try {
      return await db.product.create({
        data: {
          id: product.id || `product-${Date.now()}`,
          name: product.name,
          slug: product.slug,
          basePrice: product.price,
          primaryImage: product.primaryImage,
          productCode: product.productCode,
          description: product.description,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          composition: product.composition,
          careInstructions: product.careInstructions,
          url: product.url,
          updatedAt: new Date(),
          brandId,
          productCategories: {
            create: {
              categoryId
            }
          },
          colorVariants: {
            create: product.variants?.map((variant: any, variantIndex: number) => ({
              id: variant.id || `variant-${variantIndex}`,
              colorName: variant.colorName,
              colorCode: variant.colorCode,
              price: variant.price,
              hexColor: variant.backgroundColor,
              availability: variant.availability || 'IN_STOCK',
              sku: variant.sku,
              sizes: {
                create: variant.sizes?.map((size: any, sizeIndex: number) => ({
                  id: size.id || `size-${variantIndex}-${sizeIndex}`,
                  size: size.size || size.name || 'OS', // Fallback for missing size field
                  availability: size.availability || 'IN_STOCK',
                  isSelected: size.isSelected || false,
                  originalOrder: size.originalOrder || sizeIndex
                })) || []
              }
            })) || []
          }
        }
      })
    } catch (error: any) {
      console.error(`❌ Create product error:`, error);
      throw error;
    }
  }

  /**
   * Save or update product (main method)
   */
  static async saveProduct(product: ProductData, brandId: number, categoryId: number, uploadedImages?: any[]) {
    try {
      // Önce mevcut ürünü kontrol et
      console.log(`🔍 Checking if product exists: ${product.name}`);
      const existingProduct = await this.findExistingProduct(product);

      if (existingProduct) {
        // Ürün mevcut, güncelle
        console.log(`📝 Product exists, updating: ${product.name}`);
        return await this.updateProduct(existingProduct, product, brandId, categoryId);
      } else {
        // Ürün yok, yeni oluştur
        console.log(`➕ Product not found, creating new: ${product.name}`);
        return await this.createProduct(product, brandId, categoryId, uploadedImages);
      }
    } catch (error: any) {
      console.error(`❌ Error saving product ${product.name}:`, error);
      throw error;
    }
  }
}
