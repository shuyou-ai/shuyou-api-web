'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { ApiKeysIcon, BillingIcon, UsageIcon, LogsIcon } from '../../icons/icons';

const NAV = [
  { href: '/account/api-keys', label: 'API Keys', Icon: ApiKeysIcon },
  { href: '/account/billing', label: 'Billing', Icon: BillingIcon },
  { href: '/account/usage', label: 'API Usage', Icon: UsageIcon },
  { href: '/account/logs', label: 'Logs', Icon: LogsIcon },
] as const;

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 bg-[#F5F5F5] dark:border-gray-800 dark:bg-white/[0.04] md:w-56 md:border-b-0">
      <nav className="flex flex-row gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible md:p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-[#fff] text-gray-900 dark:bg-[#475CFF]/20 dark:text-white/90'
                  : 'text-[#7D7D84] hover:bg-gray-200/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white/90'
              )}
            >
              <Icon className="size-5 shrink-0 opacity-80" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
