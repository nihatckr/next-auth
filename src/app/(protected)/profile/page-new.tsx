"use client"

import React, { useState, useTransition, useEffect } from 'react'
import { UserInfo } from '@/components/user-info';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Calendar, Shield, Mail } from 'lucide-react';
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
import { settingAction } from '@/actions/settings';
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
    const changedValues: any = {};

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
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Kullanıcı bilgisi yüklenemedi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto space-y-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Hoş geldin, {user?.name?.split(' ')[0] || 'Kullanıcı'}! 👋
                  </h1>
                  <p className="text-lg text-muted-foreground">Hesap bilgilerinizi yönetin ve profilinizi güncelleyin</p>
                </div>
              </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
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
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <UserInfo user={user} label="Kullanıcı Bilgileri" />
            </div>

            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    Hesap Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">E-posta</span>
                    <Badge variant={user.emailVerified ? "default" : "destructive"} className="text-xs">
                      {user.emailVerified ? "✅ Doğrulanmış" : "❌ Doğrulanmamış"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Güvenlik</span>
                    <Badge variant={user.isTwoFactorEnabled ? "default" : "secondary"} className="text-xs">
                      {user.isTwoFactorEnabled ? "🔒 2FA Aktif" : "🔓 2FA Pasif"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rol</span>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                      {user.role === "ADMIN" ? "🛡️ Admin" : "👤 Kullanıcı"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-3">E-posta Durumu</h3>
                <Badge
                  variant={user.emailVerified ? "default" : "destructive"}
                  className="text-sm px-4 py-1"
                >
                  {user.emailVerified ? "✅ Doğrulanmış" : "❌ Doğrulanmamış"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-3">Güvenlik</h3>
                <Badge
                  variant={user.isTwoFactorEnabled ? "default" : "secondary"}
                  className="text-sm px-4 py-1"
                >
                  {user.isTwoFactorEnabled ? "🔒 2FA Aktif" : "🔓 2FA Pasif"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-3">Üyelik Tarihi</h3>
                <p className="text-base font-medium text-muted-foreground">
                  {user.emailVerified
                    ? new Date(user.emailVerified).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    : 'Tarih bilinmiyor'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">👁️</span>
                      </div>
                      <span className="font-medium">Profil görüntülendi</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Şimdi</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs">🔑</span>
                      </div>
                      <span className="font-medium">Hesaba giriş yapıldı</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Bugün</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs">⚙️</span>
                      </div>
                      <span className="font-medium">Profil güncellendi</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">2 gün önce</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Settings className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="font-medium">Profili Düzenle</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <Shield className="w-5 h-5 mr-3 text-green-600" />
                  <span className="font-medium">Güvenlik Ayarları</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-3 text-purple-600" />
                  <span className="font-medium">E-posta Tercihleri</span>
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
