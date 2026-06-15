'use client';

import { CloseIcon, LogOutIcon, MenuIcon } from '../../icons/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DesktopNav from '../layout/header/desktop-nav';
import MainMobileNav from '../layout/header/main-mobile-nav';
import ThemeToggle from '../layout/header/theme-toggle';
import UserAvatar from '../ui/user-avatar';
import {
  AUTH_CHANGED_EVENT,
  getAuthProfileClient,
  getUserNameFromAccessTokenClient,
  isLoggedInClient,
  markLoggedOutClient,
} from '../../lib/auth/client';
import { fetchAndCacheAuthProfileOnce } from '../../lib/auth/profile';
import { useI18n } from '../../lib/studio-text';
import { usePathname } from 'next/navigation';

export default function GeneratorHeader({
  toggleSidebar,
  toggleRightSidebar,
  sidebarOpen,
  hideLeftToggle,
  hideRightToggle,
}: {
  toggleSidebar: () => void;
  toggleRightSidebar: () => void;
  sidebarOpen: boolean;
  hideLeftToggle?: boolean;
  hideRightToggle?: boolean;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ok = isLoggedInClient();
      setAuthed(ok);
      if (!ok) {
        setDisplayName(null);
        setAvatar(null);
        return;
      }
      const cached = getAuthProfileClient();
      const nameFromProfile =
        cached?.nickname ||
        cached?.userName ||
        cached?.email ||
        null;
      setDisplayName(nameFromProfile || getUserNameFromAccessTokenClient());
      setAvatar(cached?.avatar || null);
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!authed) return;
    const cached = getAuthProfileClient();
    if (!cached?.avatar) {
      fetchAndCacheAuthProfileOnce().catch(() => {});
    }
  }, [authed]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-generator-user-menu-root="1"]')) return;
      setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [userMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white dark:bg-dark-primary border-b dark:border-gray-800 border-gray-100 sticky top-0 z-50 py-2 lg:py-2 ">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 items-center lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-3">
              {/* <!-- Mobile menu button --> */}
              {!hideLeftToggle ? (
                <button
                  aria-label="Toggle left sidebar"
                  onClick={toggleSidebar}
                  className="rounded-md text-gray-400 lg:hidden"
                >
                  {sidebarOpen ? (
                    <CloseIcon className="size-6" />
                  ) : (
                    <MenuIcon className="size-6" />
                  )}
                </button>
              ) : null}

              <div className="flex items-center">
                <Link href="/">
                  <Image
                    src="/images/logo-black.svg"
                    className="block dark:hidden"
                    width={140}
                    height={25}
                    alt="AiStarterKit Logo"
                  />
                  <Image
                    src="/images/logo-white.svg"
                    className="hidden dark:block"
                    width={140}
                    height={25}
                    alt="AiStarterKit Logo"
                  />
                </Link>
              </div>
            </div>
          </div>

          <DesktopNav />

          <div className="flex items-center gap-3 justify-self-end">
            <ThemeToggle />

            {authed ? (
              <div
                data-generator-user-menu-root="1"
                className="relative hidden lg:flex items-center ml-[4px]"
              >
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <UserAvatar
                    src={avatar}
                    name={displayName}
                    size={32}
                    className="size-8"
                  />
                </button>

                {userMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-dark-secondary"
                  >
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white/90">
                        {displayName || t('header.loggedIn')}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        markLoggedOutClient();
                        setUserMenuOpen(false);
                        window.location.href = '/';
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white/90"
                    >
                      <LogOutIcon className="mr-2 size-4" />
                      {t('header.signOut')}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/signin"
                className="text-sm hidden lg:block font-medium ml-[4px] bg-[#475CFF] text-[#fff] px-4 py-2 rounded-full"
              >
                {t('header.signIn')}
              </Link>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen((v) => !v);
              }}
              type="button"
              className="order-last shrink-0 inline-flex items-center justify-center ml-[4px] p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {!hideRightToggle ? (
              <button
                onClick={toggleRightSidebar}
                type="button"
                className="inline-flex xl:hidden items-center dark:hover:bg-white/5 dark:hover:text-white/90 hover:bg-gray-100 hover:text-gray-800 text-gray-500 dark:text-gray-400 justify-center border border-gray-200 dark:border-gray-700 rounded-full size-11"
              >
                <span className="sr-only">Open right sidebar</span>
                <svg
                  className="size-7"
                  width="32"
                  height="32"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  transform="rotate(0 0 0)"
                >
                  <path
                    d="M6.3125 13.7558C5.346 13.7559 4.5625 12.9723 4.5625 12.0059V11.9959C4.5625 11.0294 5.346 10.2458 6.3125 10.2458C7.279 10.2458 8.0625 11.0294 8.0625 11.9958V12.0058C8.0625 12.9723 7.279 13.7558 6.3125 13.7558Z"
                    fill="currentColor"
                  />
                  <path
                    d="M18.3125 13.7558C17.346 13.7558 16.5625 12.9723 16.5625 12.0058V11.9958C16.5625 11.0294 17.346 10.2458 18.3125 10.2458C19.279 10.2458 20.0625 11.0294 20.0625 11.9958V12.0058C20.0625 12.9723 19.279 13.7558 18.3125 13.7558Z"
                    fill="currentColor"
                  />
                  <path
                    d="M10.5625 12.0058C10.5625 12.9723 11.346 13.7558 12.3125 13.7558C13.279 13.7558 14.0625 12.9723 14.0625 12.0058V11.9958C14.0625 11.0294 13.279 10.2458 12.3125 10.2458C11.346 10.2458 10.5625 11.0294 10.5625 11.9958V12.0058Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <MainMobileNav isOpen={mobileMenuOpen} />
    </header>
  );
}
