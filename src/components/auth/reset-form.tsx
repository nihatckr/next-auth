"use client"
import * as z from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { ResetSchema } from '../../schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { CardWrapper } from './card-wrapper'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { FormError } from '../form-error'
import { FormSuccess } from '../form-success'
import { useState, useTransition } from 'react'
import { resetAction } from '@/actions/reset'


export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    startTransition(() => {

      resetAction(values)
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
      headerLabel='Forgot your password?'
      backButtonLabel='Back to Login'
      backButtonHref='/auth/login'


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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nihatckr@gmail.com" {...field} type='email' disabled={isPending} />
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
                Reset Password
              </Button>
            </div>
          </div>
        </form>
      </Form>

    </CardWrapper >
  )
}
