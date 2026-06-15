/**
 * POST /model/usage/conditions — 日志筛选下拉选项
 */

import { apiFetch } from './client';

export type UsageConditionsData = {
  apiKeys: string[];
  models: string[];
  providers: string[];
};

export type UsageConditionsResponse = {
  code: number;
  data?: UsageConditionsData;
  msg?: string;
  traceId?: string;
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (x == null ? '' : String(x).trim()))
    .filter((s) => s.length > 0);
}

export function parseUsageConditionsData(data: unknown): UsageConditionsData {
  if (!data || typeof data !== 'object') {
    return { apiKeys: [], models: [], providers: [] };
  }
  const d = data as Record<string, unknown>;
  return {
    apiKeys: asStringArray(d.apiKeys),
    models: asStringArray(d.models),
    providers: asStringArray(d.providers),
  };
}

export type UsageConditionSelectOption = { value: string; label: string };

export function toSelectOptions(
  values: string[]
): UsageConditionSelectOption[] {
  const seen = new Set<string>();
  const out: UsageConditionSelectOption[] = [];
  for (const raw of values) {
    const v = raw.trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push({ value: v, label: v });
  }
  return out;
}

/** 拉取日志页筛选项（apiKeys / models / providers） */
export async function fetchUsageConditions(): Promise<UsageConditionsData> {
  const res = await apiFetch('/model/usage/conditions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as UsageConditionsResponse;
  if (json.code !== 0) throw new Error(json.msg || `code ${json.code}`);
  return parseUsageConditionsData(json.data);
}
