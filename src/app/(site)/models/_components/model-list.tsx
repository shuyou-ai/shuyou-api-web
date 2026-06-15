'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildModelPageRequest,
  fetchModelPage,
  getModelPageRecords,
  getModelPageTotal,
} from '../api';
import type { FilterSelections, ModelItem } from '../types';
import { DEFAULT_MODEL_PAGE_REQUEST } from '../types';
import { ModelCard } from './model-card';
import { useModelIdCopyFeedback } from './model-id-copy-button';

type ModelListStats = {
  loaded: number;
  total: number;
};

type ModelListProps = {
  selections: FilterSelections;
  searchName: string;
  onStatsChange?: (stats: ModelListStats | null) => void;
};

function ModelListSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-0 border-l border-t border-[#F5F5F5] dark:border-gray-700 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="h-72 animate-pulse border-b border-r border-[#F5F5F5] bg-white p-6 dark:border-gray-700 dark:bg-dark-primary"
        />
      ))}
    </ul>
  );
}

export function ModelList({
  selections,
  searchName,
  onStatsChange,
}: ModelListProps) {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const pageNumRef = useRef(1);
  const modelsLengthRef = useRef(0);
  const totalRef = useRef(0);
  const { copiedRowId, acknowledgeCopied } = useModelIdCopyFeedback();

  const pageSize = DEFAULT_MODEL_PAGE_REQUEST.pageSize;
  const hasMore = models.length < total;

  modelsLengthRef.current = models.length;
  totalRef.current = total;

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      if (loadingRef.current) return;

      loadingRef.current = true;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const data = await fetchModelPage(
          buildModelPageRequest(selections, {
            pageNum: page,
            pageSize,
            query: { name: searchName },
          })
        );

        if (!data) {
          if (!append) {
            setModels([]);
            setTotal(0);
            setError('Failed to load models.');
          }
          return;
        }

        const records = getModelPageRecords(data);
        setTotal(getModelPageTotal(data));
        setModels((prev) => (append ? [...prev, ...records] : records));
        pageNumRef.current = page;
      } catch {
        if (!append) {
          setModels([]);
          setTotal(0);
          setError('Failed to load models.');
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize, searchName, selections]
  );

  useEffect(() => {
    pageNumRef.current = 1;
    void loadPage(1, false);
  }, [selections, searchName, loadPage]);

  useEffect(() => {
    if (!onStatsChange) return;
    if (loading || error || total <= 0) {
      onStatsChange(null);
      return;
    }
    onStatsChange({ loaded: models.length, total });
  }, [error, loading, models.length, onStatsChange, total]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingRef.current) return;
        if (modelsLengthRef.current >= totalRef.current) return;

        void loadPage(pageNumRef.current + 1, true);
      },
      { rootMargin: '800px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, models.length, total, loadPage]);

  if (loading) {
    return (
      <div className="min-w-0 flex-1">
        <ModelListSkeleton />
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      {error && (
        <div className="mb-4 rounded-lg border border-error-100 bg-error-50 px-3 py-2 text-xs text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-500">
          {error}
        </div>
      )}

      {models.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-gray-500 dark:border-gray-800 dark:bg-dark-secondary dark:text-gray-400">
          No models found.
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-0 border-l border-t border-[#F5F5F5] dark:border-gray-700 lg:grid-cols-2 xl:grid-cols-3">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                copied={copiedRowId === model.id}
                onCopyModelId={() => acknowledgeCopied(model.id)}
              />
            ))}
          </ul>

          <div
            ref={sentinelRef}
            className="pointer-events-none h-4 w-full shrink-0"
            aria-hidden
          />

          {loadingMore && (
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading more...
            </p>
          )}

          {!hasMore && (
            <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
              All models loaded.
            </p>
          )}
        </>
      )}
    </div>
  );
}
