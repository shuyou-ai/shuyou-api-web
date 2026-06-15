'use client';

import { ChevronDown2Icon } from '../../../icons/icons';
import { cn } from '../../../lib/utils';
import { isLoggedInClient } from '../../../lib/auth/client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navItems } from './nav-items';

export default function DesktopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeDropdownKey, setActiveDropdownKey] = useState('');

  function toggleActiveDropdown(key: string) {
    setActiveDropdownKey((prevKey) => (prevKey === key ? '' : key));
  }

  useEffect(() => {
    setActiveDropdownKey('');
  }, [pathname]);

  return (
    <nav className="hidden lg:flex lg:items-center rounded-full p-1 max-h-fit">
      {navItems.map((item) => {
        if (item.type === 'link') {
          const isExternal =
            item.href.startsWith('http://') || item.href.startsWith('https://');
          return (
            <Link
              key={item.href}
              href={item.href}
              {...(isExternal
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className={cn(
                'text-gray-500 dark:text-gray-400 text-sm px-4 py-1.5 rounded-full hover:text-primary-500 font-medium',
                {
                  'font-medium text-primary-500 dark:text-white/90':
                    !isExternal && pathname === item.href,
                }
              )}
            >
              {item.label}
            </Link>
          );
        }

        if (item.type === 'dropdown') {
          const toggleThisDropdown = () => {
            toggleActiveDropdown(item.key);
          };

          const isDropdownActive = activeDropdownKey === item.key;

          return (
            <div key={item.key} className="relative">
              <button
                onClick={toggleThisDropdown}
                onMouseEnter={toggleThisDropdown}
                onMouseLeave={toggleThisDropdown}
                onKeyDown={(e) => {
                  if (isDropdownActive && e.key === 'Escape') {
                    toggleThisDropdown();
                  }
                }}
                className={cn(
                  'text-gray-500 dark:text-gray-400 hover:text-primary-500 group text-sm inline-flex gap-1 items-center px-4 py-1.5 font-medium rounded-full',
                  {
                    'bg-white dark:bg-white/5 font-medium text-primary-500 dark:text-white/90':
                      item.items.some(({ href }) => pathname?.includes(href)),
                  }
                )}
              >
                <span>{item.label}</span>
                <ChevronDown2Icon
                  className={cn('size-4 transition-transform duration-200', {
                    'rotate-180': isDropdownActive,
                  })}
                />
              </button>

              {isDropdownActive && (
                <div
                  onMouseEnter={toggleThisDropdown}
                  onMouseLeave={toggleThisDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      toggleThisDropdown();
                    }
                  }}
                  className="absolute right-0 w-[266px] bg-white dark:bg-dark-secondary dark:border-gray-800 rounded-2xl border border-gray-100 p-3 z-50"
                >
                  <div className="space-y-1">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={(e) => {
                          if (!subItem.requiresAuth) return;
                          if (isLoggedInClient()) return;
                          e.preventDefault();
                          router.push(
                            `/signin?redirect=${encodeURIComponent(subItem.href)}`
                          );
                        }}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </nav>
  );
}
