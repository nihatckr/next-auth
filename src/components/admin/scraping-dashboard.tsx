"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Play, Pause, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ScrapingJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  categoryName: string
  progress: number
  totalProducts: number
  scrapedProducts: number
  createdAt: Date
  completedAt?: Date
  error?: string
}

export function ScrapingDashboard() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      // Gerçek API'den veri çek - şimdilik boş
      setJobs([])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('İşler yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Pause className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Tamamlandı</Badge>
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Çalışıyor</Badge>
      case 'failed':
        return <Badge variant="destructive">Başarısız</Badge>
      default:
        return <Badge variant="secondary">Bekliyor</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraping Dashboard</h1>
          <p className="text-muted-foreground">
            Zara API'den ürün çekme işlemlerini yönetin
          </p>
        </div>
        <Button onClick={fetchJobs} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.status)}
                  <CardTitle className="text-lg">{job.categoryName}</CardTitle>
                </div>
                {getStatusBadge(job.status)}
              </div>
              <CardDescription>
                {job.status === 'running' && 'Scraping işlemi devam ediyor...'}
                {job.status === 'completed' && `${job.scrapedProducts} ürün başarıyla çekildi`}
                {job.status === 'failed' && job.error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>İlerleme</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{job.scrapedProducts} / {job.totalProducts} ürün</span>
                  <span>{job.createdAt.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz scraping işi yok</h3>
            <p className="text-muted-foreground text-center">
              Kategoriler sayfasından ürün çekme işlemi başlatabilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
