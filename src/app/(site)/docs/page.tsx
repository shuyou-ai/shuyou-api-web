import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docs',
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white/90">
        Docs
      </h1>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Docs page placeholder.
      </p>
    </main>
  );
}
