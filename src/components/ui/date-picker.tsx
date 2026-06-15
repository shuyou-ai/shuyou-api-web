'use client';


import { useClickOutside } from './use-click-outside';
import { cn } from '../../lib/utils';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export type DatePickerProps = {
  /** YYYY-MM-DD or '' */
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  buttonClassName?: string;
  panelClassName?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  ariaLabel,
  buttonClassName,
  panelClassName,
}: DatePickerProps) {
  
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(open, rootRef, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    try {
      // parse ISO date string: YYYY-MM-DD
      return parseISO(value);
    } catch {
      return undefined;
    }
  }, [value]);

  const displayText = useMemo(() => {
    if (!selectedDate) return '';
    // keep UI consistent: YYYY-MM-DD
    return format(selectedDate, 'yyyy-MM-dd');
  }, [selectedDate]);

  const dpLocale = enUS;

  return (
    <div ref={rootRef} className="relative">
      <div className="flex w-full items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            if (disabled) return;
            setOpen((v) => !v);
          }}
          className={cn(
            'inline-flex h-11 w-full flex-1 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90 dark:hover:bg-white/5',
            buttonClassName
          )}
        >
          <span
            className={cn('min-w-0 flex-1 truncate text-left', !value && 'text-gray-400')}
          >
            {value ? displayText : placeholder || '—'}
          </span>
          <svg
            className={cn('ml-3 size-4 shrink-0 text-gray-400 transition', open && 'rotate-180')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {value ? (
          <button
            type="button"
            disabled={disabled}
            aria-label={'Clear'}
            title={'Clear'}
            onClick={(e) => {
              e.preventDefault();
              onChange('');
              setOpen(false);
            }}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-dark-secondary dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
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
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-dark-secondary',
            panelClassName
          )}
          role="dialog"
        >
          <div className="p-2">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (!d) return;
                onChange(format(d, 'yyyy-MM-dd'));
                setOpen(false);
              }}
              locale={dpLocale}
              weekStartsOn={1}
              className="rdp m-0"
              style={
                {
                  // react-day-picker v8/v9: accent colors
                  '--rdp-accent-color': '#475CFF',
                  '--rdp-accent-background-color': '#475CFF',
                } as CSSProperties & Record<string, string>
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

