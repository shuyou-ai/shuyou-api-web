'use client';

import { cn } from '../../../lib/utils';
import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = 'https://coder.shuyou.ai';
const API_BASE_DISPLAY = API_BASE_URL;

const API_PATHS = [
  '/v1/chat/completions',
  '/v1/responses',
  '/v1/messages',
  '/v1/embeddings',
  '/v1/predictions',
] as const;

const ROTATE_MS = 3000;
const COPY_FEEDBACK_MS = 2000;

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

export function ApiEndpointBar() {
  const [pathIndex, setPathIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const currentPath = API_PATHS[pathIndex];
  const fullUrl = `${API_BASE_URL}${currentPath}`;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setPathIndex((index) => (index + 1) % API_PATHS.length);
        setVisible(true);
      }, 180);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      /* ignore */
    }
  }, [fullUrl]);

  return (
    <div className="mt-10 flex flex-col items-center gap-2 px-2">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
        Base URL
      </p>

      <div
        className={cn(
          'inline-flex max-w-full items-center gap-1 rounded-full border border-gray-200/90',
          'bg-white/90 py-1.5 pl-3.5 pr-1.5 shadow-[0_4px_24px_rgba(15,23,42,0.06)]',
          'ring-1 ring-black/[0.03] backdrop-blur-md',
          'dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] dark:ring-white/[0.06]'
        )}
      >
        <div className="flex min-w-0 items-baseline gap-0 overflow-x-auto whitespace-nowrap font-mono text-[13px] leading-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:text-sm">
          <span className="shrink-0 text-gray-600 dark:text-gray-300">
            {API_BASE_DISPLAY}
          </span>
          <span
            className={cn(
              'shrink-0 font-semibold text-[#475CFF] transition-all duration-200 dark:text-[#8B97FF]',
              visible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-0.5 opacity-0'
            )}
          >
            {currentPath}
          </span>
        </div>

        <span className="mx-0.5 h-4 w-px shrink-0 bg-gray-200 dark:bg-white/10" />

        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={copied ? 'Copied' : 'Copy API endpoint'}
          className={cn(
            'inline-flex size-7 shrink-0 items-center justify-center rounded-full transition',
            copied
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/15 dark:hover:text-gray-200'
          )}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}
