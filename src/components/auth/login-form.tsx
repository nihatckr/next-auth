"use client"
import * as z from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"

import { LoginSchema } from '../../schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { CardWrapper } from './card-wrapper'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { FormError } from '../form-error'
import { FormSuccess } from '../form-success'
import { loginAction } from '@/actions/login'
import { useNotifications } from '@/contexts/notification-context'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const { update } = useSession();
  const router = useRouter();

  const callbackUrl = searchParams.get('callbackUrl') ?? undefined;

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { addNotification } = useNotifications()


  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: "onChange" // Bu satırı ekledim - her değişiklikte validation yapılsın
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")

    startTransition(() => {
      loginAction(values, callbackUrl)
        .then((data) => {
          if (data?.error) {
            form.reset()
            setError(data.error)
            addNotification({
              type: 'error',
              title: 'Giriş Başarısız',
              message: data.error
            });
          }

          if (data?.success) {
            setSuccess(data.success)
            update(); // Session'ı güncelle

            addNotification({
              type: 'success',
              title: 'Giriş Başarılı',
              message: `Tekrar hoş geldiniz! Başarıyla giriş yaptınız.`,
              action: {
                label: 'Panele Git',
                onClick: () => window.location.href = '/profile'
              }
            });

            // Başarılı login sonrası yönlendirme
            setTimeout(() => {
              router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT);
            }, 1000);
          }
        })
        .catch(() => setError("Beklenmeyen bir hata oluştu!"))
    })
  }

  return (
    <CardWrapper
      headerLabel='Hesabınıza giriş yapın'
      backButtonLabel='Kayıt ol'
      backButtonHref='/auth/register'
      showSocial
      descLabel='Hesabınız yok mu?'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="ornek@email.com"
                          type="email"
                          className="pl-10"
                          autoComplete="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Şifre</FormLabel>
                      <Button
                        variant={'link'}
                        asChild
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline px-0"
                      >
                        <Link href="/auth/reset">
                          Şifrenizi mi unuttunuz?
                        </Link>
                      </Button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isPending}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

    </CardWrapper >
  )
}
