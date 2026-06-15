import { apiFetch } from './client';

/** `POST /api/query/data/model_hot_image` 路径中的 type */
export const MODEL_HOT_IMAGE_QUERY_TYPE = 'model_hot_image';

export type ModelHotImageSchema = {
  input?: Record<string, unknown>;
  output?: unknown;
};

/** 生图热门模型行（与 `/api/query/data/model_hot_image` 返回的 `data[]` 项一致） */
export type ModelHotImageRow = {
  id: string;
  modelId: string;
  name: string;
  slug?: string;
  description?: string;
  schema?: ModelHotImageSchema;
  capabilities?: string[];
  endpoints?: string[];
  icon?: string;
};

function asRecord(x: unknown): Record<string, unknown> | null {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return null;
  return x as Record<string, unknown>;
}

function normalizeModelHotImageRow(row: unknown): ModelHotImageRow | null {
  const r = asRecord(row);
  if (!r) return null;
  const modelId = typeof r.modelId === 'string' ? r.modelId.trim() : '';
  if (!modelId) return null;
  const id =
    typeof r.id === 'string' && r.id.trim().length > 0 ? r.id.trim() : modelId;
  const name =
    (typeof r.name === 'string' && r.name.trim()) || modelId;
  const schemaRaw = r.schema;
  const schema =
    schemaRaw && typeof schemaRaw === 'object' && !Array.isArray(schemaRaw)
      ? (schemaRaw as ModelHotImageSchema)
      : undefined;
  return {
    id,
    modelId,
    name,
    slug: typeof r.slug === 'string' ? r.slug : undefined,
    description: typeof r.description === 'string' ? r.description : undefined,
    schema,
    capabilities: Array.isArray(r.capabilities)
      ? r.capabilities.filter((x): x is string => typeof x === 'string')
      : undefined,
    endpoints: Array.isArray(r.endpoints)
      ? r.endpoints.filter((x): x is string => typeof x === 'string')
      : undefined,
    icon: typeof r.icon === 'string' ? r.icon : undefined,
  };
}

/** 读取 `schema.input.<field>.enum` */
export function readSchemaInputEnum(
  row: ModelHotImageRow | undefined,
  fieldName: string
): string[] | null {
  const input = asRecord(row?.schema)?.input;
  if (!input) return null;
  const field = asRecord(input[fieldName]);
  if (!field) return null;
  const en = field.enum;
  if (!Array.isArray(en)) return null;
  const out = en.filter((x): x is string => typeof x === 'string');
  return out.length ? out : null;
}

/** 读取 `schema.input.<field>.default`（字符串） */
export function readSchemaInputStringDefault(
  row: ModelHotImageRow | undefined,
  fieldName: string
): string | undefined {
  const input = asRecord(row?.schema)?.input;
  if (!input) return undefined;
  const field = asRecord(input[fieldName]);
  if (!field) return undefined;
  const d = field.default;
  return typeof d === 'string' ? d : undefined;
}

function parseSchemaPositiveInt(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) {
    const n = Math.floor(v);
    if (n >= 1) return n;
    return undefined;
  }
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) {
    const n = Number(v.trim());
    if (n >= 1) return n;
  }
  return undefined;
}

/** 读取 `schema.input.<field>.maximum`（常见于 `num_images` 等 number 字段） */
export function readSchemaInputNumberMaximum(
  row: ModelHotImageRow | undefined,
  fieldName: string
): number | undefined {
  const input = asRecord(row?.schema)?.input;
  if (!input) return undefined;
  const field = asRecord(input[fieldName]);
  if (!field) return undefined;
  return parseSchemaPositiveInt(field.maximum);
}

/** 读取 `schema.input.image_urls.max_images` */
export function readSchemaInputImageUrlsMaxImages(
  row: ModelHotImageRow | undefined
): number | undefined {
  const input = asRecord(row?.schema)?.input;
  if (!input) return undefined;
  const field = asRecord(input['image_urls']);
  if (!field) return undefined;
  return parseSchemaPositiveInt(field.max_images);
}

const REF_IMAGE_COUNT_CAP = 32;

/**
 * 参考图最多张数：优先 `num_images.maximum`，否则 `image_urls.max_images`，
 * 二者皆无时默认 `5`。结果限制在 \[1, {@link REF_IMAGE_COUNT_CAP}\]。
 */
export function readMaxReferenceImageCount(row: ModelHotImageRow | undefined): number {
  const fromNumImages = readSchemaInputNumberMaximum(row, 'num_images');
  if (fromNumImages !== undefined) {
    return Math.min(REF_IMAGE_COUNT_CAP, Math.max(1, fromNumImages));
  }
  const fromImageUrls = readSchemaInputImageUrlsMaxImages(row);
  if (fromImageUrls !== undefined) {
    return Math.min(REF_IMAGE_COUNT_CAP, Math.max(1, fromImageUrls));
  }
  return 5;
}

/**
 * 热门生图模型列表。  
 * `data` 为模型对象数组（非字典 value/label），与 `fetchDataDictionary` 解析路径不同。
 */
export async function fetchModelHotImageList(
  signal?: AbortSignal
): Promise<ModelHotImageRow[]> {
  const type = MODEL_HOT_IMAGE_QUERY_TYPE;
  const res = await apiFetch(`/api/query/data/${encodeURIComponent(type)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    code?: number;
    msg?: string;
    data?: unknown;
  };
  if (json.code !== undefined && json.code !== 0) {
    throw new Error(json.msg || `API code ${json.code}`);
  }
  const data = json.data;
  if (!Array.isArray(data)) return [];
  const rows: ModelHotImageRow[] = [];
  for (const item of data) {
    const n = normalizeModelHotImageRow(item);
    if (n) rows.push(n);
  }
  return rows;
}
