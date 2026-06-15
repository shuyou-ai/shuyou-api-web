'use client';

import { SearchIcon, XIcon } from '../../../../icons/icons';

type ModelSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ModelSearch({ value, onChange }: ModelSearchProps) {
  const hasValue = value.length > 0;

  return (
    <div className="relative w-full sm:w-72">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search models..."
        className={`h-10 w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-500 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90 dark:placeholder:text-gray-500 ${
          hasValue ? 'pr-9' : 'pr-4'
        }`}
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
          aria-label="Clear search"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
