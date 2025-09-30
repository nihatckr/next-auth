#!/usr/bin/env node

import db from '@/lib/db.js';
import { PrismaClient, ScrapeStatus } from './src/lib/generated/prisma/index.js';

interface ZaraColorVariant {
  colorName: string;
  colorCode?: string;
  price?: string;
  images?: string[];
  sizes?: string[];
  backgroundColor?: string;
}

interface ZaraProduct {
  name: string;
  basePrice: string;
  link: string;
  description?: string;
  productCode?: string;
  composition?: string;
  careInstructions?: string;
  colorVariants: ZaraColorVariant[];
}



class ScrapeWorker {
  private isRunning = false;
  private pollInterval = 5000; // 5 seconds

  // Zara config based on working sample
  private config = {
    selectors: {
      productName: [
        'h1',
        '.product-detail-info__header-name',
        '[data-qa-qualifier="product-title"]'
      ],
      productPrice: [
        '.money-amount__main',
        '[data-qa-qualifier="product-price"]',
        '.price'
      ],
      productDescription: [
        '.product-detail-info__description',
        '.expandable-text__inner-text',
        '[data-qa-qualifier="product-description"]'
      ],
      productCode: [
        '.product-color-extended-name__copy-action'
      ],
      colorButton: '.product-detail-color-item__color-button',
      sizeSelector: [
        '.product-detail-size-selector-std__wrapper .product-detail-cart-buttons__main-action button'
      ],
      materialsButton: [
        'button[data-qa-action="show-extra-detail"]'
      ],
      cookieAccept: [
        '#onetrust-accept-btn-handler',
        '[data-qa-action="accept-cookies"]'
      ],
      productLinks: [
        '.product-link',
        'a[href*="/p0"]',
        '.product-item a'
      ]
    },
    delays: {
      pageLoad: 2000,
      colorSwitch: 1500,
      requestDelay: 1000,
      retry: 3000
    }
  };

  async start() {
    this.isRunning = true;
    console.log('🚀 Scrape Worker started');
    console.log(`📊 Polling interval: ${this.pollInterval}ms`);

    while (this.isRunning) {
      try {
        await this.processNextJob();
        await this.sleep(this.pollInterval);
      } catch (error) {
        console.error('❌ Worker error:', error);
        await this.sleep(this.pollInterval);
      }
    }
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Scrape Worker stopping...');
  }

  private async processNextJob() {
    // Get next pending job
    const job = await db.scrapeJob.findFirst({
      where: { status: ScrapeStatus.PENDING },
      orderBy: { createdAt: 'asc' }
    });

    if (!job) {
      // console.log('📭 No pending jobs');
      return;
    }

    console.log(`🔄 Processing job ${job.id}: ${job.url}`);

    try {
      // Mark job as processing
      await db.scrapeJob.update({
        where: { id: job.id },
        data: {
          status: ScrapeStatus.PROCESSING,
          updatedAt: new Date()
        }
      });

      // Process the job
      if (job.url.includes('/l') && !job.url.includes('/p0')) {
        // Category page
        await this.processCategoryJob(job);
      } else {
        // Product page
        await this.processProductJob(job);
      }

      // Mark job as done
      await db.scrapeJob.update({
        where: { id: job.id },
        data: {
          status: ScrapeStatus.DONE,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Job ${job.id} completed successfully`);

    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);

      // Mark job as failed
      await db.scrapeJob.update({
        where: { id: job.id },
        data: {
          status: ScrapeStatus.FAILED,
          updatedAt: new Date()
        }
      });
    }
  }

  private async processCategoryJob(job: any) {
    const productUrls = await this.scrapeCategoryForProducts(job.url);
    console.log(`📦 Found ${productUrls.length} products in category`);

    // Process first 5 products
    for (let i = 0; i < Math.min(productUrls.length, 5); i++) {
      const productUrl = productUrls[i];
      try {
        const product = await this.scrapeProductDetails(productUrl);
        if (product) {
          await this.saveProductToDatabase(product);
          console.log(`✅ Saved product: ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Error scraping product ${productUrl}:`, error);
      }
    }
  }

  private async processProductJob(job: any) {
    const product = await this.scrapeProductDetails(job.url);
    if (product) {
      await this.saveProductToDatabase(product);
      console.log(`✅ Saved product: ${product.name}`);
    }
  }

  private async initializeBrowser() {
    const { chromium } = await import('playwright');

    const browser = await chromium.launch({
      headless: true, // Worker'da headless çalışsın
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      locale: 'tr-TR',
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Chromium";v="123", "Not(A:Brand";v="24", "Google Chrome";v="123"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      }
    });

    const page = await context.newPage();

    // WebDriver detection'ı gizle
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      (window as any).chrome = { runtime: {} };
    });

    return { browser, page };
  }

  private async scrapeCategoryForProducts(categoryUrl: string): Promise<string[]> {
    const { browser, page } = await this.initializeBrowser();
    const productUrls: string[] = [];

    try {
      console.log(`🌐 Navigating to category: ${categoryUrl}`);
      // Anti-bot için daha uzun timeout
      try {
        await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      } catch (err) {
        console.log('⚠️ Category page load failed, trying with load event...');
        await page.goto(categoryUrl, { waitUntil: 'load', timeout: 60000 });
      }

      await this.handleInitialModals(page);
      await page.waitForTimeout(this.config.delays.pageLoad);
      await this.scrollToLoadAllProducts(page);

      const urls = await page.evaluate((selectors: string[]) => {
        const links: string[] = [];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el: any) => {
            const href = el.href || el.getAttribute('href');
            if (href && href.includes('/p0')) {
              const fullUrl = href.startsWith('http') ? href : `https://www.zara.com${href}`;
              if (!links.includes(fullUrl)) {
                links.push(fullUrl);
              }
            }
          });
          if (links.length > 0) break;
        }

        return links;
      }, this.config.selectors.productLinks);

      productUrls.push(...urls);

    } finally {
      await browser.close();
    }

    return productUrls;
  }

  private async scrapeProductDetails(productUrl: string): Promise<ZaraProduct | null> {
    const { browser, page } = await this.initializeBrowser();

    try {
      console.log(`🛍️ Scraping product: ${productUrl}`);
      // Anti-bot için daha uzun timeout
      try {
        await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      } catch (err) {
        console.log('⚠️ Product page load failed, trying with load event...');
        await page.goto(productUrl, { waitUntil: 'load', timeout: 60000 });
      }

      await this.handleInitialModals(page);
      await page.waitForTimeout(this.config.delays.pageLoad);

      const basicInfo = await this.extractBasicProductInfo(page);
      if (!basicInfo.name) {
        console.log(`❌ Could not extract product name from ${productUrl}`);
        return null;
      }

      const materialsInfo = await this.extractMaterialsAndCare(page);
      const colorVariants = await this.extractColorVariants(page);

      const product: ZaraProduct = {
        ...basicInfo,
        link: productUrl,
        ...materialsInfo,
        colorVariants
      };

      console.log(`✅ Scraped: ${product.name} with ${colorVariants.length} variants`);
      return product;

    } catch (error) {
      console.error(`❌ Error scraping ${productUrl}:`, error);
      return null;
    } finally {
      await browser.close();
    }
  }

  private async handleInitialModals(page: any) {
    try {
      await page.waitForTimeout(2000);

      // Cookie acceptance
      for (const selector of this.config.selectors.cookieAccept) {
        try {
          const button = await page.$(selector);
          if (button) {
            console.log(`🍪 Accepting cookies`);
            await button.click();
            await page.waitForTimeout(1000);
            break;
          }
        } catch (e) {}
      }

      // Handle modals
      const modalSelectors = ['.modal', '.overlay', '[data-testid="modal"]'];
      for (const selector of modalSelectors) {
        try {
          const modal = await page.$(selector);
          if (modal) {
            await page.keyboard.press('Escape');
            break;
          }
        } catch (e) {}
      }
    } catch (error) {
      console.log('⚠️ Error handling modals');
    }
  }

  private async scrollToLoadAllProducts(page: any) {
    let lastHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    while (lastHeight !== currentHeight && currentHeight < 50000) {
      lastHeight = currentHeight;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }
  }

  private async extractBasicProductInfo(page: any) {
    return await page.evaluate((selectors: any) => {
      const result: any = {};

      for (const selector of selectors.productName) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          result.name = element.textContent.trim();
          break;
        }
      }

      for (const selector of selectors.productPrice) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          result.basePrice = element.textContent.trim();
          break;
        }
      }

      for (const selector of selectors.productDescription) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          result.description = element.textContent.trim();
          break;
        }
      }

      for (const selector of selectors.productCode) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          result.productCode = element.textContent.trim();
          break;
        }
      }

      return result;
    }, this.config.selectors);
  }

  private async extractMaterialsAndCare(page: any) {
    try {
      const materialsButton = page.locator('[data-qa-action="show-extra-detail"]').first();

      if (await materialsButton.isVisible({ timeout: 3000 })) {
        await materialsButton.click();
        await page.waitForTimeout(2000);

        const modalInfo = await page.evaluate(() => {
          const result: any = {};

          const materialsSection = document.querySelector('[data-observer-key="materials"]');
          if (materialsSection) {
            const materialsTexts: string[] = [];
            const paragraphs = materialsSection.querySelectorAll('.structured-component-text-block-paragraph span span');
            paragraphs.forEach((p: any) => {
              let text = p.innerHTML?.trim();
              if (text) {
                text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim();
                if (text) materialsTexts.push(text);
              }
            });
            result.composition = materialsTexts.join('\n\n');
          }

          const careSection = document.querySelector('[data-observer-key="care"]');
          if (careSection) {
            const careTexts: string[] = [];
            const careItems = careSection.querySelectorAll('.structured-component-icon-list__item span span');
            careItems.forEach((item: any) => {
              const text = item.textContent?.trim();
              if (text) careTexts.push('• ' + text);
            });
            result.careInstructions = careTexts.join('\n');
          }

          return result;
        });

        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        return modalInfo;
      }
    } catch (error) {
      console.log('⚠️ Could not extract materials/care info');
    }

    return {};
  }

  private async extractColorVariants(page: any): Promise<ZaraColorVariant[]> {
    try {
      const colorButtons = await page.locator(this.config.selectors.colorButton);
      const colorCount = await colorButtons.count();

      if (colorCount > 0) {
        console.log(`🎨 Found ${colorCount} color options`);
        const variants: ZaraColorVariant[] = [];

        // Process first 2 colors for speed
        for (let i = 0; i < Math.min(colorCount, 2); i++) {
          const colorButton = colorButtons.nth(i);

          const colorInfo = await colorButton.evaluate((btn: any, index: number) => {
            const screenReaderSpan = btn.querySelector('.screen-reader-text');
            const colorName = screenReaderSpan ? screenReaderSpan.textContent?.trim() : `Color ${index + 1}`;

            const colorArea = btn.querySelector('.product-detail-color-item__color-area');
            const backgroundColor = colorArea ? colorArea.style.backgroundColor : '';

            return { colorName, backgroundColor };
          }, i);

          if (colorInfo.colorName) {
            const variant = await this.scrapeColorVariant(page, colorButton, colorInfo.colorName);
            if (colorInfo.backgroundColor) {
              variant.backgroundColor = colorInfo.backgroundColor;
            }
            variants.push(variant);
            await page.waitForTimeout(1000);
          }
        }

        return variants;
      } else {
        // Single color product
        const singleVariant = await this.scrapeColorVariant(page, null, 'Default');
        return [singleVariant];
      }
    } catch (error) {
      console.error('❌ Error extracting color variants:', error);
      return [{ colorName: 'Default' }];
    }
  }

  private async scrapeColorVariant(page: any, colorButton: any, colorName: string): Promise<ZaraColorVariant> {
    try {
      if (colorButton) {
        await colorButton.click({ force: true });
        await page.waitForTimeout(2000);
      }

      const variant: ZaraColorVariant = { colorName };

      // Get color info
      const colorInfo = await page.evaluate(() => {
        const colorCodeButton = document.querySelector('.product-color-extended-name__copy-action');
        const colorCode = colorCodeButton ? colorCodeButton.textContent?.trim() : null;

        const priceElement = document.querySelector('.money-amount__main');
        const price = priceElement ? priceElement.textContent?.trim() : null;

        return { colorCode, price };
      });

      if (colorInfo.colorCode) variant.colorCode = colorInfo.colorCode;
      if (colorInfo.price) variant.price = colorInfo.price;

      // Extract images
      const images = await page.evaluate(() => {
        const imageUrls: string[] = [];

        const extraImagesContainer = document.querySelector('.product-detail-view__extra-images');
        if (extraImagesContainer) {
          const pictureElements = extraImagesContainer.querySelectorAll('picture.media-image');

          pictureElements.forEach((picture) => {
            const img = picture.querySelector('img.media-image__image');
            if (img) {
              const src = img.getAttribute('src');
              if (src && src.includes('zara.net')) {
                const highQualitySrc = src.replace(/w=\d+/, 'w=2400');
                imageUrls.push(highQualitySrc);
              }
            }
          });
        }

        const uniqueImages = [...new Set(imageUrls)].filter(url =>
          url.includes('zara.net') &&
          !url.includes('transparent-background') &&
          !url.includes('.svg')
        );

        return uniqueImages.slice(0, 8);
      });

      variant.images = images;

      console.log(`✅ Color ${colorName}: ${variant.images?.length || 0} images`);
      return variant;

    } catch (error) {
      console.error(`❌ Error scraping color ${colorName}:`, error);
      return { colorName };
    }
  }

  private async saveProductToDatabase(product: ZaraProduct) {
    try {
      const priceMatch = product.basePrice.match(/[\d,]+/);
      const priceNum = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;

      // Get or create Zara brand
      let zaraBrand = await db.brand.findUnique({
        where: { slug: 'zara' }
      });

      if (!zaraBrand) {
        zaraBrand = await db.brand.create({
          data: {
            name: 'Zara',
            slug: 'zara',
            description: 'Spanish multinational retail clothing chain',
            url: 'https://www.zara.com',
            isActive: true
          }
        });
      }

      const productData = {
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: product.description || '',
        basePrice: product.basePrice,
        basePriceNum: priceNum,
        url: product.link,
        originalUrl: product.link,
        scrapedAt: new Date(),
        scrapingSource: 'zara.com',
        productCode: product.productCode,
        composition: product.composition,
        careInstructions: product.careInstructions,
        brand: { connect: { id: zaraBrand.id } },
        variants: {
          create: product.colorVariants.map(variant => ({
            colorName: variant.colorName || 'Default',
            colorCode: variant.colorCode,
            price: variant.price || product.basePrice,
            priceNum: variant.price ? parseFloat(variant.price.match(/[\d,]+/)?.[0]?.replace(',', '.') || '0') : priceNum,
            backgroundColor: variant.backgroundColor,
            images: {
              create: (variant.images || []).map((url, index) => ({
                url: url,
                order: index
              }))
            },
            sizes: {
              create: (variant.sizes || ['OS']).map(size => ({
                size: size
              }))
            }
          }))
        }
      };

      await db.product.create({
        data: productData
      });

      console.log(`💾 Saved product: ${product.name}`);

    } catch (error) {
      console.error(`❌ Error saving product:`, error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Handle process signals
const worker = new ScrapeWorker();

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  worker.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  worker.stop();
  process.exit(0);
});

// Start the worker
worker.start().catch(console.error);
