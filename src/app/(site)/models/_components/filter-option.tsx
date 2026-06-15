'use client';

import { CheckMarkIcon2 } from '../../../../icons/icons';
import { cn } from '../../../../lib/utils';

type FilterOptionProps = {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
};

export function FilterOption({
  label,
  count,
  checked,
  onChange,
}: FilterOptionProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
        checked
          ? 'bg-gray-100 dark:bg-white/5'
          : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors',
          checked
            ? 'border-gray-900 bg-gray-900 dark:border-white dark:bg-white'
            : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-transparent'
        )}
      >
        {checked && (
          <CheckMarkIcon2 className="h-3 w-3 text-white dark:text-gray-900" />
        )}
      </span>

      <span className="min-w-0 flex-1 text-sm text-gray-900 dark:text-white/90">
        {label}
      </span>

      <span
        className={cn(
          'shrink-0 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums',
          checked
            ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white/90'
            : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
        )}
      >
        {count}
      </span>
    </button>
  );
}
