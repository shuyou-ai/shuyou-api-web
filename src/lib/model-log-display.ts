/** Model request log table columns shared with account Logs */

export const MODEL_LOG_TABLE_COLUMNS = [
  'Timestamp',
  'Group',
  'Provider / Model',
  'Input Tokens',
  'Output Tokens',
  'Cost',
  'DISCOUNTOFF',
  'Duration(s)',
  'Finish',
] as const;

export type ModelLogRow = {
  id: string;
  timestamp: string;
  group: string;
  providerModel: string;
  inputTokens: string;
  outputTokens: string;
  cost: string;
  discountOff: string;
  firstLatency: string;
  totalLatency: string;
  finish: string;
};

export function formatLatencySeconds(value: string): string | null {
  if (!value || value === '—') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const formatted = Number.isInteger(n)
    ? String(n)
    : String(parseFloat(n.toFixed(2)));
  return `${formatted} s`;
}

export function fmtModelLogTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return s;
}

export function pickStr(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return '';
}

export function pickNum(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      if (Number.isFinite(n)) return String(n);
    }
  }
  return '—';
}

export function parseResponseErrorMessage(raw: string): string {
  if (!raw || raw === '—') return '';
  try {
    const parsed = JSON.parse(raw) as {
      error?: { message?: unknown };
      message?: unknown;
    };
    const nested = parsed?.error?.message;
    if (typeof nested === 'string' && nested.trim()) return nested;
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // ignore
  }
  return raw;
}

export function mapRecordToModelLogRow(
  item: Record<string, unknown>,
  localeTag: string
): ModelLogRow {
  const id =
    pickStr(item, ['id', 'logId', 'requestId']) ||
    `log-${Math.random().toString(36).slice(2)}`;

  const rawTime = pickStr(item, [
    'createTime',
    'createdAt',
    'timestamp',
    'requestTime',
    'logTime',
  ]);
  let timestamp = rawTime || '—';
  if (rawTime && /^\d+$/.test(rawTime.trim())) {
    const n = Number(rawTime);
    const ms = n < 1e12 ? n * 1000 : n;
    timestamp = new Date(ms).toLocaleString(localeTag);
  }

  const author = pickStr(item, ['author', 'provider', 'vendor', 'mfr']);
  const model = pickStr(item, ['model', 'modelName', 'modelId']);
  const providerModel =
    author && model
      ? `${author} / ${model}`
      : pickStr(item, ['providerModel', 'modelDesc', 'title']) ||
        (author || model || '—');

  const inputTokens = pickNum(item, [
    'inputTokens',
    'promptTokens',
    'input_token',
    'prompt_tokens',
  ]);
  const outputTokens = pickNum(item, [
    'outputTokens',
    'completionTokens',
    'output_token',
    'completion_tokens',
  ]);

  const costRaw = pickStr(item, ['cost']);
  const costUsdNum = pickNum(item, ['costUsd', 'totalCostUsd']);
  const cost =
    costRaw && costRaw !== '—'
      ? costRaw.startsWith('$')
        ? costRaw
        : `$${costRaw}`
      : costUsdNum !== '—'
        ? `$${costUsdNum}`
        : '—';

  const group = pickStr(item, ['group']) || '—';
  const discountOff = pickStr(item, ['discountOff']) || '';
  const firstLatency = pickNum(item, ['firstLatency', 'first_latency']);
  const totalLatency = pickNum(item, ['totalLatency', 'total_latency']);
  const status = pickStr(item, ['status']) || '—';
  const responseErrorRaw = pickStr(item, ['responseError', 'response_error']);
  const responseErrorMsg = parseResponseErrorMessage(responseErrorRaw);
  const finish =
    status.toLowerCase() === 'failed' && responseErrorMsg
      ? `${status}: ${responseErrorMsg}`
      : status;

  return {
    id,
    timestamp,
    group,
    providerModel,
    inputTokens,
    outputTokens,
    cost,
    discountOff,
    firstLatency,
    totalLatency,
    finish,
  };
}
