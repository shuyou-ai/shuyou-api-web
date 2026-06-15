'use client';

import Link from 'next/link';

type PropsType = {
  toggleSidebar: () => void;
};

export function NewChat({ toggleSidebar }: PropsType) {
  return (
    <Link
      href="/text-generator"
      onClick={toggleSidebar}
      className="w-full bg-gray-700 dark:bg-white/15 dark:hover:bg-white/25 font-medium text-sm hover:bg-gray-800 transition text-white py-3 px-5 rounded-full flex items-center justify-center disabled:pointer-events-none disabled:opacity-80"
    >
      New Chat
    </Link>
  );
}
