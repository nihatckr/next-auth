"use client"
import * as z from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { NewPasswordSchema } from '../../schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { CardWrapper } from './card-wrapper'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { FormError } from '../form-error'
import { FormSuccess } from '../form-success'
import { useState, useTransition } from 'react'

import { useSearchParams } from 'next/navigation'
import { newPasswordAction } from '@/actions/auth/new-password'


export const NewPasswordForm = () => {

  const searchParams = useSearchParams();
  const token = searchParams.get('token');


  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: '',
    },
    mode: "onChange" // Bu satırı ekledim - her değişiklikte validation yapılsın
  })

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    startTransition(() => {

      newPasswordAction(values, token)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        }

        ).catch((err) => {
          setError(err.error || 'An unexpected error occurred');
          setSuccess(undefined); // Clear any previous success
        })
    })
  }

  return (
    <CardWrapper
      headerLabel='Yeni Şifre Belirleyin'
      backButtonLabel='Giriş sayfasına dön'
      backButtonHref='/auth/login'


    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input placeholder="********" {...field} type='password' disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-3">

              <FormError message={error} />
              <FormSuccess message={success} />
              <Button type="submit" className="w-full" disabled={isPending}>
                Yeni Şifreyi Kaydet
              </Button>
            </div>
          </div>
        </form>
      </Form>

    </CardWrapper >
  )
}
