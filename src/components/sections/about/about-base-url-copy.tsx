'use client';

import { cn } from '../../../lib/utils';
import { useCallback, useState } from 'react';

const API_BASE_URL = 'https://coder.shuyou.ai';

function CopyIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <rect x="8" y="8" width="12" height="12" rx="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function AboutBaseUrlCopy() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(API_BASE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-gray-50/90 shadow-sm ring-1 ring-black/[0.03] dark:border-gray-700 dark:bg-white/[0.04] dark:ring-white/[0.06]">
      <div className="flex items-center gap-2 border-b border-gray-200/80 bg-white/80 px-4 py-3 dark:border-gray-700 dark:bg-white/[0.03]">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 font-mono text-[11px] text-gray-400 dark:text-gray-500">
          api-config
        </span>
      </div>
      <div className="flex flex-col gap-4 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:bg-white/[0.02]">
        <div className="min-w-0 font-mono text-sm leading-relaxed">
          <span className="text-gray-500 dark:text-gray-400">BASE_URL=</span>
          <span className="font-semibold text-[#475CFF] dark:text-[#8B97FF]">
            {API_BASE_URL}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={cn(
            'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition',
            copied
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/25'
              : 'bg-[#475CFF] text-white hover:bg-[#3d50ea] dark:bg-[#475CFF] dark:hover:bg-[#3d50ea]'
          )}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied' : 'Copy Base URL'}
        </button>
      </div>
    </div>
  );
}
