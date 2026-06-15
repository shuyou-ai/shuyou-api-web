'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FilterCategoryId, FilterSelections } from '../types';
import { DEFAULT_FILTER_SELECTIONS } from '../types';
import { ModelList } from './model-list';
import { ModelSearch } from './model-search';
import { ModelsFilter } from './models-filter';

export function ModelsPage() {
  const [selections, setSelections] = useState<FilterSelections>(
    DEFAULT_FILTER_SELECTIONS
  );
  const [searchInput, setSearchInput] = useState('');
  const [searchName, setSearchName] = useState('');
  const [listStats, setListStats] = useState<{
    loaded: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchName(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleSelect = useCallback(
    (categoryId: FilterCategoryId, optionId: string) => {
      setSelections((prev) => ({
        ...prev,
        [categoryId]: prev[categoryId] === optionId ? '' : optionId,
      }));
    },
    []
  );

  return (
    <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-7 lg:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-5">
        <ModelsFilter selections={selections} onSelect={handleSelect} />

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-col gap-4 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-baseline gap-2 sm:gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
                Models
              </h1>
              {listStats ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {listStats.loaded} / {listStats.total} Models
                </p>
              ) : null}
            </div>
            <ModelSearch value={searchInput} onChange={setSearchInput} />
          </div>

          <ModelList
            selections={selections}
            searchName={searchName}
            onStatsChange={setListStats}
          />
        </div>
      </div>
    </main>
  );
}
