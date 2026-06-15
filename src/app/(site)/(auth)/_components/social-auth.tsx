'use client';

import { GithubIcon, GoogleIcon } from '../../../../icons/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type SocialAuthButtonProps = {
  /** 返回 false 则阻止继续执行 */
  beforeClick?: () => boolean;
};

export function SignInWithGoogle({ beforeClick }: SocialAuthButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        if (beforeClick && beforeClick() === false) return;
        if (loading) return;
        setLoading(true);
        try {
          const redirect = searchParams.get('redirect') || '/';
          window.localStorage.setItem('auth.redirect', redirect);

          const callBack =
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:3000/auth/callback/google'
              : '/auth/callback/google';

          const res = await fetch('/api/auth/authorize', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              type: 'google',
              callBack,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = (await res.json()) as { code: number; msg?: string; data?: string };
          if (json.code !== 0 || !json.data) {
            throw new Error(json.msg || 'authorize failed');
          }

          window.location.href = json.data;
        } catch {
          router.push('/signin');
        } finally {
          setLoading(false);
        }
      }}
      className="bg-gray-100 text-left w-full justify-center  dark:hover:bg-white/10 dark:hover:text-white/90 dark:bg-white/5 transition dark:text-gray-400 font-normal text-sm hover:bg-gray-200 rounded-full text-gray-700 hover:text-gray-800 flex items-center gap-3 px-4 sm:px-8 py-2.5 min-h-12 disabled:opacity-60 disabled:pointer-events-none"
    >
      <GoogleIcon className="shrink-0" />

      <span>{loading ? 'Redirecting…' : 'Continue with Google'}</span>
    </button>
  );
}

export function SignInWithGithub({ beforeClick }: SocialAuthButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      className="bg-gray-100 w-full justify-center  dark:hover:bg-white/10 dark:hover:text-white/90 dark:bg-white/5 transition dark:text-gray-400 font-normal text-sm hover:bg-gray-200 rounded-full text-gray-700 hover:text-gray-800 flex items-center gap-3 px-4 sm:px-8 py-2.5 text-left min-h-12"
      onClick={async () => {
        if (beforeClick && beforeClick() === false) return;
        if (loading) return;
        setLoading(true);
        try {
          const redirect = searchParams.get('redirect') || '/';
          window.localStorage.setItem('auth.redirect', redirect);

          const callBack =
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:3000/auth/callback/github'
              : '/auth/callback/github';

          const res = await fetch('/api/auth/authorize', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              type: 'github',
              callBack,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = (await res.json()) as { code: number; msg?: string; data?: string };
          if (json.code !== 0 || !json.data) {
            throw new Error(json.msg || 'authorize failed');
          }

          window.location.href = json.data;
        } catch {
          router.push('/signin');
        } finally {
          setLoading(false);
        }
      }}
    >
      <GithubIcon className="size-6 shrink-0" />
      <span>{loading ? 'Redirecting…' : 'Continue with GitHub'}</span>
    </button>
  );
}
