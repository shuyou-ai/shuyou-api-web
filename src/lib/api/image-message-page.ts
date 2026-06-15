import { apiFetch } from './client';
import { readCostUsdFromRecord } from '../format-usd-cost';

/** POST /api/image/message/page 请求体（与后端约定一致） */
export type ImageMessagePageQuery = {
  name: string;
  inputModalities: unknown[];
  outputModalities: unknown[];
  contextLength: null;
  author: string;
  provider: string;
};

export type ImageMessagePageRequest = {
  pageNum: number;
  pageSize: number;
  sort: string;
  order: string;
  query: ImageMessagePageQuery;
};

export const DEFAULT_IMAGE_MESSAGE_PAGE_BODY: ImageMessagePageRequest = {
  pageNum: 1,
  pageSize: 10,
  sort: 'responseTime',
  order: 'desc',
  query: {
    name: '',
    inputModalities: [],
    outputModalities: [],
    contextLength: null,
    author: '',
    provider: '',
  },
};

export const IMAGE_MESSAGE_PAGE_SIZE = DEFAULT_IMAGE_MESSAGE_PAGE_BODY.pageSize;

function extractListAndTotal(data: unknown): {
  list: Record<string, unknown>[];
  total: number;
} {
  if (!data || typeof data !== 'object') return { list: [], total: 0 };
  const d = data as Record<string, unknown>;
  const total = Number(d.total ?? d.totalRow ?? d.totalCount ?? 0) || 0;
  const raw = d.rows ?? d.records ?? d.list ?? d.data;
  const list = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  return { list, total };
}

function pickStr(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/** 接口里 `output` / `params` 常为 JSON 字符串 */
function tryParseJsonArray(raw: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(raw)) {
    return raw.filter((x) => x && typeof x === 'object') as Record<string, unknown>[];
  }
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return null;
    return v.filter((x) => x && typeof x === 'object') as Record<string, unknown>[];
  } catch {
    return null;
  }
}

function tryParseJsonObject(raw: unknown): Record<string, unknown> | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    return v as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickFirstImageUrl(obj: Record<string, unknown>): string {
  const direct = pickStr(obj, [
    'imageUrl',
    'image',
    'fileUrl',
    'url',
    'resultUrl',
    'outputUrl',
    'coverUrl',
    'thumbnail',
  ]);
  if (direct) return direct;

  const outputItems = tryParseJsonArray(obj.output);
  if (outputItems) {
    for (const el of outputItems) {
      const u = pickStr(el, ['image', 'url', 'fileUrl']);
      if (u) return u;
    }
  }

  const dataList = obj.dataList;
  if (Array.isArray(dataList)) {
    for (const el of dataList) {
      if (!el || typeof el !== 'object') continue;
      const u = pickStr(el as Record<string, unknown>, ['fileUrl', 'url', 'image']);
      if (u) return u;
    }
  }

  return '';
}

function readAllReferenceImagesFromParams(
  paramsObj: Record<string, unknown> | null
): string[] {
  if (!paramsObj) return [];
  for (const key of ['image_urls', 'imageUrls'] as const) {
    const raw = paramsObj[key];
    if (!Array.isArray(raw)) continue;
    const urls: string[] = [];
    for (const el of raw) {
      if (typeof el === 'string' && el.trim()) {
        urls.push(el.trim());
      }
    }
    if (urls.length > 0) return urls;
  }
  return [];
}

/**
 * 将 `/api/image/message/page` 单条 `rows` 记录映射为前端列表项。
 * 后端：`output` 为 JSON 字符串（如 `[{"type":"image","image":"..."}]`），
 * `params` 为 JSON 字符串（含 prompt、aspect_ratio、resolution 等）。
 */
export function mapImageMessageRecordToGenLike(item: Record<string, unknown>): {
  id: string;
  prompt: string;
  model: string;
  aspect: string;
  resolution: string;
  imageUrl?: string;
  /** params.image_urls / imageUrls 列表，用于列表展示参考图 */
  referenceImageUrls?: string[];
  /** 花费（美元），如 `$0.01` */
  costUsd?: string;
} {
  const id =
    pickStr(item, ['id', 'messageId', 'taskId', 'task_id', 'recordId']) ||
    `msg-${Math.random().toString(36).slice(2, 11)}`;

  const paramsObj = tryParseJsonObject(item.params);

  const prompt =
    pickStr(item, ['prompt', 'content', 'input', 'description', 'text', 'message']) ||
    (paramsObj ? pickStr(paramsObj, ['prompt']) : '');

  const model = pickStr(item, [
    'model',
    'modelId',
    'model_id',
    'modelName',
    'model_name',
  ]);

  const aspect =
    pickStr(item, ['aspect_ratio', 'aspectRatio', 'aspect']) ||
    (paramsObj ? pickStr(paramsObj, ['aspect_ratio', 'aspectRatio', 'aspect']) : '');

  const resolution =
    pickStr(item, ['resolution', 'quality']) ||
    (paramsObj ? pickStr(paramsObj, ['resolution', 'quality']) : '');

  const imageUrl = pickFirstImageUrl(item) || undefined;
  const referenceImageUrls = readAllReferenceImagesFromParams(paramsObj);
  const costUsd = readCostUsdFromRecord(item);

  return {
    id,
    prompt,
    model,
    aspect,
    resolution,
    imageUrl,
    referenceImageUrls,
    costUsd,
  };
}

export type ImageMessagePageResult = {
  records: ReturnType<typeof mapImageMessageRecordToGenLike>[];
  total: number;
};

/**
 * 分页拉取生图消息列表。
 * `order: desc` 时单页内从新到旧，调用方需按时间轴自行反转再拼接。
 */
export async function fetchImageMessagePage(
  pageNum: number,
  init?: RequestInit
): Promise<ImageMessagePageResult> {
  const body: ImageMessagePageRequest = {
    ...DEFAULT_IMAGE_MESSAGE_PAGE_BODY,
    pageNum,
  };
  const res = await apiFetch('/api/image/message/page', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as {
    code?: number;
    msg?: string;
    data?: unknown;
  };
  if (json.code !== undefined && json.code !== 0) {
    throw new Error(json.msg || `code ${json.code}`);
  }
  if (Array.isArray(json.data)) {
    const list = json.data as Record<string, unknown>[];
    const records = list.map((row) => mapImageMessageRecordToGenLike(row));
    return { records, total: 0 };
  }
  const { list, total } = extractListAndTotal(json.data);
  const records = list.map((row) => mapImageMessageRecordToGenLike(row));
  return { records, total };
}

/** 删除单条生图历史记录：`POST /ai/image/message/delete`，body 为 `[id]` */
export async function deleteImageMessage(
  id: string,
  signal?: AbortSignal
): Promise<void> {
  const trimmed = id.trim();
  if (!trimmed) throw new Error('Missing message id');

  const res = await apiFetch('/ai/image/message/delete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify([trimmed]),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { code?: number; msg?: string };
  if (json.code !== undefined && json.code !== 0) {
    throw new Error(json.msg || `API code ${json.code}`);
  }
}
