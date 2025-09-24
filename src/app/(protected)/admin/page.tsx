"use client"

import { RoleGate } from "@/components/auth/role-gate";
import { UserRole } from "@/lib/generated/prisma";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { adminAction } from "@/actions/admin";
import { useNotifications } from "@/contexts/notification-context";
import { useEffect } from "react";
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
  return (<div className="flex flex-col min-h-screen">

    <Card className="max-w-7xl mx-auto mb-8">
      <CardContent>
        <RoleGate allowedRole={UserRole.ADMIN} >
          <FormSuccess message="Bu admin sayfasına erişim izniniz var." />
        </RoleGate>
      </CardContent>
    </Card>

    <div className="max-w-7xl mx-auto mb-8 px-4">
      <p className="text-lg font-semibold">Sadece Admin API Rotası</p>
      <Button onClick={onApiRouteClick} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Test Et</Button>
    </div>
    <div className="max-w-7xl mx-auto mb-8 px-4">
      <p className="text-lg font-semibold">Sadece Admin Server Action</p>
      <Button onClick={onServerActionClick} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Test Et</Button>
    </div>

  </div>
  )
}

export default AdminPage
