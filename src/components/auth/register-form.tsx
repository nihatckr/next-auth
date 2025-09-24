"use client"
import * as z from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { RegisterSchema } from '../../schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { CardWrapper } from './card-wrapper'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { FormError } from '../form-error'
import { FormSuccess } from '../form-success'
import { useState, useTransition } from 'react'
import { registerAction } from '@/actions/register'

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''

    },
    mode: "onChange" // Bu satırı ekledim - her değişiklikte validation yapılsın
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {

      registerAction(values)
        .then((data: { error?: string; success?: string }) => {
          setError(data.error);
          setSuccess(data.success);
        }

        ).catch((err: { error?: string }) => {
          setError(err.error || 'Beklenmeyen bir hata oluştu');
          setSuccess(""); // Önceki başarı mesajını temizle
        })
    })
  }

  return (
    <CardWrapper
      headerLabel="Hesabınızı oluşturun"
      backButtonLabel='Zaten hesabınız var mı?'
      backButtonHref='/auth/login'
      descLabel='Zaten hesabınız var mı?'
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İsim</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmet Yılmaz" {...field} type='name' disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <FormLabel>Şifre</FormLabel>
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
                  Hesap Oluştur
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>

    </CardWrapper >
  )
}
