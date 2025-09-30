import { useState, useTransition } from 'react'

interface FormHandlerOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  resetForm?: () => void
}

export function useFormHandler<T>(
  action: (values: T) => Promise<{ error?: string; success?: string }>,
  options: FormHandlerOptions = {}
) {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (values: T) => {
    setError("")
    setSuccess("")

    startTransition(() => {
      action(values)
        .then((result) => {
          if (result.error) {
            setError(result.error)
            options.onError?.(result.error)
          }
          if (result.success) {
            setSuccess(result.success)
            if (options.resetForm) {
              options.resetForm()
            }
            setTimeout(() => {
              options.onSuccess?.()
            }, 500)
          }
        })
        .catch((err: any) => {
          const errorMessage = err.error || 'Beklenmeyen bir hata oluştu'
          setError(errorMessage)
          options.onError?.(errorMessage)
        })
    })
  }

  return {
    error,
    success,
    isPending,
    handleSubmit,
    setError,
    setSuccess
  }
}
