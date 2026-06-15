'use client';

import { ChevronDown2Icon } from '../../../../icons/icons';
import { cn } from '../../../../lib/utils';
import type { FilterCategory } from '../types';
import { FILTER_CATEGORY_ICONS } from './filter-icons';
import { FilterOption } from './filter-option';

type FilterSectionProps = {
  category: FilterCategory;
  expanded: boolean;
  selectedId: string | null;
  onToggleExpand: () => void;
  onSelectOption: (optionId: string) => void;
};

export function FilterSection({
  category,
  expanded,
  selectedId,
  onToggleExpand,
  onSelectOption,
}: FilterSectionProps) {
  const Icon = FILTER_CATEGORY_ICONS[category.id as keyof typeof FILTER_CATEGORY_ICONS];

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-dark-secondary">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left"
        aria-expanded={expanded}
      >
        {Icon && (
          <Icon className="h-4 w-4 shrink-0 text-gray-900 dark:text-white/90" />
        )}
        <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-white/90">
          {category.title}
        </span>
        <ChevronDown2Icon
          className={cn(
            'h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-0.5 px-2 pb-3">
          {category.options.map((option) => (
            <FilterOption
              key={option.id}
              label={option.label}
              count={option.count}
              checked={selectedId === option.id}
              onChange={() => onSelectOption(option.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
