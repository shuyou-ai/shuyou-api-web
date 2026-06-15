'use client';

import { useEffect, useState } from 'react';
import { Modal } from '../ui/modal/modal';


function CopyButton({ value }: { value: string }) {
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      className="relative inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-dark-secondary dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white/90"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          // ignore
        }
      }}
      aria-label={copied ? 'Copied' : 'Copy'}
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
      {copied ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[11px] font-medium text-white">
          {'Copied'}
        </span>
      ) : null}
    </button>
  );
}

export default function NewApiKeyModal({
  open,
  apiKey,
  onClose,
}: {
  open: boolean;
  apiKey: string;
  onClose: () => void;
}) {
  

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      description=""
      className={{ modal: 'sm:w-[500px] p-5 sm:p-8' }}
    >
      <div className="mt-8">
        <p className="mb-3 text-center text-lg font-medium text-gray-700 dark:text-gray-200 mt-[-30px]">
          {'Your new key:'}
        </p>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-white/5">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <code className="whitespace-nowrap font-mono text-sm text-gray-900 dark:text-white/90">
              {apiKey}
            </code>
          </div>
          <CopyButton value={apiKey} />
        </div>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {'Please copy it now and write it down somewhere safe.'}{' '}
          <span className="font-semibold text-gray-900 dark:text-white/90">
            {'You will not be able to see it again.'}
          </span>
        </p>
      </div>
    </Modal>
  );
}

