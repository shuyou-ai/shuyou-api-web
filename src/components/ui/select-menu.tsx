'use client';

import { cn } from '../../lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';


export type SelectMenuOption = {
  value: string;
  label: string;
  /**
   * 左侧图标：不传该字段则不预留图标位。
   * 传 `null` 或空字符串表示无 URL，用 `label` 首字母占位。
   */
  icon?: string | null;
};

function optionHasIconColumn(opt: SelectMenuOption) {
  return 'icon' in opt && opt.icon !== undefined;
}

function OptionLeading({
  label,
  icon,
  size,
}: {
  label: string;
  icon: string | null | undefined;
  size: 'sm' | 'md';
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = typeof icon === 'string' && icon.trim().length > 0 ? icon.trim() : '';
  const showImg = url.length > 0 && !imgFailed;
  const frame = size === 'sm' ? 'size-5 rounded-md' : 'size-7 rounded-lg';
  const initial = label.trim().slice(0, 1) || '?';

  useEffect(() => {
    setImgFailed(false);
  }, [icon]);

  if (showImg) {
    return (
      <span
        className={cn(
          'relative shrink-0 overflow-hidden bg-gray-100 ring-1 ring-black/[0.06] dark:bg-white/10 dark:ring-white/10',
          frame
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 外部模型图标域名不固定 */}
        <img
          src={url}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-semibold text-white shadow-inner ring-1 ring-black/[0.06] dark:from-violet-400 dark:to-indigo-500 dark:ring-white/10',
        size === 'sm' ? 'size-5 rounded-md text-[9px]' : 'size-7 rounded-lg text-xs'
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export function SelectMenu({
  value,
  options,
  onChange,
  className,
  buttonClassName,
  menuClassName,
  placeholder = '',
  ariaLabel,
  clearable = false,
  disabled = false,
  /** `above`：在触发器上方展开，适合靠近视口或 `overflow-hidden` 底部的场景 */
  menuPlacement = 'below',
  /** 为 false 时下拉项与触发器文案不截断，便于展示较长模型名 */
  truncateLabels = true,
}: {
  value: string;
  options: SelectMenuOption[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  placeholder?: string;
  ariaLabel?: string;
  clearable?: boolean;
  disabled?: boolean;
  menuPlacement?: 'above' | 'below';
  truncateLabels?: boolean;
}) {
  
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const selectedShowIcon = selected && optionHasIconColumn(selected);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div className={cn('group relative', className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className={cn(
          'relative inline-flex h-11 w-full min-w-[140px] items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-4 pr-9 text-sm font-medium text-[#7D7D84] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10',
          buttonClassName
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selectedShowIcon ? (
            <OptionLeading label={selected!.label} icon={selected!.icon} size="sm" />
          ) : null}
          <span
            className={cn(
              'min-w-0 flex-1 text-left',
              truncateLabels ? 'truncate' : 'whitespace-nowrap',
              !selected && 'text-gray-400 dark:text-gray-500'
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <svg
          className={cn(
            'absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400 transition',
            open && 'rotate-180',
            clearable && selected && 'group-hover:opacity-0 group-hover:pointer-events-none'
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

      {clearable && selected ? (
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

      {open && !disabled ? (
        <div
          className={cn(
            'absolute right-0 z-50 w-max min-w-[220px] max-w-[min(100vw-2rem,20rem)] overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 p-1.5 backdrop-blur-sm dark:border-gray-600/80 dark:bg-dark-primary/95',
            menuPlacement === 'above'
              ? 'bottom-full mb-2 shadow-[0_-12px_40px_-12px_rgba(15,23,42,0.22)] dark:shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.5)]'
              : 'top-full mt-2 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]',
            menuClassName
          )}
          role="listbox"
          aria-label={ariaLabel}
        >
          <div className="max-h-72 overflow-y-auto overscroll-contain py-0.5 [scrollbar-width:thin]">
            {options.map((opt) => {
              const isActive = opt.value === value;
              const showLead = optionHasIconColumn(opt);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-gray-900 dark:bg-primary-500/15 dark:text-white'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-white/85 dark:hover:bg-white/[0.06]'
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {showLead ? (
                    <OptionLeading label={opt.label} icon={opt.icon} size="md" />
                  ) : null}
                  <span
                    className={cn(
                      'min-w-0 flex-1',
                      truncateLabels ? 'truncate' : 'whitespace-nowrap'
                    )}
                  >
                    {opt.label}
                  </span>
                  {isActive ? (
                    <svg
                      className="ml-1 size-4 shrink-0 text-primary-600 dark:text-primary-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

