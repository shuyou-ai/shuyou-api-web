'use client';


import {
  fmtModelLogTemplate,
  formatLatencySeconds,
  MODEL_LOG_TABLE_COLUMNS,
  type ModelLogRow,
} from '../../lib/model-log-display';
import { cn } from '../../lib/utils';

function ModelLogLatencyBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const formatted = formatLatencySeconds(value);
  if (!formatted) return null;

  return (
    <span
      title={label}
      className="inline-flex items-center whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
    >
      {formatted}
    </span>
  );
}

function ModelLogDurationCell({ row }: { row: ModelLogRow }) {
  const first = formatLatencySeconds(row.firstLatency);
  const total = formatLatencySeconds(row.totalLatency);

  if (!first && !total) {
    return <span>—</span>;
  }

  const firstNum = Number(row.firstLatency);
  const totalNum = Number(row.totalLatency);
  const sameLatency =
    Number.isFinite(firstNum) &&
    Number.isFinite(totalNum) &&
    firstNum === totalNum;

  if (sameLatency && first) {
    return (
      <ModelLogLatencyBadge label="Latency" value={row.firstLatency} />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {first ? (
        <ModelLogLatencyBadge label="First latency" value={row.firstLatency} />
      ) : null}
      {total ? (
        <ModelLogLatencyBadge label="Total latency" value={row.totalLatency} />
      ) : null}
    </div>
  );
}

export type ModelLogDataTableProps = {
  rows: ModelLogRow[];
  loading: boolean;
  error: string | null;
  total: number;
  pageNum: number;
  pageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function ModelLogDataTable({
  rows,
  loading,
  error,
  total,
  pageNum,
  pageSize,
  onPrevPage,
  onNextPage,
}: ModelLogDataTableProps) {
  
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-dark-secondary">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {MODEL_LOG_TABLE_COLUMNS.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="whitespace-nowrap bg-gray-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-white/[0.03] dark:text-gray-400"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={MODEL_LOG_TABLE_COLUMNS.length}
                  className="px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {'Loading…'}
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={MODEL_LOG_TABLE_COLUMNS.length}
                  className="px-4 py-16 text-center text-sm text-red-600 dark:text-red-400"
                >
                  {'Failed to load logs.'} {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={MODEL_LOG_TABLE_COLUMNS.length}
                  className="px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {'No logs in this range.'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 last:border-b-0 dark:border-gray-800"
                >
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {row.timestamp}
                  </td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-gray-800 dark:text-gray-200">
                    {row.group}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-gray-800 dark:text-gray-200">
                    {row.providerModel}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-800 tabular-nums dark:text-gray-200">
                    {row.inputTokens}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-800 tabular-nums dark:text-gray-200">
                    {row.outputTokens}
                  </td>
                  <td className="px-4 py-3 text-gray-800 tabular-nums dark:text-gray-200">
                    {row.cost}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {row.discountOff ? (
                      <span className="inline-flex items-center whitespace-nowrap rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                        {row.discountOff}% off
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    <ModelLogDurationCell row={row} />
                  </td>
                  <td
                    className="max-w-[140px] truncate px-4 py-3 text-gray-800 dark:text-gray-200"
                    title={row.finish}
                  >
                    {row.finish}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && total > 0 ? (
        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {fmtModelLogTemplate('{total} records · page {page} of {pages}', {
              total,
              page: pageNum,
              pages: totalPages,
            })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pageNum <= 1}
              onClick={onPrevPage}
              className={cn(
                'h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:enabled:hover:bg-white/5'
              )}
            >
              {'Previous'}
            </button>
            <button
              type="button"
              disabled={pageNum >= totalPages}
              onClick={onNextPage}
              className={cn(
                'h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:enabled:hover:bg-white/5'
              )}
            >
              {'Next'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
