'use client';

import { Toaster, type ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';

export function ToasterProvider() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme as ToasterProps['theme']}
      position="top-center"
      richColors
    />
  );
}
