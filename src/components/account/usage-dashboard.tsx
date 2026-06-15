'use client';


import {
  normalizeUsagePeriod,
  UsagePeriodPicker,
  type UsageGranularity,
} from './usage-period-picker';
import { SelectMenu } from '../ui/select-menu';
import {
  fetchUsageConditions,
  toSelectOptions,
  type UsageConditionsData,
} from '../../lib/api/model-usage-conditions';
import { apiFetch } from '../../lib/api/client';
import { cn } from '../../lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
} from 'recharts';

const GRANULARITY_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] as const;

type UsageAnalyticsData = {
  requests: string;
  spend: string;
  tokens: string;
  dataList?: Array<{
    date?: string;
    model?: string;
    spend?: number;
    tokens?: number;
    requests?: number;
  }>;
  dateList?: string[];
  spendList?: number[];
  tokensList?: number[];
  requestsList?: number[];
};

type UsageAnalyticsResponse = {
  code: number;
  data?: UsageAnalyticsData;
  msg?: string;
};

function num(n: unknown): number {
  const x = typeof n === 'number' ? n : typeof n === 'string' ? Number(n) : NaN;
  return Number.isFinite(x) ? x : 0;
}

function buildLineSeriesFromLists(
  dateList: string[] | undefined,
  valueList: unknown[] | undefined
): Array<{ date: string; value: number }> {
  const xs = dateList ?? [];
  const ys = valueList ?? [];
  const out: Array<{ date: string; value: number }> = [];
  for (let i = 0; i < xs.length; i += 1) {
    out.push({ date: String(xs[i] ?? ''), value: num(ys[i]) });
  }
  return out;
}

function formatDateLabel(raw: string): string {
  const s = String(raw ?? '').trim();
  if (/^\d{4}$/.test(s)) return `${s.slice(0, 2)}-${s.slice(2, 4)}`;
  return s;
}

function stableColor(index: number): string {
  const hues = [224, 262, 188, 28, 142, 332, 92, 12, 48, 200];
  const h = hues[index % hues.length] ?? 224;
  return `hsl(${h} 78% 56%)`;
}

type StackedSeries = {
  data: Array<{ date: string } & Record<string, number>>;
  keys: string[];
  colors: Record<string, string>;
};

function buildStackedSeriesFromDataList(
  dataList: UsageAnalyticsData['dataList'] | undefined,
  metric: 'spend' | 'tokens' | 'requests',
  dateOrder?: string[],
  maxKeys = 7
): StackedSeries {
  const byDate = new Map<string, Map<string, number>>();
  const totalsByModel = new Map<string, number>();

  for (const it of dataList ?? []) {
    const d = String(it?.date ?? '').trim();
    const m = String(it?.model ?? '').trim();
    if (!d || !m) continue;
    const vRaw = (it as Record<string, unknown>)[metric];
    const v = num(vRaw);
    if (v === 0) continue;

    let modelMap = byDate.get(d);
    if (!modelMap) {
      modelMap = new Map<string, number>();
      byDate.set(d, modelMap);
    }
    modelMap.set(m, (modelMap.get(m) ?? 0) + v);
    totalsByModel.set(m, (totalsByModel.get(m) ?? 0) + v);
  }

  // IMPORTANT: if backend provides dateList, we must keep ALL dates on x-axis,
  // even if values are all zero for that date.
  const allDates =
    dateOrder && dateOrder.length > 0
      ? dateOrder.map((d) => String(d))
      : Array.from(byDate.keys()).sort();

  const modelsSorted = Array.from(totalsByModel.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([m]) => m);

  const keys = modelsSorted.slice(0, maxKeys);
  const rest = modelsSorted.slice(maxKeys);
  const otherKey = rest.length > 0 ? '__other__' : null;

  const data = allDates.map((date) => {
    const row: { date: string } & Record<string, number> = { date };
    for (const k of keys) row[k] = 0;
    if (otherKey) row[otherKey] = 0;

    const modelMap = byDate.get(date);
    if (modelMap) {
      for (const [m, v] of modelMap.entries()) {
        if (keys.includes(m)) row[m] = (row[m] ?? 0) + v;
        else if (otherKey) row[otherKey] = (row[otherKey] ?? 0) + v;
      }
    }
    return row;
  });

  const finalKeys = otherKey ? keys.concat(otherKey) : keys;
  const colors: Record<string, string> = {};
  for (let i = 0; i < keys.length; i += 1) colors[keys[i]!] = stableColor(i);
  if (otherKey) colors[otherKey] = 'hsl(215 12% 62%)';

  return { data, keys: finalKeys, colors };
}

function UsageTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const dateRaw = (payload[0]?.payload as { date?: string } | undefined)?.date ?? '';
  const title = formatDateLabel(String(dateRaw));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-theme-md dark:border-gray-700 dark:bg-dark-secondary dark:text-gray-200">
      <div className="mb-2 font-semibold text-gray-900 dark:text-white/90">
        {title || '—'}
      </div>
      <div className="space-y-1">
        {payload
          .filter((p) => (p.value as number | undefined) != null)
          .map((p) => {
            const key = String(p.dataKey ?? '');
            const isOther = key === '__other__';
            const name = isOther ? 'Other' : key;
            const v = typeof p.value === 'number' ? p.value : Number(p.value);
            return (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="truncate" style={{ color: String(p.color ?? '') }}>
                  {name}
                </span>
                <span className="font-medium tabular-nums text-gray-900 dark:text-white/90">
                  {Number.isFinite(v) ? v : 0}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

const selectShell =
  'h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 dark:border-gray-700 dark:bg-white/5 dark:text-gray-200';

const selectMenuPanel = 'rounded-xl dark:bg-dark-secondary';

const DEFAULT_PERIOD_ANCHOR = format(new Date(), 'yyyy-MM-dd');

export default function UsageDashboard() {
  
  const [granularity, setGranularity] = useState<UsageGranularity>('day');
  const [periodAnchor, setPeriodAnchor] = useState(DEFAULT_PERIOD_ANCHOR);
  const [apiKeyFilter, setApiKeyFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');

  const [conditions, setConditions] = useState<UsageConditionsData>({
    apiKeys: [],
    models: [],
    providers: [],
  });
  const [conditionsLoading, setConditionsLoading] = useState(true);
  const [conditionsError, setConditionsError] = useState<string | null>(null);

  const granularityOptions = useMemo(
    () =>
      GRANULARITY_OPTIONS.map((o) => ({
        value: o.value,
        label: o.label,
      })),
    []
  );

  const apiKeyOptions = useMemo(() => {
    if (conditionsLoading || conditionsError) return [];
    return toSelectOptions(conditions.apiKeys);
  }, [conditions.apiKeys, conditionsError, conditionsLoading]);

  const modelOptions = useMemo(() => {
    if (conditionsLoading || conditionsError) return [];
    return toSelectOptions(conditions.models);
  }, [conditions.models, conditionsError, conditionsLoading]);

  const [analytics, setAnalytics] = useState<UsageAnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

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
    if (conditionsLoading) return;
    if (apiKeyFilter && !apiKeyOptions.some((o) => o.value === apiKeyFilter)) {
      setApiKeyFilter('');
    }
  }, [apiKeyFilter, apiKeyOptions, conditionsLoading]);

  useEffect(() => {
    if (conditionsLoading) return;
    if (modelFilter && !modelOptions.some((o) => o.value === modelFilter)) {
      setModelFilter('');
    }
  }, [conditionsLoading, modelFilter, modelOptions]);

  // 后端请求参数用：day=yyyy-MM-dd，month=yyyy-MM，year=yyyy
  const periodParam = useMemo(() => {
    switch (granularity) {
      case 'year':
        return periodAnchor.slice(0, 4);
      case 'month':
        return periodAnchor.slice(0, 7);
      default:
        return periodAnchor;
    }
  }, [granularity, periodAnchor]);

  const fetchAnalytics = useCallback(async () => {
    if (!periodParam) {
      setAnalytics(null);
      return;
    }
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const body = {
        type: granularity,
        date: periodParam,
        model: modelFilter || '',
        apiKey: apiKeyFilter || '',
      };
      const res = await apiFetch('/model/usage/analytics', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as UsageAnalyticsResponse;
      if (json.code !== 0) throw new Error(json.msg || `code ${json.code}`);
      setAnalytics(json.data ?? null);
    } catch (e) {
      setAnalytics(null);
      setAnalyticsError((e as Error).message || String(e));
    } finally {
      setAnalyticsLoading(false);
    }
  }, [apiKeyFilter, granularity, modelFilter, periodParam]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const totals = useMemo(() => {
    const spend = Number(analytics?.spend ?? 0);
    const tokens = Number(analytics?.tokens ?? 0);
    const requests = Number(analytics?.requests ?? 0);
    return {
      spend: Number.isFinite(spend) ? spend : 0,
      tokens: Number.isFinite(tokens) ? tokens : 0,
      requests: Number.isFinite(requests) ? requests : 0,
    };
  }, [analytics]);

  const spendStacked = useMemo(
    () =>
      buildStackedSeriesFromDataList(
        analytics?.dataList,
        'spend',
        analytics?.dateList
      ),
    [analytics]
  );
  const requestsStacked = useMemo(
    () =>
      buildStackedSeriesFromDataList(
        analytics?.dataList,
        'requests',
        analytics?.dateList
      ),
    [analytics]
  );
  const tokensStacked = useMemo(
    () =>
      buildStackedSeriesFromDataList(
        analytics?.dataList,
        'tokens',
        analytics?.dateList
      ),
    [analytics]
  );

  const spendLine = useMemo(
    () => buildLineSeriesFromLists(analytics?.dateList, analytics?.spendList),
    [analytics]
  );
  const requestsLine = useMemo(
    () =>
      buildLineSeriesFromLists(analytics?.dateList, analytics?.requestsList),
    [analytics]
  );
  const tokensLine = useMemo(
    () => buildLineSeriesFromLists(analytics?.dateList, analytics?.tokensList),
    [analytics]
  );

  const handleGranularityChange = (next: string) => {
    const g = next as UsageGranularity;
    setGranularity(g);
    setPeriodAnchor((prev) =>
      normalizeUsagePeriod(g, prev, DEFAULT_PERIOD_ANCHOR)
    );
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90 md:text-3xl">
          {'API Usage'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {'Your usage across models'}
        </p>
      </div>

      <div className="mb-8 flex flex-col flex-wrap gap-3 lg:flex-row lg:items-center">
        <SelectMenu
          value={granularity}
          options={granularityOptions}
          onChange={handleGranularityChange}
          ariaLabel={'Granularity'}
          className="w-full min-w-0 lg:w-40"
          buttonClassName={cn(selectShell, 'min-w-0')}
          menuClassName={selectMenuPanel}
        />
        <div className="flex-1 min-w-0 max-w-54 lg:flex-1">
          <UsagePeriodPicker
            granularity={granularity}
            value={periodAnchor}
            onChange={(next) => {
              if (!next) {
                setPeriodAnchor('');
                return;
              }
              setPeriodAnchor(
                normalizeUsagePeriod(granularity, next, DEFAULT_PERIOD_ANCHOR)
              );
            }}
            placeholder={'Period (UTC)'}
            ariaLabel={'Period (UTC)'}
            buttonClassName={cn(
              selectShell,
              'min-w-0 lg:flex-1 dark:bg-dark-secondary dark:text-gray-200 dark:hover:bg-white/5',
            )}
            panelClassName="rounded-xl dark:bg-dark-secondary"
            clearable
          />
          <span className="sr-only" data-usage-period={periodParam} />
        </div>
        <SelectMenu
          value={apiKeyFilter}
          options={apiKeyOptions}
          onChange={setApiKeyFilter}
          ariaLabel={'All API Keys'}
          placeholder={
            conditionsLoading
              ? 'Loading…'
              : conditionsError
                ? 'Failed to load options'
                : 'API key'
          }
          clearable
          className="w-full min-w-0 lg:w-50"
          buttonClassName={cn(selectShell, 'min-w-0')}
          menuClassName={selectMenuPanel}
        />
        <SelectMenu
          value={modelFilter}
          options={modelOptions}
          onChange={setModelFilter}
          ariaLabel={'All Models'}
          placeholder={
            conditionsLoading
              ? 'Loading…'
              : conditionsError
                ? 'Failed to load options'
                : 'Model key'
          }
          clearable
          className="w-full min-w-0 lg:w-44"
          buttonClassName={cn(selectShell, 'min-w-0')}
          menuClassName={selectMenuPanel}
        />
      </div>

      {analyticsError ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {'Failed to load analytics'}: {analyticsError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(
          [
            {
              key: 'spend',
              title: 'Spend',
              total: analyticsLoading ? '—' : `$${totals.spend.toFixed(6)}`,
              stacked: spendStacked,
            },
            {
              key: 'requests',
              title: 'Requests',
              total: analyticsLoading ? '—' : `${totals.requests.toLocaleString()}`,
              stacked: requestsStacked,
            },
            {
              key: 'tokens',
              title: 'Tokens',
              total: analyticsLoading ? '—' : `${totals.tokens.toLocaleString()}`,
              stacked: tokensStacked,
            },
          ] as const
        ).map((card) => (
          (() => {
            const first = card.stacked.data[0]?.date
              ? formatDateLabel(card.stacked.data[0].date)
              : '—';
            const last = card.stacked.data[card.stacked.data.length - 1]?.date
              ? formatDateLabel(card.stacked.data[card.stacked.data.length - 1].date)
              : '—';
            return (
          <div
            key={card.key}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-dark-secondary"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">
              {card.total}
            </p>

            <div className="mt-4 h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={card.stacked.data}>
                  <Tooltip
                    cursor={false}
                    content={<UsageTooltip />}
                  />
                  {card.stacked.keys.map((k, idx) => (
                    <Bar
                      key={k}
                      dataKey={k}
                      stackId="a"
                      fill={card.stacked.colors[k] ?? stableColor(idx)}
                      radius={
                        idx === card.stacked.keys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]
                      }
                      isAnimationActive={false}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate">{first}</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {last}
              </span>
            </div>
          </div>
            );
          })()
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4">
        {(
          [
            {
              key: 'spend-line',
              title: 'Total  Spend  Usage',
              data: spendLine,
              stroke: '#3B82F6', // modern blue
            },
            {
              key: 'requests-line',
              title: 'Total API Requests',
              data: requestsLine,
              stroke: '#10B981', // modern emerald
            },
            {
              key: 'tokens-line',
              title: 'Total Token Usage',
              data: tokensLine,
              stroke: '#8B5CF6', // modern violet
            },
          ] as const
        ).map((ch) => (
          <div
            key={ch.key}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-dark-secondary"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {ch.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {ch.data[0]?.date ? formatDateLabel(ch.data[0].date) : '—'} –{' '}
                {ch.data[ch.data.length - 1]?.date
                  ? formatDateLabel(ch.data[ch.data.length - 1].date)
                  : '—'}
              </p>
            </div>

            <div className="mt-4 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ch.data} margin={{ left: 4, right: 4, top: 6, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => formatDateLabel(String(v))}
                    interval="preserveStartEnd"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#98A2B3' }}
                    height={18}
                  />
                  <Tooltip
                    cursor={false}
                    content={<UsageTooltip />}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={ch.title}
                    stroke={ch.stroke}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.95}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
