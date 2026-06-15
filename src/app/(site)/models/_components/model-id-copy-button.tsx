'use client';

import { cn } from '../../../../lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

const COPY_FEEDBACK_MS = 2500;

type ModelIdCopyButtonProps = {
  modelId: string;
  copied: boolean;
  onCopied: () => void;
};

export function ModelIdCopyButton({
  modelId,
  copied,
  onCopied,
}: ModelIdCopyButtonProps) {
  return (
    <span className="group relative inline-flex shrink-0 items-center self-center">
      <span
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs font-medium leading-none text-white transition',
          copied
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100'
        )}
        role={copied ? 'status' : 'tooltip'}
        aria-live="polite"
      >
        {copied ? 'Copied' : 'Copy model ID'}
      </span>
      <button
        type="button"
        className="inline-flex rounded p-0.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
        aria-label={copied ? 'Copied' : 'Copy model ID'}
        onClick={async (event) => {
          event.stopPropagation();
          try {
            await navigator.clipboard.writeText(modelId);
            onCopied();
          } catch {
            /* ignore */
          }
        }}
      >
        {copied ? (
          <svg
            className="size-4"
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
        ) : (
          <svg
            className="size-4"
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
        )}
      </button>
    </span>
  );
}

export function useModelIdCopyFeedback() {
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const acknowledgeCopied = useCallback((rowId: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCopiedRowId(rowId);
    timerRef.current = setTimeout(() => {
      setCopiedRowId(null);
      timerRef.current = null;
    }, COPY_FEEDBACK_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { copiedRowId, acknowledgeCopied };
}
