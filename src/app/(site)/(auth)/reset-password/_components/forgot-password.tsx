'use client';

import { InputGroup } from '../../../../../components/ui/inputs';
import { authValidation } from '../../../../../lib/zod/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type Inputs = z.infer<typeof authValidation.forgotPasswordForm>;

type PropsType = {
  invalidToken: boolean;
};

export default function ForgotPasswordForm({ invalidToken }: PropsType) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Inputs>({
    resolver: zodResolver(authValidation.forgotPasswordForm),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: Inputs) {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      toast.success(
        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      );

      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (invalidToken) {
      toast.error('Invalid or expired reset link. Please request a new one.');
    }
  }, [invalidToken]);

  return (
    <>
      <div className="text-center mb-8">
        <h3 className="text-gray-800 font-bold text-3xl mb-2 dark:text-white/90">
          Forgot Your Password?
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Enter the email address linked to your account, and we’ll send you a
          link to reset your password.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Email"
                type="email"
                placeholder="Enter your email address"
                required
                error={fieldState.error?.message}
                disabled={isLoading}
                {...field}
              />
            )}
          />

          <button
            className="bg-primary-500 hover:bg-primary-600 transition py-3 px-6 w-full font-medium text-white text-sm rounded-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>

      <p className="text-gray-700 dark:text-gray-400 font-normal text-sm mt-5">
        Remembered password?{' '}
        <Link href="/signin" className="text-sm font-semibold text-primary-500">
          Sign In
        </Link>
      </p>
    </>
  );
}
