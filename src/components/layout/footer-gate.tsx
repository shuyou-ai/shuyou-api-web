'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function FooterGate() {
  const pathname = usePathname() || '';

  if (pathname === '/models' || pathname.startsWith('/models/')) return null;
  if (pathname === '/account' || pathname.startsWith('/account/')) return null;
  if (
    pathname === '/text-generator' ||
    pathname.startsWith('/text-generator/') ||
    pathname === '/image-generator' ||
    pathname.startsWith('/image-generator/') ||
    pathname === '/video-generator' ||
    pathname.startsWith('/video-generator/')
  ) {
    return null;
  }

  return <Footer />;
}
