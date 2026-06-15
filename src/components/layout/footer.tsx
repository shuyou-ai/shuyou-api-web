import { cn, getCurrentYear } from '../../lib/utils';
import Link from 'next/link';

function FooterNavItem({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  const className = cn(
    'block text-sm font-normal transition-colors',
    href
      ? 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
      : 'cursor-default text-gray-500 dark:text-gray-400'
  );

  if (href) {
    const isExternal =
      href.startsWith('http://') || href.startsWith('https://');
    return (
      <Link
        href={href}
        {...(isExternal
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return <span className={className}>{children}</span>;
}

export default function Footer() {
  const year = getCurrentYear();

  const columns: { title: string; items: { label: string; href?: string }[] }[] = [
    {
      title: 'Product',
      items: [
        { label: 'Models', href: '/models' },
        { label: 'Console', href: '/account/api-keys' },
        { label: 'Docs', href: 'https://docs.shuyou.ai/' },
      ],
    },
    {
      title: 'Company',
      items: [{ label: 'About', href: '/about' }],
    },
  ];

  return (
    <footer className="bg-[#f5f5f5] dark:border-gray-800 dark:bg-dark-primary">
      <div className="container mx-auto px-5 py-12 sm:px-7 lg:py-15">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="shrink-0">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              ShuYou
            </Link>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              © {year} ShuYou.AI. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12 lg:gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold text-[#18181B] dark:text-white">
                  {col.title}
                </h3>
                <nav className="flex flex-col gap-3 text-[#7D7D84]">
                  {col.items.map((item) => (
                    <FooterNavItem key={item.label} href={item.href}>
                      {item.label}
                    </FooterNavItem>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
