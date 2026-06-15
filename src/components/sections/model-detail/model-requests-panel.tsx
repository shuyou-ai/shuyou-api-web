'use client';

import { useI18n } from '../../../lib/studio-text';
import { DateRangePicker } from '../../ui/date-range-picker';
import { ModelLogDataTable } from '../../ui/model-log-data-table';
import { apiFetch } from '../../../lib/api/client';
import {
  buildModelLogPageRequest,
  extractModelLogList,
  MODEL_LOG_PAGE_DEFAULT_SIZE,
  MODEL_LOG_PAGE_PATH,
} from '../../../lib/api/model-log-page';
import { mapRecordToModelLogRow, type ModelLogRow } from '../../../lib/model-log-display';
import { isLoggedInClient } from '../../../lib/auth/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';

type ModelRequestsPanelProps = {
  /** 与日志 query.model 一致，用于按模型过滤 */
  modelId: string;
};

export function ModelRequestsPanel({ modelId }: ModelRequestsPanelProps) {
  const { t } = useI18n();
  const router = useRouter();
  const localeTag = 'en-US';

  const [rangeFrom, setRangeFrom] = useState(() =>
    format(subDays(new Date(), 7), 'yyyy-MM-dd')
  );
  const [rangeTo, setRangeTo] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [pageNum, setPageNum] = useState(1);
  const [rows, setRows] = useState<ModelLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!modelId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const body = buildModelLogPageRequest({
        rangeFrom,
        rangeTo,
        apiKey: '',
        model: modelId.trim(),
        provider: '',
        pageNum,
        pageSize: MODEL_LOG_PAGE_DEFAULT_SIZE,
      });
      const res = await apiFetch(MODEL_LOG_PAGE_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        code: number;
        data?: unknown;
        msg?: string;
      };
      if (json.code !== 0) throw new Error(json.msg || `code ${json.code}`);
      const { list, total: t0 } = extractModelLogList(json.data);
      setTotal(t0);
      setRows(list.map((r) => mapRecordToModelLogRow(r, localeTag)));
    } catch (e) {
      setError((e as Error).message || String(e));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [localeTag, modelId, pageNum, rangeFrom, rangeTo]);

  useEffect(() => {
    setPageNum(1);
  }, [rangeFrom, rangeTo, modelId]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const totalPages = Math.max(1, Math.ceil(total / MODEL_LOG_PAGE_DEFAULT_SIZE));

  return (
    <div className="bg-white py-6 dark:bg-[#0d1424]">
      <div className="mx-auto max-w-[1656px] px-4 sm:px-6 lg:px-8">
        {!isLoggedInClient() ? (
          <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
            {t('modelDetail.requests.signInHint')}{' '}
            <button
              type="button"
              className="font-medium text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
              onClick={() =>
                router.push(
                  `/signin?redirect=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.pathname : '/models'
                  )}`
                )
              }
            >
              {t('modelDetail.requests.signInCta')}
            </button>
          </p>
        ) : null}

        <div className="mb-6 flex flex-nowrap items-center gap-3">
          <span className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('account.logs.filter.time')}
          </span>
          <div className="min-w-0 flex-1 sm:max-w-md">
            <DateRangePicker
              from={rangeFrom}
              to={rangeTo}
              onChange={({ from, to }) => {
                setRangeFrom(from);
                setRangeTo(to);
              }}
              placeholder={t('account.logs.filter.timePlaceholder')}
              ariaLabel={t('account.logs.filter.time')}
              panelClassName="dark:bg-dark-secondary"
            />
          </div>
        </div>

        <ModelLogDataTable
          rows={rows}
          loading={loading}
          error={error}
          total={total}
          pageNum={pageNum}
          pageSize={MODEL_LOG_PAGE_DEFAULT_SIZE}
          onPrevPage={() => setPageNum((p) => Math.max(1, p - 1))}
          onNextPage={() =>
            setPageNum((p) => Math.min(totalPages, p + 1))
          }
        />
      </div>
    </div>
  );
}
