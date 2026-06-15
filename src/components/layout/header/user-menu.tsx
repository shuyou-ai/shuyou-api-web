'use client';

import UserAvatar from '../../ui/user-avatar';
import { LogOutIcon } from '../../../icons/icons';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AUTH_CHANGED_EVENT,
  getAuthProfileClient,
  getUserNameFromAccessTokenClient,
  isLoggedInClient,
  markLoggedOutClient,
  type AuthProfile,
} from '../../../lib/auth/client';
import { fetchAndCacheAuthProfileOnce } from '../../../lib/auth/profile';

type AuthState = {
  loggedIn: boolean;
  profile: AuthProfile | null;
};

function readAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { loggedIn: false, profile: null };
  }
  const loggedIn = isLoggedInClient();
  return {
    loggedIn,
    profile: loggedIn ? getAuthProfileClient() : null,
  };
}

function resolveDisplayName(profile: AuthProfile | null): string {
  const fromProfile =
    profile?.nickname ||
    profile?.userName ||
    profile?.email ||
    null;
  return fromProfile || getUserNameFromAccessTokenClient() || 'Signed in';
}

export default function UserMenu() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [{ loggedIn, profile }, setState] = useState<AuthState>({
    loggedIn: false,
    profile: null,
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setState(readAuthState());

    const onAuthChanged = () => setState(readAuthState());
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === null ||
        e.key.startsWith('auth.')
      ) {
        setState(readAuthState());
      }
    };

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const cached = getAuthProfileClient();
    const hasName =
      cached?.nickName ||
      cached?.nickname ||
      cached?.userName ||
      cached?.email;
    if (!cached || !hasName) {
      fetchAndCacheAuthProfileOnce().catch(() => {});
    }
  }, [loggedIn, profile]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!mounted) {
    return <div className="hidden lg:block ml-[4px] h-9 w-8" aria-hidden />;
  }

  if (!loggedIn) {
    return (
      <Link
        href="/signin"
        className="text-sm hidden lg:block font-medium ml-[4px] bg-[#475CFF] text-[#fff] px-4 py-2 rounded-full"
      >
        Sign In
      </Link>
    );
  }

  const displayName = resolveDisplayName(profile);

  const handleLogout = () => {
    markLoggedOutClient();
    setOpen(false);
    router.push('/');
  };

  return (
    <div ref={containerRef} className="relative hidden lg:flex items-center ml-[4px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      >
        <UserAvatar
          src={profile?.avatar}
          name={displayName}
          size={32}
          className="size-8"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-dark-secondary"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white/90">
              {displayName}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white/90"
          >
            <LogOutIcon className="mr-2 size-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
