"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"

interface ApiConfigExampleProps {
  brandName?: string
  onCopyConfig?: (config: string) => void
}

export function ApiConfigExample({ brandName = "Zara", onCopyConfig }: ApiConfigExampleProps) {
  const exampleConfig = {
    endpoints: {
      productDetails: "/products-details?productIds={productId}&ajax=true",
      productExtra: "/product/{productId}/extra-detail?ajax=true",
      categories: "/categories",
      products: "/products"
    },
    baseUrls: {
      main: "https://www.zara.com/tr/tr",
      api: "https://api.zara.com"
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
      "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8"
    }
  }

  const configString = JSON.stringify(exampleConfig, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(configString)
    onCopyConfig?.(configString)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          {brandName} API Konfigürasyon Örneği
        </CardTitle>
        <CardDescription>
          Birden fazla API endpoint'ini yönetmek için örnek konfigürasyon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Kullanılabilir Endpoint'ler:</h4>
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
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Örnek Kullanım:</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• <code>productDetails</code>: Ürün detayları için</div>
            <div>• <code>productExtra</code>: Ek ürün bilgileri için</div>
            <div>• <code>categories</code>: Kategori listesi için</div>
            <div>• <code>products</code>: Ürün listesi için</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Parametreler:</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• <code>{'{productId}'}</code>: Ürün ID'si ile değiştirilir</div>
            <div>• <code>{'{categoryId}'}</code>: Kategori ID'si ile değiştirilir</div>
            <div>• <code>{'{brandId}'}</code>: Marka ID'si ile değiştirilir</div>
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
