'use client';

export default function AccountSectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
