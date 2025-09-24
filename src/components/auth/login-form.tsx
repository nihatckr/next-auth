"use client"
import * as z from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { LoginSchema } from '../../schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { CardWrapper } from './card-wrapper'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { FormError } from '../form-error'
import { FormSuccess } from '../form-success'
import { loginAction } from '@/actions/login'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useNotifications } from '@/contexts/notification-context'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const { update } = useSession();
  const router = useRouter();

  const callbackUrl = searchParams.get('callbackUrl') ?? undefined;

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
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
    startTransition(() => {

      loginAction(values, callbackUrl)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);

          if (data?.success) {
            // Session'ı güncelle
            update();

            addNotification({
              type: 'success',
              title: 'Giriş Başarılı',
              message: `Tekrar hoş geldiniz! Başarıyla giriş yaptınız.`,
              action: {
                label: 'Panele Git',
                onClick: () => window.location.href = '/settings'
              }
            });

            // Başarılı login sonrası yönlendirme
            setTimeout(() => {
              router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT);
            }, 1000);
          }

          if (data?.error) {
            addNotification({
              type: 'error',
              title: 'Giriş Başarısız',
              message: data.error
            });
          }
        }

        ).catch((err) => {
          setError(err.error || 'Beklenmeyen bir hata oluştu');
          setSuccess(undefined); // Önceki başarı mesajını temizle
        })
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
                      <Input placeholder="nihatckr@gmail.com" {...field} type='email' disabled={isPending} />
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
                        <Link
                          href="/auth/reset"
                        >
                          Şifrenizi mi unuttunuz?
                        </Link>
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder="*******" {...field} type='password' disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button type="submit" className="w-full" disabled={isPending}>
                Giriş Yap
              </Button>
            </div>
          </div>
        </form>
      </Form>

    </CardWrapper >
  )
}
