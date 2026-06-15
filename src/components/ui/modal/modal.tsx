"use client";

import { cn } from '../../../lib/utils';
import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: {
    modal?: string;
  };
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-800/80 backdrop-blur-lg transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div
          className={cn(
            'bg-white dark:bg-gray-900 rounded-3xl text-left overflow-hidden sm:w-[590px] transform transition-all p-5 sm:p-12 relative',
            className?.modal
          )}
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              type="button"
              className="bg-gray-100 dark:bg-white/5 dark:hover:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 rounded-full size-9 inline-flex items-center justify-center text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.09467 6.15615C4.80178 5.86325 4.80178 5.38838 5.09467 5.09549C5.38756 4.80259 5.86244 4.80259 6.15533 5.09549L9.99919 8.93934L13.8429 5.0956C14.1358 4.8027 14.6107 4.8027 14.9036 5.0956C15.1965 5.38849 15.1965 5.86336 14.9036 6.15626L11.0598 10L14.9036 13.8437C15.1965 14.1366 15.1965 14.6115 14.9036 14.9044C14.6107 15.1973 14.1358 15.1973 13.8429 14.9044L9.99919 11.0607L6.15533 14.9045C5.86244 15.1974 5.38756 15.1974 5.09467 14.9045C4.80178 14.6116 4.80178 14.1368 5.09467 13.8439L8.93853 10L5.09467 6.15615Z"
                  fill="#667085"
                />
              </svg>
            </button>
          </div>
          <div className="mt-3 text-left w-full">
            <h3 className="text-[30px] mb-2 leading-[38px] font-bold text-gray-800 dark:text-white/90">
              {title}
            </h3>
            {description && (
              <p className="text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
