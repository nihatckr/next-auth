"use client"

import React, { useState, useTransition, useEffect } from 'react'
import { UserInfo } from '@/components/user-info';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Mail, User, Activity, Clock, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Form, FormField, FormControl, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSuccess } from '@/components/form-success';
import { FormError } from '@/components/form-error';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SettingsSchema } from '@/schemas';
import { settingAction } from '@/actions/auth/settings';
import { useSession } from 'next-auth/react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useNotifications } from '@/contexts/notification-context';
import { UserRole } from '@/lib/generated/prisma';

const ProfilePage = () => {
  const user = useCurrentUser();
  const { update } = useSession();
  const { addNotification } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sayfa yüklenme bildirimi
  useEffect(() => {
    addNotification({
      type: 'info',
      title: 'Profil Paneli',
      message: 'Hesap bilgilerinizi yönetin ve profilinizi güncelleyin.',
    });
  }, [addNotification]);

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      newPassword: "",
      role: UserRole.USER,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        password: "",
        newPassword: "",
        role: user.role || UserRole.USER,
      });
    }
  }, [user, form]);

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    const changedValues: Record<string, unknown> = {};

    if (values.name && values.name.trim() !== "" && values.name !== user?.name) {
      changedValues.name = values.name;
    }

    if (values.email && values.email.trim() !== "" && values.email !== user?.email) {
      changedValues.email = values.email;
    }

    if (values.role && values.role !== user?.role) {
      changedValues.role = values.role;
    }

    const hasPasswordChange = values.password && values.password.trim() !== "" &&
      values.newPassword && values.newPassword.trim() !== "";

    if (hasPasswordChange) {
      changedValues.password = values.password;
      changedValues.newPassword = values.newPassword;
    }

    if (Object.keys(changedValues).length === 0) {
      setError("Değişiklik tespit edilmedi. Lütfen en az bir alanı değiştirin.");
      setSuccess(null);
      return;
    }

    startTransition(() => {
      settingAction(changedValues)
        .then((data) => {
          if (data.error) {
            setError(data.error);
            setSuccess(null);
          }
          if (data.success) {
            setSuccess(data.success);
            setError(null);

            const updatedFields = Object.keys(changedValues);
            let notificationMessage = "Profiliniz başarıyla güncellendi";

            if (updatedFields.includes('name')) {
              notificationMessage = `Profil adı "${changedValues.name}" olarak güncellendi`;
            } else if (updatedFields.includes('password')) {
              notificationMessage = "Şifre başarıyla güncellendi";
            } else if (updatedFields.includes('role')) {
              notificationMessage = `Rol ${changedValues.role} olarak güncellendi`;
            }

            addNotification({
              type: 'success',
              title: 'Profil Güncellendi',
              message: notificationMessage,
            });

            update({
              user: {
                name: changedValues.name || user?.name,
                email: changedValues.email || user?.email,
                role: changedValues.role || user?.role
              }
            });

            form.setValue("password", "");
            form.setValue("newPassword", "");
            setIsModalOpen(false);
          }
        })
        .catch(() => {
          setError("Beklenmeyen bir hata oluştu.");
          setSuccess(null);
        });
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Kullanıcı bilgisi yüklenemedi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black dark:bg-white border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-xl">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  Profil Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Hoş geldin, {user?.name?.split(' ')[0] || 'Kullanıcı'}! Hesap bilgilerinizi yönetin</p>
              </div>
            </div>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black border border-gray-300 dark:border-gray-600 transition-colors duration-200">
                <Settings className="w-5 h-5 mr-2" />
                Ayarları Düzenle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Profil Ayarları</DialogTitle>
                <DialogDescription>
                  Hesap bilgilerinizi düzenleyin ve şifrenizi değiştirin.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">İsim</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={user?.name || "İsminiz"}
                              {...field}
                              disabled={isPending}
                              type='text'
                              className="h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Mevcut ismi korumak için boş bırakın: {user?.name}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">E-posta</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={user?.email || "E-posta Adresiniz"}
                              {...field}
                              disabled={isPending}
                              type='email'
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Mevcut Şifre</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Mevcut şifrenizi girin"
                              {...field}
                              disabled={isPending}
                              type='password'
                              className="h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Sadece şifrenizi değiştirmek istiyorsanız doldurun
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Yeni Şifre</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Yeni şifrenizi girin"
                              {...field}
                              disabled={isPending}
                              type='password'
                              className="h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            En az 6 karakter olmalı
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Rol</FormLabel>
                        <Select disabled={isPending} onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Bir rol seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.USER}>👤 Kullanıcı</SelectItem>
                            <SelectItem value={UserRole.ADMIN}>🛡️ Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && <FormError message={error} />}
                  {success && <FormSuccess message={success} />}

                  <DialogFooter className="gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isPending}
                      size="lg"
                    >
                      İptal
                    </Button>
                    <Button
                      type='submit'
                      disabled={isPending}
                      size="lg"
                      className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {isPending ? "Güncelleniyor..." : "Ayarları Güncelle"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hesap Durumu
              </CardTitle>
              <User className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">Aktif</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.role === "ADMIN" ? "Admin" : "Kullanıcı"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                E-posta Durumu
              </CardTitle>
              <Mail className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">
                {user.emailVerified ? "✅" : "❌"}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.emailVerified ? "Doğrulanmış" : "Doğrulanmamış"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Güvenlik
              </CardTitle>
              <Shield className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">
                {user.isTwoFactorEnabled ? "🔒" : "🔓"}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.isTwoFactorEnabled ? "2FA Aktif" : "2FA Pasif"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Son Giriş
              </CardTitle>
              <Clock className="h-4 w-4 text-black dark:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">Şimdi</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Aktif oturum
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <User className="h-5 w-5" />
                  Kullanıcı Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserInfo user={user} label="" />
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Shield className="h-5 w-5" />
                  Hesap Güvenliği
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black dark:text-white">E-posta Doğrulama</span>
                    <Badge
                      variant="default"
                      className={user.emailVerified
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }
                    >
                      {user.emailVerified ? "✅ Doğrulanmış" : "❌ Doğrulanmamış"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black dark:text-white">İki Faktörlü Kimlik Doğrulama</span>
                    <Badge
                      variant={user.isTwoFactorEnabled ? "default" : "secondary"}
                      className={user.isTwoFactorEnabled
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }
                    >
                      {user.isTwoFactorEnabled ? "🔒 Aktif" : "🔓 Pasif"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black dark:text-white">Hesap Rolü</span>
                    <Badge
                      variant="default"
                      className={user.role === "ADMIN"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }
                    >
                      {user.role === "ADMIN" ? "🛡️ Admin" : "👤 Kullanıcı"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activities & Quick Actions */}
          <div className="space-y-4">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Activity className="h-5 w-5" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-black dark:text-white font-medium">Profil görüntülendi</p>
                      <p className="text-gray-600 dark:text-gray-400">Dashboard sayfası</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Şimdi</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-black dark:text-white font-medium">Hesaba giriş yapıldı</p>
                      <p className="text-gray-600 dark:text-gray-400">Başarılı oturum</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Bugün</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-black dark:text-white font-medium">E-posta doğrulandı</p>
                      <p className="text-gray-600 dark:text-gray-400">Güvenlik güncellemesi</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">2 gün önce</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <FileText className="h-5 w-5" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Profili Düzenle
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Güvenlik Ayarları
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  E-posta Tercihleri
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage
