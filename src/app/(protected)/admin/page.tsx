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

  // Page load notification
  useEffect(() => {
    addNotification({
      type: 'info',
      title: 'Admin Panel Accessed',
      message: 'You have successfully accessed the admin panel with full privileges.',
      action: {
        label: 'View Settings',
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
            title: 'Server Action Failed',
            message: data.error
          });
        }
        if (data.success) {
          toast.success(data.success);
          addNotification({
            type: 'success',
            title: 'Server Action Success',
            message: data.success
          });
        }
      });
  }

  const onApiRouteClick = async () => {
    fetch("/api/admin")
      .then((response) => {
        if (response.ok) {
          toast.success("Success! You have access to this admin api route.");
          addNotification({
            type: 'success',
            title: 'API Access Granted',
            message: 'You have successfully accessed the admin API route.',
          });
        } else {
          toast.error("FORBIDDEN");
          addNotification({
            type: 'error',
            title: 'API Access Denied',
            message: 'You do not have permission to access this API route.',
          });
        }
      });
  }
  return (<div className="flex flex-col min-h-screen">

    <Card className="max-w-7xl mx-auto mb-8">
      <CardContent>
        <RoleGate allowedRole={UserRole.ADMIN} >
          <FormSuccess message="You have access to this admin page." />
        </RoleGate>
      </CardContent>
    </Card>

    <div className="max-w-7xl mx-auto mb-8 px-4">
      <p className="text-lg font-semibold">Admin only Api Route</p>
      <Button onClick={onApiRouteClick} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">CLick Test</Button>
    </div>
    <div className="max-w-7xl mx-auto mb-8 px-4">
      <p className="text-lg font-semibold">Admin only Server Action</p>
      <Button onClick={onServerActionClick} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">CLick Test</Button>
    </div>

  </div>
  )
}

export default AdminPage
