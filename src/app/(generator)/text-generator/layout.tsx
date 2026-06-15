import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Text Generator',
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <main className="flex w-full min-h-0 flex-1 flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex w-full min-h-0 flex-[1_1_0]">
        <div className="relative isolate flex h-full min-h-0 w-full flex-col">{children}</div>
      </div>
    </main>
  );
}
