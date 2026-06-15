import { apiFetch } from './client';
import { readCostUsdFromRecord } from '../format-usd-cost';

/** POST /api/video/message/page 请求体（与后端约定一致） */
export type VideoMessagePageQuery = {
  name: string;
  inputModalities: unknown[];
  outputModalities: unknown[];
  contextLength: null;
  author: string;
  provider: string;
};

export type VideoMessagePageRequest = {
  pageNum: number;
  pageSize: number;
  sort: string;
  order: string;
  query: VideoMessagePageQuery;
};

export const DEFAULT_VIDEO_MESSAGE_PAGE_BODY: VideoMessagePageRequest = {
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

export const VIDEO_MESSAGE_PAGE_SIZE = DEFAULT_VIDEO_MESSAGE_PAGE_BODY.pageSize;

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

/** 读取 params 中的标量（支持 number，如 duration: 10） */
function readScalarField(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = obj[key];
    if (v == null) continue;
    if (typeof v === 'number' && Number.isFinite(v)) {
      return Number.isInteger(v) ? String(Math.trunc(v)) : String(v);
    }
    if (typeof v === 'string') {
      const s = v.trim();
      if (s) return s;
    }
  }
  return '';
}

const DURATION_FIELD_KEYS = [
  'duration',
  'video_duration',
  'videoDuration',
  'length',
] as const;

/** 优先从 params.duration 读取（与后端存储一致） */
function readDurationFromRecord(
  item: Record<string, unknown>,
  paramsObj: Record<string, unknown> | null
): string {
  if (paramsObj) {
    const fromParams = readScalarField(paramsObj, [...DURATION_FIELD_KEYS]);
    if (fromParams) return fromParams;
    const inputObj = tryParseJsonObject(paramsObj.input);
    if (inputObj) {
      const fromInput = readScalarField(inputObj, [...DURATION_FIELD_KEYS]);
      if (fromInput) return fromInput;
    }
  }
  return readScalarField(item, [...DURATION_FIELD_KEYS]);
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

function pickFirstVideoUrl(obj: Record<string, unknown>): string {
  const direct = pickStr(obj, [
    'videoUrl',
    'video',
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
      const u = pickStr(el, ['video', 'url', 'fileUrl']);
      if (u) return u;
    }
  }

  const dataList = obj.dataList;
  if (Array.isArray(dataList)) {
    for (const el of dataList) {
      if (!el || typeof el !== 'object') continue;
      const u = pickStr(el as Record<string, unknown>, ['fileUrl', 'url', 'video']);
      if (u) return u;
    }
  }

  return '';
}

/** 参考图在列表中的展示方式 */
export type VideoReferenceImageLayout = 'default' | 'first-frame' | 'first-last-frame';

function readFrameUrlsFromParamsObject(
  obj: Record<string, unknown>
): { urls: string[]; layout: VideoReferenceImageLayout } | null {
  const first = pickStr(obj, ['first_frame_url', 'firstFrameUrl']);
  const last = pickStr(obj, ['last_frame_url', 'lastFrameUrl']);
  if (!first && !last) return null;
  const urls: string[] = [];
  if (first) urls.push(first);
  if (last && last !== first) urls.push(last);
  return {
    urls,
    layout: last ? 'first-last-frame' : 'first-frame',
  };
}

function readUrlArrayFromParamsObject(obj: Record<string, unknown>): string[] {
  for (const key of [
    'image_urls',
    'imageUrls',
    'reference_image_urls',
    'referenceImageUrls',
  ] as const) {
    const raw = obj[key];
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

function readReferenceImagesFromParams(paramsObj: Record<string, unknown> | null): {
  urls: string[];
  layout: VideoReferenceImageLayout;
} {
  if (!paramsObj) return { urls: [], layout: 'default' };

  const directFrames = readFrameUrlsFromParamsObject(paramsObj);
  if (directFrames) return directFrames;

  const inputObj = tryParseJsonObject(paramsObj.input);
  if (inputObj) {
    const fromInput = readFrameUrlsFromParamsObject(inputObj);
    if (fromInput) return fromInput;
  }

  const arrayUrls = readUrlArrayFromParamsObject(paramsObj);
  if (arrayUrls.length > 0) {
    return { urls: arrayUrls, layout: 'default' };
  }
  if (inputObj) {
    const fromInputArray = readUrlArrayFromParamsObject(inputObj);
    if (fromInputArray.length > 0) {
      return { urls: fromInputArray, layout: 'default' };
    }
  }

  return { urls: [], layout: 'default' };
}

/**
 * 将 `/api/video/message/page` 单条 `rows` 记录映射为前端列表项。
 * 后端：`output` 为 JSON 字符串（如 `[{"type":"video","video":"..."}]`），
 * `params` 为 JSON 字符串（含 prompt、aspect_ratio、resolution 等）。
 */
export function mapVideoMessageRecordToGenLike(item: Record<string, unknown>): {
  id: string;
  prompt: string;
  model: string;
  aspect: string;
  resolution: string;
  duration: string;
  videoUrl?: string;
  /** params 中的参考图 / 首尾帧 URL，用于列表展示 */
  referenceImageUrls?: string[];
  /** 列表参考图展示布局（首尾帧为左右并排） */
  referenceImageLayout?: VideoReferenceImageLayout;
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

  const model =
    pickStr(item, ['model', 'modelId', 'model_id', 'modelName', 'model_name']) ||
    (paramsObj
      ? pickStr(paramsObj, ['model', 'modelId', 'model_id', 'modelName', 'model_name'])
      : '');

  const aspect =
    pickStr(item, ['aspect_ratio', 'aspectRatio', 'aspect']) ||
    (paramsObj ? pickStr(paramsObj, ['aspect_ratio', 'aspectRatio', 'aspect']) : '');

  const resolution =
    pickStr(item, ['resolution', 'quality']) ||
    (paramsObj ? pickStr(paramsObj, ['resolution', 'quality']) : '');

  const duration = readDurationFromRecord(item, paramsObj);

  const videoUrl = pickFirstVideoUrl(item) || undefined;
  const { urls: referenceImageUrls, layout: referenceImageLayout } =
    readReferenceImagesFromParams(paramsObj);
  const costUsd = readCostUsdFromRecord(item);

  return {
    id,
    prompt,
    model,
    aspect,
    resolution,
    duration,
    videoUrl,
    referenceImageUrls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
    referenceImageLayout:
      referenceImageUrls.length > 0 ? referenceImageLayout : undefined,
    costUsd,
  };
}

export type VideoMessagePageResult = {
  records: ReturnType<typeof mapVideoMessageRecordToGenLike>[];
  total: number;
};

/**
 * 分页拉取生视频消息列表。
 * `order: desc` 时单页内从新到旧，调用方需按时间轴自行反转再拼接。
 */
export async function fetchVideoMessagePage(
  pageNum: number,
  init?: RequestInit
): Promise<VideoMessagePageResult> {
  const body: VideoMessagePageRequest = {
    ...DEFAULT_VIDEO_MESSAGE_PAGE_BODY,
    pageNum,
  };
  const res = await apiFetch('/api/video/message/page', {
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
    const records = list.map((row) => mapVideoMessageRecordToGenLike(row));
    return { records, total: 0 };
  }
  const { list, total } = extractListAndTotal(json.data);
  const records = list.map((row) => mapVideoMessageRecordToGenLike(row));
  return { records, total };
}

/** 删除单条生视频历史记录：`POST /ai/video/message/delete`，body 为 `[id]` */
export async function deleteVideoMessage(
  id: string,
  signal?: AbortSignal
): Promise<void> {
  const trimmed = id.trim();
  if (!trimmed) throw new Error('Missing message id');

  const res = await apiFetch('/ai/video/message/delete', {
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