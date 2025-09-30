"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"

interface ZaraApiConfigExampleProps {
  onCopyConfig?: (config: string) => void
}

export function ZaraApiConfigExample({ onCopyConfig }: ZaraApiConfigExampleProps) {
  const zaraConfig = {
    endpoints: {
      productDetails: "/products-details?productIds={productId}&ajax=true",
      productExtra: "/product/{productId}/extra-detail?ajax=true",
      categories: "/categories",
      products: "/products",
      categoryProducts: "/category/{categoryId}/products?ajax=true"
    },
    baseUrls: {
      main: "https://www.zara.com/tr/tr",
      api: "https://api.zara.com"
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Referer": "https://www.zara.com/tr/tr/",
      "Origin": "https://www.zara.com",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin"
    }
  }

  const configString = JSON.stringify(zaraConfig, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(configString)
    onCopyConfig?.(configString)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Zara API Konfigürasyon Örneği
        </CardTitle>
        <CardDescription>
          Zara için özel API endpoint'leri ve konfigürasyonu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Zara Endpoint'leri:</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
              Kopyala
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">productDetails</Badge>
            <Badge variant="secondary">productExtra</Badge>
            <Badge variant="secondary">categories</Badge>
            <Badge variant="secondary">products</Badge>
            <Badge variant="secondary">categoryProducts</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Zara Özel Kullanım:</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• <code>productDetails</code>: Ürün detayları için (örn: 452697181)</div>
            <div>• <code>productExtra</code>: Ek ürün bilgileri için (örn: 461890050)</div>
            <div>• <code>categories</code>: Kategori listesi için</div>
            <div>• <code>products</code>: Ürün listesi için</div>
            <div>• <code>categoryProducts</code>: Kategori ürünleri için</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Zara Parametreleri:</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• <code>{'{productId}'}</code>: Ürün ID'si ile değiştirilir (örn: 452697181)</div>
            <div>• <code>{'{categoryId}'}</code>: Kategori ID'si ile değiştirilir</div>
            <div>• <code>ajax=true</code>: AJAX istekleri için gerekli</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Zara Örnek URL'ler:</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• Ürün Detayları: <code>https://www.zara.com/tr/tr/products-details?productIds=452697181&ajax=true</code></div>
            <div>• Ek Ürün Bilgileri: <code>https://www.zara.com/tr/tr/product/461890050/extra-detail?ajax=true</code></div>
            <div>• Kategori Ürünleri: <code>https://www.zara.com/tr/tr/category/2458839/products?ajax=true</code></div>
          </div>
        </div>

        <div className="rounded-md bg-muted p-3">
          <pre className="text-xs overflow-x-auto">
            <code>{configString}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
