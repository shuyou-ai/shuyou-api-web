'use client';


import { DayPickerRangePanel } from './react-day-picker/day-picker-range-panel';
import { useClickOutside } from './use-click-outside';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { useEffect, useMemo, useRef, useState } from 'react';

export type DateRangePickerValue = {
  from: string;
  to: string;
};

export type DateRangePickerProps = {
  from: string;
  to: string;
  onChange: (next: DateRangePickerValue) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  /** 整块控件的额外 class */
  className?: string;
  panelClassName?: string;
};

function parseYmd(s: string): Date | undefined {
  if (!s) return undefined;
  try {
    return parseISO(s);
  } catch {
    return undefined;
  }
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder,
  disabled,
  ariaLabel,
  className,
  panelClassName,
}: DateRangePickerProps) {
  
  const [open, setOpen] = useState(false);
  const [rangeHovered, setRangeHovered] = useState(false);
  const [clearFocused, setClearFocused] = useState(false);
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

  const selected: DateRange | undefined = useMemo(() => {
    const f = parseYmd(from);
    if (!f) return undefined;
    const t0 = parseYmd(to);
    return { from: f, to: t0 };
  }, [from, to]);

  const displayText = useMemo(() => {
    if (from && to) return `${from} ~ ${to}`;
    if (from) return `${from} ~ …`;
    return '';
  }, [from, to]);

  const dpLocale = enUS;
  const hasContent = Boolean(from || to);
  const showClear = hasContent && (rangeHovered || clearFocused);

  const handleRangeSelect = (r: DateRange | undefined) => {
    if (!r?.from) {
      onChange({ from: '', to: '' });
      return;
    }
    const fs = format(r.from, 'yyyy-MM-dd');
    if (!r.to) {
      onChange({ from: fs, to: '' });
      return;
    }
    onChange({
      from: fs,
      to: format(r.to, 'yyyy-MM-dd'),
    });
    setOpen(false);
  };

  const clearSelection = () => {
    onChange({ from: '', to: '' });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn('relative w-full min-w-0', className)}>
      <div
        className={cn(
          'flex h-11 w-full min-w-0 max-w-full items-stretch overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-secondary'
        )}
        onMouseEnter={() => setRangeHovered(true)}
        onMouseLeave={() => setRangeHovered(false)}
      >
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
            'flex min-w-0 flex-1 items-center border-0 bg-transparent px-3 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-50/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/25 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white/90 dark:hover:bg-white/[0.06]'
          )}
        >
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              !from && !to && 'text-gray-400 dark:text-gray-500'
            )}
          >
            {from || to ? displayText : placeholder || '—'}
          </span>
        </button>

        <div
          className={cn(
            'relative flex w-11 shrink-0 border-l border-gray-200 dark:border-gray-600',
            disabled && 'pointer-events-none opacity-60'
          )}
        >
          <button
            type="button"
            disabled={disabled}
            aria-label={'Open calendar'}
            onClick={() => {
              if (disabled) return;
              setOpen((v) => !v);
            }}
            className={cn(
              'relative z-10 flex size-full items-center justify-center border-0 bg-transparent text-gray-400 transition hover:bg-gray-50/90 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/25 dark:hover:bg-white/[0.06] dark:hover:text-gray-200',
              showClear && 'pointer-events-none opacity-0'
            )}
          >
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </button>

          {hasContent ? (
            <button
              type="button"
              disabled={disabled}
              tabIndex={0}
              aria-label={'Clear'}
              title={'Clear'}
              onFocus={() => setClearFocused(true)}
              onBlur={() => setClearFocused(false)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearSelection();
              }}
              className={cn(
                'absolute inset-0 z-20 flex items-center justify-center border-0 bg-white text-gray-500 transition hover:text-gray-800',
                'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/25 focus-visible:outline-none',
                'dark:bg-dark-secondary dark:text-gray-300 dark:hover:text-white',
                showClear
                  ? 'pointer-events-auto opacity-100'
                  : 'pointer-events-none opacity-0'
              )}
            >
              <svg
                className="size-4 shrink-0"
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
      </div>

      {open ? (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-2 max-w-[min(100vw-2rem,640px)] overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-dark-secondary',
            panelClassName
          )}
          role="dialog"
        >
          <div className="p-2">
            <DayPickerRangePanel
              selected={selected}
              onSelect={handleRangeSelect}
              locale={dpLocale}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
