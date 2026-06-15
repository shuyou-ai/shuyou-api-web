'use client';

import { useEffect, useState } from 'react';
import { fetchModelQueryConditions } from '../api';
import type { FilterCategory, FilterCategoryId, FilterSelections } from '../types';
import { FilterSection } from './filter-section';
import { FilterSkeleton } from './filter-skeleton';

function buildExpandedState(categories: FilterCategory[]) {
  return Object.fromEntries(
    categories.map((category) => [
      category.id,
      category.defaultExpanded ?? false,
    ])
  );
}

type ModelsFilterProps = {
  selections: FilterSelections;
  onSelect: (categoryId: FilterCategoryId, optionId: string) => void;
};

export function ModelsFilter({ selections, onSelect }: ModelsFilterProps) {
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadFilterConditions() {
      setLoading(true);
      setError(null);

      try {
        const nextCategories = await fetchModelQueryConditions();

        if (cancelled) return;

        setCategories(nextCategories);
        setExpandedSections(buildExpandedState(nextCategories));
      } catch {
        if (!cancelled) {
          setError('Failed to load filter conditions.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFilterConditions();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleExpand = (categoryId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSelect = (categoryId: FilterCategoryId, optionId: string) => {
    onSelect(categoryId, optionId);
  };

  if (loading) {
    return <FilterSkeleton />;
  }

  return (
    <aside className="w-full shrink-0 lg:w-[280px]">
      {error && (
        <div className="mb-3 rounded-lg border border-error-100 bg-error-50 px-3 py-2 text-xs text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-500">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {categories.map((category) => (
          <FilterSection
            key={category.id}
            category={category}
            expanded={expandedSections[category.id] ?? false}
            selectedId={selections[category.id as FilterCategoryId] || null}
            onToggleExpand={() => toggleExpand(category.id)}
            onSelectOption={(optionId) =>
              handleSelect(category.id as FilterCategoryId, optionId)
            }
          />
        ))}
      </div>
    </aside>
  );
}
