"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  Eye,
  CheckCircle,

  TrendingUp,
  Package,
  Receipt,
  Star
} from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useNotifications } from '@/contexts/notification-context'

const BillingPage = () => {
  const user = useCurrentUser()
  const { addNotification } = useNotifications()
  const [selectedPlan, setSelectedPlan] = useState('free')

  // Sayfa yüklenme bildirimi
  useEffect(() => {
    addNotification({
      type: 'info',
      title: 'Faturalandırma Paneli',
      message: 'Planınızı yönetin ve faturalarınızı görüntüleyin.',
    });
  }, [addNotification]);

  // Mock data - gerçek uygulamada API'den gelecek
  const currentPlan = {
    name: 'Ücretsiz Plan',
    price: 0,
    features: ['Temel özellikler', '5 proje limiti', 'E-posta desteği'],
    status: 'active'
  }

  const plans = [
    {
      id: 'free',
      name: 'Ücretsiz',
      price: 0,
      period: 'ay',
      features: [
        'Temel özellikler',
        '5 proje limiti',
        'E-posta desteği',
        '1GB depolama'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      period: 'ay',
      features: [
        'Tüm ücretsiz özellikler',
        'Sınırsız proje',
        'Öncelikli destek',
        '10GB depolama',
        'Gelişmiş analitik'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Kurumsal',
      price: 99,
      period: 'ay',
      features: [
        'Tüm Pro özellikler',
        'Özel entegrasyon',
        '7/24 destek',
        '100GB depolama',
        'Özel raporlar',
        'API erişimi'
      ],
      popular: false
    }
  ]

  const invoices = [
    {
      id: 'INV-001',
      date: '2024-09-01',
      amount: 29,
      status: 'paid',
      plan: 'Pro Plan'
    },
    {
      id: 'INV-002',
      date: '2024-08-01',
      amount: 29,
      status: 'paid',
      plan: 'Pro Plan'
    },
    {
      id: 'INV-003',
      date: '2024-07-01',
      amount: 29,
      status: 'pending',
      plan: 'Pro Plan'
    }
  ]


  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Ödendi'
      case 'pending':
        return 'Beklemede'
      default:
        return 'İptal'
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-black dark:text-white">Faturalandırma</h1>
          <p className="text-gray-600 dark:text-gray-400">Planınızı yönetin ve faturalarınızı görüntüleyin</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Bu Ay Harcanan
              </CardTitle>
              <DollarSign className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">₺{currentPlan.price}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mevcut plan
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Proje Kullanımı
              </CardTitle>
              <Package className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">3/5</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                60% kullanım
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sonraki Ödeme
              </CardTitle>
              <Calendar className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">
                {currentPlan.price === 0 ? 'Yok' : '7'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentPlan.price === 0 ? 'Ücretsiz plan' : 'gün kaldı'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Plan Durumu
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">
                {currentPlan.status === 'active' ? 'Aktif' : 'Pasif'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentPlan.name}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Current Plan & Plans */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <CreditCard className="h-5 w-5" />
                  Mevcut Planınız
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-black dark:text-white">{currentPlan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentPlan.price === 0 ? 'Ücretsiz' : `₺${currentPlan.price}/ay`}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {currentPlan.status === 'active' ? 'Aktif' : 'Pasif'}
                      </Badge>
                      {user?.emailVerified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          E-posta Doğrulanmış
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                  >
                    Planı Değiştir
                  </Button>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-2">
                  <h4 className="font-medium text-black dark:text-white">Plan Özellikleri:</h4>
                  <ul className="space-y-1">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Star className="h-5 w-5" />
                  Planları Karşılaştır
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-lg border-2 p-6 transition-all bg-white dark:bg-black ${plan.popular
                        ? 'border-black dark:border-white shadow-md'
                        : 'border-gray-200 dark:border-gray-700'
                        } ${selectedPlan === plan.id
                          ? 'ring-2 ring-black dark:ring-white'
                          : ''
                        }`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black">
                          Popüler
                        </Badge>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-black dark:text-white">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-black dark:text-white">
                            {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${plan.popular
                          ? 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black'
                          : 'border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white'
                          }`}
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => setSelectedPlan(plan.id)}
                        disabled={plan.id === 'free'}
                      >
                        {plan.id === 'free' ? 'Mevcut Plan' : 'Upgrade'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Billing History & Quick Actions */}
          <div className="space-y-4">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Receipt className="h-5 w-5" />
                  Fatura Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  {invoices.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                      Henüz fatura geçmişi bulunmuyor
                    </p>
                  ) : (
                    invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-black dark:text-white font-medium">{invoice.id}</p>
                            <Badge
                              variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                              className={invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }
                            >
                              {getStatusText(invoice.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{invoice.plan}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-500">{invoice.date}</p>
                            <p className="text-sm font-medium text-black dark:text-white">₺{invoice.amount}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <CreditCard className="h-5 w-5" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Fatura İndir
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Ödeme Yöntemi
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Kullanım Detayları
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingPage
