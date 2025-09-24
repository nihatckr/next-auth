"use client"
import { Button } from '@/components/ui/button'
import { settingAction } from '@/actions/settings'
import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Settings, Edit3 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '@/contexts/notification-context'

import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { SettingsSchema } from '@/schemas'

import { Form, FormField, FormControl, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCurrentUser } from '@/hooks/use-current-user'
import { FormSuccess } from '@/components/form-success'
import { FormError } from '@/components/form-error'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { UserRole } from '@/lib/generated/prisma'
const SettingsPage = () => {
  const user = useCurrentUser()
  const { update } = useSession()
  const { addNotification } = useNotifications()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  console.log("Current User in Settings Page:", user);

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    mode: "onSubmit", // Sadece submit sırasında validate et
    reValidateMode: "onSubmit", // Re-validation da sadece submit sırasında
    defaultValues: {
      name: "",
      email: "",
      password: "",
      newPassword: "",
      role: UserRole.USER,
    },
  })

  // User değiştiğinde form'u güncelle
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        password: "",
        newPassword: "",
        role: user.role || UserRole.USER,
      })
    }
  }, [user, form])

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    console.log("🔍 Form submitted with values:", values);

    // Sadece değişen alanları belirle
    const changedValues: any = {}

    // İsim değişti mi?
    if (values.name && values.name.trim() !== "" && values.name !== user?.name) {
      changedValues.name = values.name
    }

    // Email değişti mi? (şimdilik email değişikliği devre dışı)
    if (values.email && values.email.trim() !== "" && values.email !== user?.email) {
      changedValues.email = values.email
    }

    // Role değişti mi?
    if (values.role && values.role !== user?.role) {
      changedValues.role = values.role
    }

    // Şifre değiştiriliyor mu? - Her iki alan da dolu olmalı
    const hasPasswordChange = values.password && values.password.trim() !== "" &&
      values.newPassword && values.newPassword.trim() !== ""

    if (hasPasswordChange) {
      changedValues.password = values.password
      changedValues.newPassword = values.newPassword
    }

    console.log("🔄 Only changed values:", changedValues);

    // Eğer hiç değişiklik yoksa
    if (Object.keys(changedValues).length === 0) {
      setError("No changes detected. Please modify at least one field.")
      setSuccess(null)
      return
    }

    startTransition(() => {
      settingAction(changedValues)
        .then((data) => {
          console.log("📝 Server response:", data);
          if (data.error) {
            setError(data.error)
            setSuccess(null)
          }
          if (data.success) {
            setSuccess(data.success)
            setError(null)

            // Bildirim ekle
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
              action: {
                label: 'Profili Görüntüle',
                onClick: () => window.location.href = '/settings'
              }
            });

            // Session'ı güncelle (sadece değişen alanlarla)
            update({
              user: {
                name: changedValues.name || user?.name,
                email: changedValues.email || user?.email,
                role: changedValues.role || user?.role
              }
            })            // Şifre alanlarını temizle
            form.setValue("password", "");
            form.setValue("newPassword", "");
          }
        })
        .catch((err) => {
          console.error("❌ Error:", err);
          setError("An unexpected error occurred.")
          setSuccess(null)
        })
    })
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-light">Settings</h1>
          <Button
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Section */}
        <Card className="mb-8 border border-gray-200 shadow-none">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20 border-2 border-gray-200">
                <AvatarImage src={user?.image || "https://ui.shadcn.com/avatars/01.png"} alt={user?.name || "User"} />
                <AvatarFallback className="bg-gray-100 text-black font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-light mb-1">{user?.name || "Anonymous User"}</h2>
                <p className="text-gray-600 mb-2">{user?.email || "No email"}</p>
                <Badge variant="outline" className="border-black text-black font-normal">
                  {user?.role || "USER"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200 shadow-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-light mb-2">128</div>
              <p className="text-gray-600 text-sm">Projects</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-light mb-2">8.5k</div>
              <p className="text-gray-600 text-sm">Connections</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-light mb-2">99%</div>
              <p className="text-gray-600 text-sm">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Details */}
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-light flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={user?.name || "Your Name"}
                            {...field}
                            disabled={isPending}
                            type='text'
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          Mevcut ismi korumak için boş bırakın: {user?.name}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={user?.email || "E-posta Adresiniz"}
                            {...field}
                            disabled={isPending}
                            type='email'
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mevcut Şifre</FormLabel>
                        <FormControl>
                          <Input placeholder="Mevcut şifrenizi girin" {...field} disabled={isPending} type='password' />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          Sadece şifrenizi değiştirmek istiyorsanız doldurun
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yeni Şifre</FormLabel>
                        <FormControl>
                          <Input placeholder="Yeni şifrenizi girin" {...field} disabled={isPending} type='password' />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          En az 6 karakter olmalı
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select disabled={isPending} onValueChange={field.onChange} value={field.value} >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Bir rol seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.USER}>Kullanıcı</SelectItem>
                            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    type='submit'
                    disabled={isPending}
                    className="bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isPending ? "Güncelleniyor..." : "Ayarları Güncelle"}
                  </Button>
                </div>
              </form>
            </Form>
            {error && <FormError message={error} />}
            {success && <FormSuccess message={success} />}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default SettingsPage
