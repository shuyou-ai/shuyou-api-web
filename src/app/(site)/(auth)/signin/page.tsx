'use client';

import Link from 'next/link';
import { Checkbox } from '../../../../components/ui/inputs/checkbox';
import {
  SignInWithGithub,
  SignInWithGoogle,
} from '../_components/social-auth';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';

export default function SignInPage() {
  const [agreed, setAgreed] = useState(false);

  const beforeAuth = () => {
    if (agreed) return true;
    toast.error('Please agree to the Terms and Privacy Policy first.');
    return false;
  };

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="wrapper">
        <div className="relative max-w-[450px] mx-auto">
          <div className="relative z-30 rounded-2xl border border-gray-100 bg-white p-8 shadow-theme-xs dark:border-gray-800 dark:bg-dark-primary sm:p-10">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white/90">
                Sign in to your account
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Continue with one of the providers below.
              </p>
            </div>

            <Suspense fallback={<div className="h-[180px]" />}>
              <div className="grid gap-3">
                <SignInWithGoogle beforeClick={beforeAuth} />
                <SignInWithGithub beforeClick={beforeAuth} />
              </div>
            </Suspense>

            <label className="mt-5 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Checkbox
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 z-0">
        <svg
          width="930"
          height="760"
          viewBox="0 0 930 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.3" filter="url(#filter0_f_9248_10254)">
            <circle cx="380.335" cy="380.335" r="179.665" fill="#CFEFFF" />
          </g>
          <g opacity="0.7" filter="url(#filter1_f_9248_10254)">
            <circle cx="549.665" cy="380.335" r="179.665" fill="#58B1FF" />
          </g>
          <defs>
            <filter
              id="filter0_f_9248_10254"
              x="0.669922"
              y="0.6698"
              width="759.33"
              height="759.33"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="100"
                result="effect1_foregroundBlur_9248_10254"
              />
            </filter>
            <filter
              id="filter1_f_9248_10254"
              x="170"
              y="0.6698"
              width="759.33"
              height="759.33"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="100"
                result="effect1_foregroundBlur_9248_10254"
              />
            </filter>
          </defs>
        </svg>
      </div>
    </section>
  );
}
