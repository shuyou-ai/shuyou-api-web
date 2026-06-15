'use client';
import { CloseIcon, MenuIcon } from '../../../icons/icons';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DesktopNav from './desktop-nav';
import MainMobileNav from './main-mobile-nav';
import ThemeToggle from './theme-toggle';
import UserMenu from './user-menu';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white/60 dark:bg-dark-primary/60 backdrop-blur-[10px] border-b dark:border-gray-800 border-gray-100 sticky top-0 z-50 py-2 lg:py-2">
      <div className="px-4 sm:px-6 lg:px-7">
        <div className="grid grid-cols-2 items-center lg:grid-cols-[1fr_auto_1fr]">
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

          <DesktopNav />

          <div className="flex items-center gap-0 justify-self-end">
            <ThemeToggle />

            <UserMenu />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              type="button"
              className="order-last shrink-0 inline-flex items-center justify-center ml-[4px] p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      <MainMobileNav isOpen={mobileMenuOpen} />
    </header>
  );
}
