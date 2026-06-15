'use client';

import { CheckMarkIcon, ClipboardIcon } from '../icons/icons';
import copy from 'copy-text-to-clipboard';
import { useState } from 'react';

export function CopyToClipboard({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  function handleClick() {
    copy(text);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  }

  return (
    <button
      onClick={handleClick}
      className="flex gap-1 items-center hover:text-gray-500 dark:hover:text-white/90 dark:text-gray-400 dark:border-white/5 bg-white dark:bg-white/3 h-8 rounded-full px-3 py-1.5 border font-medium text-gray-700 border-gray-100 text-xs"
    >
      {isCopied ? <CheckMarkIcon /> : <ClipboardIcon />}

      <span>
        {isCopied ? 'Copied' : 'Copy'}{' '}
        <span className="sr-only">to clipboard</span>
      </span>
    </button>
  );
}
