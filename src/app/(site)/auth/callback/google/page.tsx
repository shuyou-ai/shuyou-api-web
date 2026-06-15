'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  setAccessTokenClient,
  setUserIdClient,
} from '../../../../../lib/auth/client';
import { fetchAndCacheAuthProfileOnce } from '../../../../../lib/auth/profile';

function getRedirectFallback() {
  try {
    return window.localStorage.getItem('auth.redirect') || '/';
  } catch {
    return '/';
  }
}

function clearRedirect() {
  try {
    window.localStorage.removeItem('auth.redirect');
  } catch {
    // ignore
  }
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">登录处理中…</p>
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('登录处理中…');
  const didRunRef = useRef(false);

  useEffect(() => {
    // Next.js dev + React StrictMode 会导致 effect 执行两次；这里确保只换 token 一次
    if (didRunRef.current) return;
    didRunRef.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setMessage(errorDescription ? `登录失败：${errorDescription}` : `登录失败：${error}`);
      clearRedirect();
      return;
    }

    if (!code) {
      setMessage('登录失败：缺少 code 参数');
      clearRedirect();
      return;
    }

    (async () => {
      try {
        const callBack =
            process.env.NODE_ENV === 'development'
                ? 'http://localhost:3000/auth/callback/google'
                : '/auth/callback/google';

        const res = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ type: 'google', code , callBack}),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          code: number;
          msg?: string;
          data?: { accessToken?: string; expireTime?: string | number; userId?: string };
        };
        if (json.code !== 0) throw new Error(json.msg || 'token failed');

        const token = json.data?.accessToken;
        const expireTime = json.data?.expireTime;
        const userId = json.data?.userId;

        if (!token) throw new Error('token missing');

        setAccessTokenClient(token, expireTime);
        setUserIdClient(userId);

        // 获取当前用户信息并缓存（不阻塞跳转，且全局去重）
        fetchAndCacheAuthProfileOnce().catch(() => {});

        const redirect = getRedirectFallback();
        clearRedirect();
        router.replace(redirect || '/');
      } catch (e) {
        setMessage(`登录失败：${(e as Error).message || 'unknown error'}`);
        clearRedirect();
      }
    })();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

