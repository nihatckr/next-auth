"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Activity, Settings, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
}

const StatsCard = ({ title, value, description, icon, trend }: StatsCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend && (
        <div className="flex items-center pt-2">
          {trend.value > 0 ? (
            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
          )}
          <span className={`text-xs font-medium ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">{trend.label}</span>
        </div>
      )}
    </CardContent>
  </Card>
)

export const ResponsiveStats = () => {
  const stats = [
    {
      title: "Toplam Kullanıcı",
      value: "2,847",
      description: "Kayıtlı kullanıcı sayısı",
      icon: <Users className="h-4 w-4 text-blue-600" />,
      trend: { value: 12, label: "geçen aydan" }
    },
    {
      title: "Aktif Oturumlar",
      value: "1,423",
      description: "Şu anda aktif",
      icon: <Activity className="h-4 w-4 text-green-600" />,
      trend: { value: 8, label: "geçen haftadan" }
    },
    {
      title: "Güvenlik Skoru",
      value: "96%",
      description: "Sistem güvenlik durumu",
      icon: <Shield className="h-4 w-4 text-emerald-600" />
    },
    {
      title: "Sistem Durumu",
      value: "Çevrimiçi",
      description: "Tüm sistemler çalışıyor",
      icon: <Settings className="h-4 w-4 text-purple-600" />
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}
