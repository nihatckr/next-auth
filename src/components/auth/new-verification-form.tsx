"use client"
import { useCallback, useEffect, useState } from 'react';
import { CardWrapper } from './card-wrapper'
import { BeatLoader } from "react-spinners";

import { newVerificationAction } from '@/actions/new-verification';

import { useSearchParams } from 'next/navigation';
import { FormError } from '../form-error';
import { FormSuccess } from '../form-success';

const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const onSubmit = useCallback(() => {

    if (success || error) return; // Eğer zaten bir sonuç varsa, tekrar işlem yapma

    if (!token) {
      setError('Token eksik');
      return;
    }

    newVerificationAction(token)
      .then((data: { success?: string; error?: string }) => {
        setSuccess(data?.success);
        setError(data?.error);
      }).catch(() => {
        setError('Bir şeyler ters gitti. Lütfen tekrar deneyin.');
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div>
      <CardWrapper
        headerLabel='E-posta Doğrulaması'
        backButtonLabel='Giriş sayfasına dön'
        backButtonHref='/auth/login'
        descLabel=' '
      >
        <div className="flex items-center w-full justify-center text-center">
          {!success && !error && (
            <BeatLoader />
          )}
          <FormSuccess message={success} />
          {!success && (

            <FormError message={error} />
          )}

        </div>

      </CardWrapper>
    </div>
  )
}

export default NewVerificationForm
