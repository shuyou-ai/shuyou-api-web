'use client';

import { TextGeneratorIcon } from '../../../icons/icons';
import { cn } from '../../../lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '../../../lib/studio-text';

const navItems = [
  {
    href: '/text-generator',
    labelKey: 'nav.studio.text',
    icon: <TextGeneratorIcon className="size-8" />,
  },
  {
    href: '/image-generator',
    labelKey: 'nav.studio.image',
    icon: <TextGeneratorIcon className="size-8" />,
  },
  {
    href: '/video-generator',
    labelKey: 'nav.studio.video',
    icon: <TextGeneratorIcon className="size-8" />,
  },
];

export default function GeneratorSidebarNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="px-5 py-6">
      <h2 className="text-xs font-medium text-gray-400 dark:text-gray-400 capitalize tracking-wider">
        Products
      </h2>
      <nav className="mt-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex gap-1.5 items-center h-11 px-2 py-3 text-sm font-medium rounded-full transition',
                isActive
                  ? 'bg-gray-100 dark:bg-white/5 dark:text-white/90 text-gray-800'
                  : 'dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              )}
            >
              {item.icon}
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
