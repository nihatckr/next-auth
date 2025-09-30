"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
import {
  Bot,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Calendar,
  Package
} from "lucide-react"
import { getScrapeJobs } from "@/actions/scraping/scrape-jobs"



interface ScrapingJob {
  id: string
  url: string
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  createdAt: Date
  updatedAt: Date
}

export function ScrapingJobsList() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [loading, setLoading] = useState(true)

  const loadJobs = async () => {
    try {
      const result = await getScrapeJobs()
      setJobs(result as any)
    } catch (error) {
      console.error('Failed to load scraping jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()

    // Auto-refresh every 10 seconds
    const interval = setInterval(loadJobs, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'DONE':
        return <CheckCircle2 className="h-4 w-4" />
      case 'FAILED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300',
      DONE: 'bg-green-100 text-green-800 border-green-300',
      FAILED: 'bg-red-100 text-red-800 border-red-300'
    } as const

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    )
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('tr-TR')
  }

  const getDuration = (startedAt: Date | null, completedAt: Date | null) => {
    if (!startedAt) return null
    const end = completedAt || new Date()
    const start = new Date(startedAt)
    const diffMs = end.getTime() - start.getTime()
    const diffSecs = Math.round(diffMs / 1000)

    if (diffSecs < 60) return `${diffSecs}s`
    const diffMins = Math.round(diffSecs / 60)
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.round(diffMins / 60)
    return `${diffHours}h`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Scraping İşleri</h2>
            <p className="text-muted-foreground">
              Aktif ve geçmiş scraping işlerini takip edin
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-2 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scraping İşleri</h2>
          <p className="text-muted-foreground">
            Aktif ve geçmiş scraping işlerini takip edin
          </p>
        </div>

        <Button onClick={loadJobs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Henüz scraping işi yok</h3>
            <p className="text-muted-foreground">
              Kategori yönetiminden scraping başlatabilirsiniz
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Job #{job.id.slice(0, 8)}
                  </CardTitle>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">URL</div>
                  <div className="text-sm font-mono bg-muted p-2 rounded truncate">
                    {job.url}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Oluşturuldu: {formatDate(job.createdAt)}
                    </div>

                    {job.updatedAt !== job.createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Güncellendi: {formatDate(job.updatedAt)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
