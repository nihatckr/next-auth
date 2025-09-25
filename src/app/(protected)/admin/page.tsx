"use client"

import { RoleGate } from "@/components/auth/role-gate";
import { UserRole } from "@/lib/generated/prisma";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { adminAction } from "@/actions/admin";
import { useNotifications } from "@/contexts/notification-context";
import { useEffect } from "react";
import {
  Users,
  Shield,
  Activity,
  Settings,
  Database,
  FileText,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const AdminPage = () => {
  const { addNotification } = useNotifications();

  // Sayfa yüklenme bildirimi
  useEffect(() => {
    addNotification({
      type: 'info',
      title: 'Admin Paneline Erişildi',
      message: 'Admin paneline tam yetkilerle başarıyla eriştiğiniz.',
      action: {
        label: 'Ayarları Görüntüle',
        onClick: () => window.location.href = '/settings'
      }
    });
  }, [addNotification]);

  const onServerActionClick = async () => {
    adminAction()
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          addNotification({
            type: 'error',
            title: 'Server İşlemi Başarısız',
            message: data.error
          });
        }
        if (data.success) {
          toast.success(data.success);
          addNotification({
            type: 'success',
            title: 'Server İşlemi Başarılı',
            message: data.success
          });
        }
      });
  }

  const onApiRouteClick = async () => {
    fetch("/api/admin")
      .then((response) => {
        if (response.ok) {
          toast.success("Başarılı! Bu admin API rotasına erişiminiz var.");
          addNotification({
            type: 'success',
            title: 'API Erişimi Onaylandı',
            message: 'Admin API rotasına başarıyla eriştiğiniz.',
          });
        } else {
          toast.error("YASAK");
          addNotification({
            type: 'error',
            title: 'API Erişimi Reddedildi',
            message: 'Bu API rotasına erişim izniniz bulunmuyor.',
          });
        }
      });
  }
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-black dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Sistem yönetimi ve kontrol paneli</p>
        </div>

        {/* Admin Access Check */}
        <RoleGate allowedRole={UserRole.ADMIN}>
          <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardContent className="p-4">
              <FormSuccess message="Admin paneline erişim onaylandı" />
            </CardContent>
          </Card>
        </RoleGate>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Toplam Kullanıcı
              </CardTitle>
              <Users className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">1,234</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +12% geçen aydan
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Aktif Oturumlar
              </CardTitle>
              <Activity className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">89</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +7% bu hafta
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Güvenlik Uyarıları
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">3</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                -2 düzeltildi
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sistem Durumu
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">99.9%</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Çalışma süresi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Admin Actions */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Settings className="h-5 w-5" />
                  Admin İşlemleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">API Rotası Testi</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Admin API'sine erişimi test edin</p>
                  <Button
                    onClick={onApiRouteClick}
                    className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
                  >
                    API Rotasını Test Et
                  </Button>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">Server Action Testi</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Server-side admin işlemini test edin</p>
                  <Button
                    onClick={onServerActionClick}
                    variant="outline"
                    className="w-full border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                  >
                    Server Action Test Et
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Database className="h-5 w-5" />
                  Sistem Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black dark:text-white">Database</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Çevrimiçi
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black dark:text-white">Redis Cache</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Çevrimiçi
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black dark:text-white">Email Service</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Bakımda
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black dark:text-white">API Gateway</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Çevrimiçi
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activities */}
          <div className="space-y-4">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <FileText className="h-5 w-5" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-black dark:text-white font-medium">Yeni kullanıcı kaydı</p>
                      <p className="text-gray-600 dark:text-gray-400">john.doe@email.com</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">2 dakika önce</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-black dark:text-white font-medium">Güvenlik güncellemesi</p>
                      <p className="text-gray-600 dark:text-gray-400">2FA etkinleştirildi</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">15 dakika önce</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-black dark:text-white font-medium">Database backup</p>
                      <p className="text-gray-600 dark:text-gray-400">Otomatik yedekleme tamamlandı</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">1 saat önce</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-black dark:text-white font-medium">Sistem güncellemesi</p>
                      <p className="text-gray-600 dark:text-gray-400">v2.1.0 dağıtıldı</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">3 saat önce</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Shield className="h-5 w-5" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Kullanıcı Yönetimi
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Database Yönetimi
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Sistem Ayarları
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
