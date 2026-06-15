export type NavLinkItem = {
  type: 'link';
  href: string;
  label: string;
};

export type NavDropdownItem = {
  type: 'dropdown';
  key: string;
  label: string;
  items: Array<{ href: string; label: string; requiresAuth?: boolean }>;
};

export type NavItem = NavLinkItem | NavDropdownItem;

export function isNavItemActive(pathname: string, item: NavLinkItem): boolean {
  if (item.href.startsWith('/account')) {
    return pathname === '/account' || pathname.startsWith('/account/');
  }
  return pathname === item.href;
}

export function isStudioRoute(pathname: string): boolean {
  return (
    pathname === '/text-generator' ||
    pathname.startsWith('/text-generator/') ||
    pathname === '/image-generator' ||
    pathname.startsWith('/image-generator/') ||
    pathname === '/video-generator' ||
    pathname.startsWith('/video-generator/')
  );
}

export const navItems: NavItem[] = [
  { type: 'link', href: '/', label: 'Home' },
  { type: 'link', href: '/models', label: 'Models' },
  {
    type: 'dropdown',
    key: 'studio',
    label: 'Studio',
    items: [
      { href: '/text-generator', label: 'Text Generation', requiresAuth: true },
      { href: '/image-generator', label: 'Image Generation', requiresAuth: true },
      { href: '/video-generator', label: 'Video Generation', requiresAuth: true },
    ],
  },
  { type: 'link', href: 'https://docs.shuyou.ai/', label: 'Docs' },
  { type: 'link', href: '/account/api-keys', label: 'Console' },
  { type: 'link', href: '/about', label: 'About' },
];
