'use client';


import { DateRangePicker } from '../ui/date-range-picker';
import { SelectMenu } from '../ui/select-menu';
import { ModelLogDataTable } from '../ui/model-log-data-table';
import { apiFetch } from '../../lib/api/client';
import {
  buildModelLogPageRequest,
  extractModelLogList,
  MODEL_LOG_PAGE_DEFAULT_SIZE,
  MODEL_LOG_PAGE_PATH,
} from '../../lib/api/model-log-page';
import {
  mapRecordToModelLogRow,
  type ModelLogRow,
} from '../../lib/model-log-display';
import {
  fetchUsageConditions,
  toSelectOptions,
  type UsageConditionsData,
} from '../../lib/api/model-usage-conditions';
import { cn } from '../../lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';

const selectShell =
  'h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 dark:border-gray-700 dark:bg-white/5 dark:text-gray-200';

const selectMenuPanel = 'rounded-xl dark:bg-dark-secondary';

export default function LogsDashboard() {
  const localeTag = 'en-US';

  const [rangeFrom, setRangeFrom] = useState(() =>
    format(subDays(new Date(), 7), 'yyyy-MM-dd')
  );
  const [rangeTo, setRangeTo] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState('');
  const [pageNum, setPageNum] = useState(1);

  const [rows, setRows] = useState<ModelLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [conditions, setConditions] = useState<UsageConditionsData>({
    apiKeys: [],
    models: [],
    providers: [],
  });
  const [conditionsLoading, setConditionsLoading] = useState(true);
  const [conditionsError, setConditionsError] = useState<string | null>(null);

  const apiKeyOptions = useMemo(
    () => toSelectOptions(conditions.apiKeys),
    [conditions.apiKeys]
  );
  const modelOptions = useMemo(
    () => toSelectOptions(conditions.models),
    [conditions.models]
  );
  const providerOptions = useMemo(
    () => toSelectOptions(conditions.providers),
    [conditions.providers]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setConditionsLoading(true);
      setConditionsError(null);
      try {
        const data = await fetchUsageConditions();
        if (!cancelled) setConditions(data);
      } catch (e) {
        if (!cancelled) {
          setConditionsError((e as Error).message || String(e));
          setConditions({ apiKeys: [], models: [], providers: [] });
        }
      } finally {
        if (!cancelled) setConditionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (conditionsLoading || apiKeyOptions.length === 0) return;
    if (apiKey && !apiKeyOptions.some((o) => o.value === apiKey)) setApiKey('');
  }, [apiKey, apiKeyOptions, conditionsLoading]);

  useEffect(() => {
    if (conditionsLoading || modelOptions.length === 0) return;
    if (model && !modelOptions.some((o) => o.value === model)) setModel('');
  }, [model, modelOptions, conditionsLoading]);

  useEffect(() => {
    if (conditionsLoading || providerOptions.length === 0) return;
    if (provider && !providerOptions.some((o) => o.value === provider))
      setProvider('');
  }, [provider, providerOptions, conditionsLoading]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = buildModelLogPageRequest({
        rangeFrom,
        rangeTo,
        apiKey,
        model,
        provider,
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
  }, [apiKey, localeTag, model, pageNum, provider, rangeFrom, rangeTo]);

  useEffect(() => {
    setPageNum(1);
  }, [rangeFrom, rangeTo, apiKey, model, provider]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90 md:text-3xl">
          {'Logs'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {'An overview of your latest requests'}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        <div className="min-w-0 pr-0.5 sm:min-w-[12rem]">
          <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            {'Time'}
          </div>
          <DateRangePicker
            from={rangeFrom}
            to={rangeTo}
            onChange={({ from, to }) => {
              setRangeFrom(from);
              setRangeTo(to);
            }}
            placeholder={'Select date range'}
            ariaLabel={'Time'}
            panelClassName="dark:bg-dark-secondary"
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {'API Keys'}
          </label>
          <SelectMenu
            value={apiKey}
            options={apiKeyOptions}
            onChange={setApiKey}
            placeholder={
              conditionsLoading
                ? 'Loading filters…'
                : conditionsError
                  ? 'Failed to load filters'
                  : 'Select a Key'
            }
            ariaLabel={'API Keys'}
            clearable
            className="w-full min-w-0"
            buttonClassName={cn(selectShell, 'min-w-0')}
            menuClassName={selectMenuPanel}
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {'Models'}
          </label>
          <SelectMenu
            value={model}
            options={modelOptions}
            onChange={setModel}
            placeholder={
              conditionsLoading
                ? 'Loading filters…'
                : conditionsError
                  ? 'Failed to load filters'
                  : 'Select a Model'
            }
            ariaLabel={'Models'}
            clearable
            className="w-full min-w-0"
            buttonClassName={cn(selectShell, 'min-w-0')}
            menuClassName={selectMenuPanel}
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {'Provider'}
          </label>
          <SelectMenu
            value={provider}
            options={providerOptions}
            onChange={setProvider}
            placeholder={
              conditionsLoading
                ? 'Loading filters…'
                : conditionsError
                  ? 'Failed to load filters'
                  : 'Select a provider'
            }
            ariaLabel={'Provider'}
            clearable
            className="w-full min-w-0"
            buttonClassName={cn(selectShell, 'min-w-0')}
            menuClassName={selectMenuPanel}
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
          setPageNum((p) =>
            Math.min(
              Math.max(1, Math.ceil(total / MODEL_LOG_PAGE_DEFAULT_SIZE)),
              p + 1
            )
          )
        }
      />
    </div>
  );
}
