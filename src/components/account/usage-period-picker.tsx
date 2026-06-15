'use client';


import { cn } from '../../lib/utils';
import {
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export type UsageGranularity = 'day' | 'week' | 'month' | 'year';

function useClickOutside(
  open: boolean,
  rootRef: React.RefObject<HTMLElement | null>,
  onOutside: () => void
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node | null;
      if (target && root.contains(target)) return;
      onOutside();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onOutside, rootRef]);
}

export type UsagePeriodPickerProps = {
  granularity: UsageGranularity;
  /** 日/周/月/年：周为周一所在日、月为当月 1 日、年为当年 1 月 1 日，格式 yyyy-MM-dd */
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  buttonClassName?: string;
  panelClassName?: string;
  /** 按钮文案前是否加「UTC 」 */
  showUtcPrefix?: boolean;
  /** 右侧 hover 出现清除按钮（value 非空时） */
  clearable?: boolean;
};

function safeParse(iso: string): Date | undefined {
  if (!iso) return undefined;
  try {
    return parseISO(iso);
  } catch {
    return undefined;
  }
}

export function UsagePeriodPicker({
  granularity,
  value,
  onChange,
  placeholder,
  ariaLabel,
  buttonClassName,
  panelClassName,
  showUtcPrefix = true,
  clearable = false,
}: UsagePeriodPickerProps) {
  
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

  const selectedDate = useMemo(() => safeParse(value), [value]);
  const dpLocale = enUS;

  const displayBody = useMemo(() => {
    if (!selectedDate) return '';
    switch (granularity) {
      case 'year':
        return format(selectedDate, 'yyyy');
      case 'month':
        return format(selectedDate, 'yyyy-MM');
      case 'week': {
        const ws = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const we = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(ws, 'MM-dd')} – ${format(we, 'MM-dd')}, ${format(ws, 'yyyy')}`;
      }
      default:
        return format(selectedDate, 'yyyy-MM-dd');
    }
  }, [granularity, selectedDate]);

  const yearGrid = useMemo(() => {
    const y = selectedDate?.getFullYear() ?? new Date().getFullYear();
    return Array.from({ length: 16 }, (_, i) => y - 6 + i);
  }, [selectedDate]);

  const handleDaySelect = (d: Date | undefined) => {
    if (!d) return;
    let next: string;
    switch (granularity) {
      case 'month':
        next = format(startOfMonth(d), 'yyyy-MM-dd');
        break;
      case 'week':
        next = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      default:
        next = format(d, 'yyyy-MM-dd');
    }
    onChange(next);
    setOpen(false);
  };

  const captionLayout =
    granularity === 'month' ? 'dropdown' : ('label' as const);

  return (
    <div ref={rootRef} className="group relative w-full min-w-0">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 pr-9 text-sm font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90 dark:hover:bg-white/5',
          buttonClassName
        )}
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-left',
            !value && 'text-gray-400 dark:text-gray-500'
          )}
        >
          {value ? (
            <>
              {showUtcPrefix ? (
                <span className="text-gray-500 dark:text-gray-400">UTC </span>
              ) : null}
              {displayBody}
            </>
          ) : (
            placeholder || '—'
          )}
        </span>
        <svg
          className={cn(
            'absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400 transition',
            open && 'rotate-180',
            clearable && value && 'group-hover:opacity-0 group-hover:pointer-events-none'
          )}
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

      {clearable && value ? (
        <span
          role="button"
          tabIndex={0}
          className="absolute right-3.5 top-1/2 z-20 hidden size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-800 group-hover:flex dark:text-gray-300 dark:hover:text-white/90"
          aria-label={'Clear'}
          title={'Clear'}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange('');
            setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange('');
              setOpen(false);
            }
          }}
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
        </span>
      ) : null}

      {open ? (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-dark-secondary',
            panelClassName
          )}
          role="dialog"
        >
          {granularity === 'year' ? (
            <div className="max-h-64 w-[min(100vw-2rem,280px)] overflow-y-auto p-3 sm:w-72">
              <div className="grid grid-cols-4 gap-2">
                {yearGrid.map((y) => {
                  const active = selectedDate?.getFullYear() === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      className={cn(
                        'rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10'
                      )}
                      onClick={() => {
                        onChange(`${y}-01-01`);
                        setOpen(false);
                      }}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-2">
              <DayPicker
                key={granularity}
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate ?? new Date()}
                onSelect={handleDaySelect}
                locale={dpLocale}
                weekStartsOn={1}
                showWeekNumber={granularity === 'week'}
                captionLayout={captionLayout}
                fromYear={2018}
                toYear={2035}
                className="rdp m-0"
                style={
                  {
                    '--rdp-accent-color': '#475CFF',
                    '--rdp-accent-background-color': '#475CFF',
                  } as CSSProperties & Record<string, string>
                }
              />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** 将任意 yyyy-MM-dd 锚点按粒度归一化（用于与第一个选择器联动） */
export function normalizeUsagePeriod(
  granularity: UsageGranularity,
  ymd: string,
  fallback: string
): string {
  if (!ymd) return fallback;
  try {
    const d = parseISO(ymd);
    switch (granularity) {
      case 'year':
        return format(startOfYear(d), 'yyyy-MM-dd');
      case 'month':
        return format(startOfMonth(d), 'yyyy-MM-dd');
      case 'week':
        return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      default:
        return format(d, 'yyyy-MM-dd');
    }
  } catch {
    return fallback;
  }
}
