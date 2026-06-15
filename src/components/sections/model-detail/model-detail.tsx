'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getApiBaseUrl } from '../../../lib/api/client';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';
import { useI18n } from '../../../lib/studio-text';
import {
  AudioTypeIcon,
  FileTypeIcon,
  ImageTypeIcon,
  TextTypeIcon,
  VideoTypeIcon,
} from '../../../icons/icons';
import { isLoggedInClient } from '../../../lib/auth/client';
import {
  ApiSubmitPanel,
  type ChangeInfo,
  type FieldDef,
} from '../../ui/api-submit-panel';
import {
  TextGeneratorStudio,
  type ModelListRow as TextGenModelRow,
} from '../../generator/text-generator/text-generator-studio';
import { ModelRequestsPanel } from './model-requests-panel';
import type { ModelPricingItem, ModelPricingSku } from '../../../app/(site)/models/types';
import { formatDiscountOffPercent } from '../../../app/(site)/models/_components/model-pricing';

const SHUYOU_DOCS_URL = 'https://docs.shuyou.ai/';

type ApiModelRow = {
  id: string;
  name: string;
  modelId: string;
  description?: string;
  author?: string;
  authorName?: string;
  authorIcon?: string;
  coverUrl?: string;
  discount?: number;
  capabilities?: string[];
  contextLength?: string;
  displayContextLength?: string;
  maxCompletionTokens?: string;
  displayMaxCompletionTokens?: string;
  displayTag?: string;
  endpoints?: string[];
  tags?: string[];
  providers?: Array<{
    provider?: string;
    model?: string;
    order?: number;
    discount?: number;
  }>;
  inputModalities?: Array<'text' | 'image' | 'file' | 'audio' | 'video'>;
  outputModalities?: string[];
  /**
   * 价格展示：可为「文本行」字符串，或带数值字段的对象（如 prompt/completion、criteria 等，结构化展示后续补充）。
   */
  displayPricing?: DisplayPricingItem[];
  /** 分组定价（详情接口 `pricing` 字段） */
  pricing?: ModelPricingItem[];
  /**
   * 模型请求 schema；Playground 的 ApiSubmitPanel **仅**使用 `schema.input` 生成表单字段
   *（与请求体 `input` 对象内各字段的 JSON Schema 风格描述一致）。
   */
  schema?: {
    input?: Record<string, unknown>;
    [key: string]: unknown;
  };
};

/** 详情接口 `displayPricing` 单项：纯文案 或 结构化对象 */
type DisplayPricingObject = {
  criteria?: string;
  prompt?: number;
  inputText?: number;
  completion?: number;
  outputImage?: number;
  image?: number;
  second?: number;
  search?: number;
  /** 音频 / TTS 等按字符计价（如 USD/字符） */
  character?: number;
  [key: string]: unknown;
};

type DisplayPricingItem = string | DisplayPricingObject;

function isDisplayPricingObject(x: unknown): x is DisplayPricingObject {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function getDisplayPricingObjectTiers(items: DisplayPricingItem[]): DisplayPricingObject[] {
  return items.filter(isDisplayPricingObject);
}

function getDisplayPricingTextLines(items: DisplayPricingItem[]): string[] {
  return items
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function isNonEmptyDisplayPricingObject(tier: DisplayPricingObject): boolean {
  const c = tier.criteria;
  if (c != null && String(c).trim() !== '') return true;
  for (const k of [
    'prompt',
    'inputText',
    'completion',
    'outputImage',
    'search',
    'image',
    'second',
    'character',
  ] as const) {
    const n = tier[k];
    if (typeof n === 'number' && Number.isFinite(n)) return true;
  }
  return false;
}

/** 详情页头部定价：USD，与模型列表一致 */
function formatDetailPrice(usd: number): string {
  return (
    '$' +
    usd.toLocaleString('en-US', {
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    })
  );
}

/** 取 displayPricing 第一项中的输入/输出单价 */
function getFirstTierHeaderPrice(
  tier: DisplayPricingObject | undefined,
  kind: 'input' | 'output'
): number | undefined {
  if (!tier) return undefined;
  if (kind === 'input') {
    if (typeof tier.prompt === 'number' && Number.isFinite(tier.prompt) && tier.prompt > 0) {
      return tier.prompt;
    }
    if (typeof tier.inputText === 'number' && Number.isFinite(tier.inputText) && tier.inputText > 0) {
      return tier.inputText;
    }
    return undefined;
  }
  if (typeof tier.completion === 'number' && Number.isFinite(tier.completion) && tier.completion > 0) {
    return tier.completion;
  }
  if (typeof tier.outputImage === 'number' && Number.isFinite(tier.outputImage) && tier.outputImage > 0) {
    return tier.outputImage;
  }
  return undefined;
}

type HeaderPriceColumn = {
  price?: number;
  perMillionTokens: boolean;
  labelKey: string;
};

function isPositiveHeaderPrice(price: unknown): price is number {
  return typeof price === 'number' && Number.isFinite(price) && price > 0;
}

function resolveHeaderPriceColumns(tier: DisplayPricingObject | undefined): [
  HeaderPriceColumn,
  HeaderPriceColumn,
] {
  const col1: HeaderPriceColumn =
    tier != null && isPositiveHeaderPrice(tier.image)
      ? {
          price: tier.image,
          perMillionTokens: false,
          labelKey: 'modelDetail.pricing.imageLabel',
        }
      : {
          price: getFirstTierHeaderPrice(tier, 'input'),
          perMillionTokens: true,
          labelKey: 'modelDetail.inputTokens',
        };

  const col2: HeaderPriceColumn =
    tier != null && isPositiveHeaderPrice(tier.second)
      ? {
          price: tier.second,
          perMillionTokens: false,
          labelKey: 'modelDetail.pricing.secondLabel',
        }
      : {
          price: getFirstTierHeaderPrice(tier, 'output'),
          perMillionTokens: true,
          labelKey: 'modelDetail.outputTokens',
        };

  return [col1, col2];
}

function ModelDetailHeaderPrice({
  price,
  perMillionTokens,
}: {
  price: number;
  perMillionTokens: boolean;
}) {
  return (
    <div className="text-xl font-semibold text-gray-900 dark:text-white/90">
      {formatDetailPrice(price)}
      {perMillionTokens ? '/M' : null}
    </div>
  );
}

/** 解析详情里的 displayPricing（兼容 JSON 字符串） */
function normalizeDisplayPricingRaw(raw: unknown): DisplayPricingItem[] {
  if (Array.isArray(raw)) return raw as DisplayPricingItem[];
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return [];
    try {
      const p = JSON.parse(s) as unknown;
      if (Array.isArray(p)) return p as DisplayPricingItem[];
    } catch {
      /* ignore */
    }
  }
  return [];
}

type PricingSkuRow = {
  label: string;
  price: number;
  unitLabel?: string;
};

const PRICING_GROUP_META_KEYS = new Set(['group', 'discount']);

function isPricingSku(value: unknown): value is ModelPricingSku {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as ModelPricingSku).price === 'number' &&
    Number.isFinite((value as ModelPricingSku).price)
  );
}

function formatPricingGroupLabel(group: string): string {
  return group
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatPricingSkuKeyLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


/** 解析详情里的 pricing（兼容 JSON 字符串） */
function normalizePricingRaw(raw: unknown): ModelPricingItem[] {
  if (Array.isArray(raw)) return raw as ModelPricingItem[];
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s) as unknown;
      if (Array.isArray(parsed)) return parsed as ModelPricingItem[];
    } catch {
      /* ignore */
    }
  }
  return [];
}

function getPricingGroupSkuRows(item: ModelPricingItem): PricingSkuRow[] {
  const rows: PricingSkuRow[] = [];

  const pushSku = (sku: ModelPricingSku | undefined, fallbackLabel: string) => {
    if (!sku || typeof sku.price !== 'number' || !Number.isFinite(sku.price)) return;
    rows.push({
      label: sku.sku_label?.trim() || fallbackLabel,
      price: sku.price,
      unitLabel: sku.unitLabel?.trim() || sku.unit_label?.trim() || undefined,
    });
  };

  for (const [key, value] of Object.entries(item)) {
    if (PRICING_GROUP_META_KEYS.has(key)) continue;

    if (key === 'per_image' && value && typeof value === 'object') {
      const perImage = value as NonNullable<ModelPricingItem['per_image']>;
      if (typeof perImage.price === 'number' && Number.isFinite(perImage.price)) {
        rows.push({
          label: 'Image',
          price: perImage.price,
          unitLabel: perImage.unit_label?.trim() || perImage.unitLabel?.trim(),
        });
      }
      for (const tier of perImage.tiers ?? []) {
        if (typeof tier.price !== 'number' || !Number.isFinite(tier.price)) continue;
        rows.push({
          label: tier.sku_label?.trim() || tier.criteria?.trim() || 'Image',
          price: tier.price,
          unitLabel: tier.unit_label?.trim(),
        });
      }
      continue;
    }

    if (key === 'per_second' && value && typeof value === 'object') {
      const perSecond = value as NonNullable<ModelPricingItem['per_second']>;
      for (const tier of perSecond.tiers ?? []) {
        if (typeof tier.price !== 'number' || !Number.isFinite(tier.price)) continue;
        rows.push({
          label: tier.sku_label?.trim() || tier.criteria?.trim() || 'Per second',
          price: tier.price,
          unitLabel: tier.unit_label?.trim(),
        });
      }
      continue;
    }

    if (key === 'per_video' && value && typeof value === 'object') {
      const perVideo = value as NonNullable<ModelPricingItem['per_video']>;
      if (typeof perVideo.price === 'number' && Number.isFinite(perVideo.price)) {
        rows.push({
          label: 'Video',
          price: perVideo.price,
          unitLabel: perVideo.unit_label?.trim(),
        });
      }
      for (const tier of perVideo.tiers ?? []) {
        if (typeof tier.price !== 'number' || !Number.isFinite(tier.price)) continue;
        rows.push({
          label: tier.sku_label?.trim() || tier.items?.[0]?.trim() || 'Video',
          price: tier.price,
          unitLabel: tier.unit_label?.trim(),
        });
      }
      continue;
    }

    if (isPricingSku(value)) {
      pushSku(value, formatPricingSkuKeyLabel(key));
    }
  }

  return rows;
}

function ModelDetailPricingGroupCard({
  item,
  t,
}: {
  item: ModelPricingItem;
  t: (key: string) => string;
}) {
  const skus = getPricingGroupSkuRows(item);
  if (skus.length === 0) return null;

  const groupName = item.group?.trim();
  const discount = item.discount != null ? formatDiscountOffPercent(item.discount) : null;

  return (
    <li className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/80 dark:bg-[#111827]/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#475CFF]/[0.06] to-transparent px-4 py-3 dark:border-gray-800 dark:from-[#475CFF]/10">
        <div className="min-w-0 flex items-center gap-2.5">
          <span className="shrink-0 rounded-md bg-[#475CFF]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#475CFF] dark:bg-[#475CFF]/20 dark:text-[#8B97FF]">
            {t('modelDetail.pricing.groupLabel')}
          </span>
          {groupName ? (
            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white/90">
              {formatPricingGroupLabel(groupName)}
            </h3>
          ) : null}
        </div>
        {discount != null ? (
          <span className="shrink-0 rounded-full bg-[#2CCD82]/10 px-2.5 py-1 text-xs font-semibold text-[#1FA866] ring-1 ring-[#2CCD82]/25 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
            {discount}% off
          </span>
        ) : null}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {skus.map((sku, idx) => (
          <div
            key={`${sku.label}-${idx}`}
            className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{sku.label}</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-base font-semibold text-gray-900 dark:text-white/90">
                {formatDetailPrice(sku.price)}
              </span>
              {sku.unitLabel ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">{sku.unitLabel}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </li>
  );
}

function ModelDetailPricingObjectTier({
  tier,
  t,
}: {
  tier: DisplayPricingObject;
  t: (key: string) => string;
}) {
  const criteria = typeof tier.criteria === 'string' ? tier.criteria.trim() : '';
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(n));
  return (
    <li className="space-y-2 rounded-lg border border-gray-100 bg-white/60 px-3 py-2.5 dark:border-gray-700 dark:bg-white/[0.06]">
      {criteria ? (
        <p className="text-xs leading-snug text-gray-500 dark:text-gray-400">
          {t('modelDetail.pricing.condition').replace('{criteria}', criteria)}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-800 dark:text-white/85">
        {typeof tier.prompt === 'number' && Number.isFinite(tier.prompt) && tier.prompt > 0 ? (
          <span>
            <span className="font-semibold text-gray-900 dark:text-white/90">${fmt(tier.prompt)}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              {t('modelDetail.pricing.perMInput')}
            </span>
          </span>
        ) : null}
        {typeof tier.inputText === 'number' && Number.isFinite(tier.inputText) && tier.inputText > 0 ? (
            <span>
            <span className="font-semibold text-gray-900 dark:text-white/90">${fmt(tier.inputText)}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              {t('modelDetail.pricing.perMInput')}
            </span>
          </span>
        ) : null}
        {typeof tier.completion === 'number' && Number.isFinite(tier.completion) && tier.completion > 0 ? (
          <span>
            <span className="font-semibold text-gray-900 dark:text-white/90">${fmt(tier.completion)}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              {t('modelDetail.pricing.perMOutput')}
            </span>
          </span>
        ) : null}
        {typeof tier.outputImage === 'number' && Number.isFinite(tier.outputImage) && tier.outputImage > 0 ? (
            <span>
            <span className="font-semibold text-gray-900 dark:text-white/90">${fmt(tier.outputImage)}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              {t('modelDetail.pricing.perMOutput')}
            </span>
          </span>
        ) : null}
        {typeof tier.search === 'number' && Number.isFinite(tier.search) ? (
          <span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('modelDetail.pricing.searchLabel')}</span>
            <span className="ml-1 font-semibold text-gray-900 dark:text-white/90">${fmt(tier.search)}</span>
          </span>
        ) : null}
        {typeof tier.image === 'number' && Number.isFinite(tier.image) ? (
          <span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('modelDetail.pricing.imageLabel')}</span>
            <span className="ml-1 font-semibold text-gray-900 dark:text-white/90">${fmt(tier.image)}</span>
          </span>
        ) : null}
        {typeof tier.second === 'number' && Number.isFinite(tier.second) ? (
          <span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('modelDetail.pricing.secondLabel')}</span>
            <span className="ml-1 font-semibold text-gray-900 dark:text-white/90">${fmt(tier.second)}</span>
          </span>
        ) : null}
        {typeof tier.character === 'number' && Number.isFinite(tier.character) ? (
          <span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('modelDetail.pricing.characterLabel')}</span>
            <span className="ml-1 font-semibold text-gray-900 dark:text-white/90">${fmt(tier.character)}</span>
          </span>
        ) : null}
      </div>
    </li>
  );
}

/** 判断字段名是否属于图片类型 */
function isImageKey(key: string): boolean {
  return /image|img|photo|pic|picture|url/i.test(key);
}

/**
 * 判断字段名是否属于「音频文件」上传（排除 TTS 等模型里名为 `voice` 的音色枚举字段）。
 */
function isAudioKey(key: string): boolean {
  if (/^voice$/i.test(key)) return false;
  return /audio|sound|music|speech/i.test(key);
}

/** 富 JSON Schema 风格的单字段描述 */
type RichInputParam = {
  type?: string;
  title?: string;
  required?: boolean;
  max_length?: number;
  maxLength?: number;
  /** 部分模型用 length 表示字符串最大长度 */
  length?: number;
  /** array 的最大元素数量（或上传数量上限） */
  size?: number;
  maxItems?: number;
  items?: unknown;
  default?: unknown;
  description?: string;
  enum?: unknown[];
  order?: number;
};

/** 从详情接口 `schema` 中取出 `input` 字段表（唯一用于 ApiSubmitPanel 的参数来源） */
function getSchemaInputRecord(schema: unknown): Record<string, unknown> {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return {};
  const input = (schema as { input?: unknown }).input;
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  return input as Record<string, unknown>;
}

/**
 * 将 `schema.input` 的字段定义转换为 FieldDef[]
 *
 * 规则（与后端 schema 对齐）：
 *  - 有 `enum`（非空）→ 选择器；`default` 为默认选中项
 *  - `type: boolean` 且无 enum → 开关；`default` 为默认布尔值
 *  - `type: string` 且无 enum → 单行或多行输入（由 length / 字段名决定）
 *  - `type: array` → 多为 URL 列表或文件：string + format:uri 或字段名含 image/url → 图片上传；音频相关 → 音频上传
 *  - legacy：根级 string[] / number 仍支持（旧数据）
 */
function apiModelRowToTextGenModelRow(r: ApiModelRow): TextGenModelRow {
  const name = (r.name ?? '').trim() || r.modelId || r.id || 'Model';
  const displayTags =
    r.tags?.length ? r.tags : r.displayTag ? [r.displayTag] : undefined;
  return {
    id: r.id || r.modelId,
    modelId: r.modelId || r.id,
    name,
    author: r.author,
    authorName: r.authorName,
    authorIcon: r.authorIcon,
    providers: r.providers,
    contextLength: r.contextLength,
    displayContextLength: r.displayContextLength ?? r.contextLength,
    inputModalities: r.inputModalities?.map((x) => String(x)),
    outputModalities: r.outputModalities?.map((x) => String(x)),
    displayPricing: r.displayPricing,
    description: r.description,
    discount: r.discount,
    displayTags,
    displayMaxCompletionTokens: r.displayMaxCompletionTokens,
  };
}

const PREDICTION_POLL_INTERVAL_MS = 10_000;

function resolveUploadedFileUri(candidate: string): string {
  const s = candidate.trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) return `${getApiBaseUrl().replace(/\/+$/, '')}${s}`;
  return s;
}

/** 上传本地参考图，返回可写入 input.image_urls / reference_image_urls 的 URI 字符串 */
async function uploadPlaygroundImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiFetch('/sys/file/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as {
    code?: number;
    data?: {
      id?: string;
      url?: string;
      uri?: string;
      fileUrl?: string;
      file_url?: string;
    };
    msg?: string;
  };
  const d = json?.data;
  /** 预测接口要求可访问的完整 URL；优先使用上传接口返回的 fileUrl */
  const fileUrl =
    (typeof d?.fileUrl === 'string' && d.fileUrl.trim()) ||
    (typeof d?.file_url === 'string' && d.file_url.trim()) ||
    '';
  if (fileUrl) return resolveUploadedFileUri(fileUrl);
  const fromApi =
    (typeof d?.url === 'string' && d.url.trim()) ||
    (typeof d?.uri === 'string' && d.uri.trim()) ||
    '';
  if (fromApi) return resolveUploadedFileUri(fromApi);
  const id = d?.id?.trim();
  if (json?.code !== 0 || !id) {
    throw new Error(json?.msg || 'upload failed');
  }
  if (/^https?:\/\//i.test(id)) return id;
  const base = getApiBaseUrl().replace(/\/+$/, '');
  return `${base}/sys/file/${encodeURIComponent(id)}`;
}

function buildPlaygroundParamsRecord(
  info: ChangeInfo,
  fields: FieldDef[]
): Record<string, unknown> {
  if (info.tab === 'json' && info.jsonParsed) {
    return { ...info.jsonParsed };
  }
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === 'image' || f.type === 'audio') continue;
    const v = info.values[f.name];
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (typeof v === 'number' && !Number.isFinite(v)) continue;
    out[f.name] = v;
  }
  return out;
}

function normalizeStringUrlArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .map((x) => x.trim());
}

/** 组装图片/视频预测 input：保留 JSON/表单原有字段；本地上传按字段名合并进对应 URL 数组 */
async function buildImagePredictionInput(
  info: ChangeInfo,
  fields: FieldDef[]
): Promise<Record<string, unknown>> {
  const input = buildPlaygroundParamsRecord(info, fields);
  for (const f of fields) {
    if (f.type !== 'image' && f.type !== 'audio') continue;
    const raw = info.values[f.name];
    if (!Array.isArray(raw)) continue;
    const uploaded: string[] = [];
    for (const item of raw) {
      if (item instanceof File) {
        uploaded.push(await uploadPlaygroundImageFile(item));
      }
    }
    if (uploaded.length === 0) continue;
    const existing = normalizeStringUrlArray(input[f.name]);
    input[f.name] = [...existing, ...uploaded];
  }
  return input;
}

type PredictionMediaItem = { url: string; kind: 'image' | 'video' | 'audio' };

/** 从 predictions 结果的 output 数组解析图片 / 视频 / 音频地址 */
function extractPredictionOutputMedia(data: Record<string, unknown>): PredictionMediaItem[] {
  const items: PredictionMediaItem[] = [];
  const output = data.output;
  if (!Array.isArray(output)) return items;
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const type = String(o.type || '').toLowerCase();
    const url =
      (typeof o.video === 'string' && o.video.trim()) ||
      (typeof o.image === 'string' && o.image.trim()) ||
      (typeof o.audio === 'string' && o.audio.trim()) ||
      (typeof o.url === 'string' && o.url.trim()) ||
      '';
    if (!url) continue;
    const kind: PredictionMediaItem['kind'] =
      type === 'video' ? 'video' : type === 'audio' ? 'audio' : 'image';
    items.push({
      url: url.trim(),
      kind,
    });
  }
  return items;
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const id = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function isPollResponseCodeOk(code: unknown): boolean {
  return (
    code === undefined ||
    code === null ||
    code === 0 ||
    code === '0'
  );
}

type PollPredictionSuccessResult = {
  mediaItems: PredictionMediaItem[];
  /** 最后一次 GET /v1/predictions/:taskId 成功响应的完整 JSON */
  responseBody: Record<string, unknown>;
};

/** GET /v1/predictions/:taskId 轮询直至 success / failed */
async function pollPredictionTask(
  taskId: string,
  signal: AbortSignal,
  onWaiting?: () => void
): Promise<PollPredictionSuccessResult> {
  const path = `/v1/predictions/${encodeURIComponent(taskId)}`;

  for (;;) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const res = await apiFetch(path, { method: 'GET', signal });
    const raw = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      throw new Error(String(raw.msg || `HTTP ${res.status}`));
    }
    if (!isPollResponseCodeOk(raw.code)) {
      throw new Error(String(raw.msg || 'poll rejected'));
    }

    const data = raw.data as Record<string, unknown> | undefined;
    if (!data || typeof data !== 'object') {
      throw new Error('invalid poll response');
    }

    const status = String(data.task_status ?? '').toLowerCase();

    if (status === 'success') {
      return {
        mediaItems: extractPredictionOutputMedia(data),
        responseBody: raw,
      };
    }

    if (
      status === 'failed' ||
      status === 'error' ||
      status === 'cancelled' ||
      status === 'canceled'
    ) {
      const errMsg =
        (typeof data.error === 'string' && data.error) ||
        (typeof raw.msg === 'string' && raw.msg) ||
        'task failed';
      throw new Error(errMsg);
    }

    onWaiting?.();
    await delay(PREDICTION_POLL_INTERVAL_MS, signal);
  }
}

function parseCreatePredictionTaskId(body: Record<string, unknown>): string {
  const data = body.data as Record<string, unknown> | undefined;
  const pick = (o: Record<string, unknown> | undefined) => {
    if (!o) return '';
    const a = o.task_id;
    const b = o.taskId;
    if (typeof a === 'string' && a.trim()) return a.trim();
    if (typeof b === 'string' && b.trim()) return b.trim();
    return '';
  };
  const id = pick(data) || pick(body);
  if (!id) throw new Error('missing task_id');
  return id;
}

function coerceSchemaEnumToStrings(rawEnum: unknown[]): string[] {
  const out: string[] = [];
  for (const x of rawEnum) {
    if (typeof x === 'string' && x.trim()) out.push(x.trim());
    else if (typeof x === 'number' && Number.isFinite(x)) out.push(String(x));
    else if (typeof x === 'boolean') out.push(x ? 'true' : 'false');
  }
  return out;
}

function stringifySchemaDefaultForEnum(d: unknown): string {
  if (d === null || d === undefined) return '';
  if (typeof d === 'string') return d.trim();
  if (typeof d === 'number' && Number.isFinite(d)) return String(d);
  if (typeof d === 'boolean') return d ? 'true' : 'false';
  return String(d).trim();
}

function parseSchemaBooleanDefault(d: unknown): boolean {
  if (d === true || d === 'true' || d === 1 || d === '1') return true;
  if (d === false || d === 'false' || d === 0 || d === '0') return false;
  return false;
}

function resolveSchemaMaxItems(spec: RichInputParam): number | undefined {
  if (typeof spec.size === 'number' && spec.size > 0) return spec.size;
  if (typeof spec.maxItems === 'number' && spec.maxItems > 0) return spec.maxItems;
  return undefined;
}

function getArrayItemStringHints(spec: RichInputParam): {
  itemType?: string;
  format?: string;
} {
  const items = spec.items;
  if (!items || typeof items !== 'object' || Array.isArray(items)) return {};
  const it = items as Record<string, unknown>;
  const itemType = typeof it.type === 'string' ? it.type : undefined;
  const format = typeof it.format === 'string' ? it.format : undefined;
  return { itemType, format };
}

/** array 类型字段：根据 items 与字段名推断用图片上传还是音频上传 */
function pickArrayUploadFieldType(
  fieldName: string,
  hints: { itemType?: string; format?: string }
): 'image' | 'audio' {
  const fmt = (hints.format || '').toLowerCase();
  const itemType = (hints.itemType || '').toLowerCase();
  const stringLike = itemType === 'string' || itemType === '';
  const uriLike =
    fmt === 'uri' ||
    fmt === 'url' ||
    (stringLike && (fmt === 'uri' || fmt === 'url' || fmt === ''));
  if (uriLike && isAudioKey(fieldName)) return 'audio';
  if (
    uriLike ||
    isImageKey(fieldName) ||
    /(?:^|_)(urls?|uris?)(?:$|_)/i.test(fieldName)
  ) {
    return 'image';
  }
  if (isAudioKey(fieldName)) return 'audio';
  return 'image';
}

function buildFieldsFromSchemaInput(
  input: Record<string, unknown>,
  t: (key: string) => string
): FieldDef[] {
  const sorted = Object.entries(input)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([name, value]) => {
      let order = 9999;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const o = (value as RichInputParam).order;
        if (typeof o === 'number' && Number.isFinite(o)) order = o;
      }
      return { name, value, order };
    })
    .sort((a, b) => a.order - b.order);

  return sorted.map(({ name, value }) => {
    // ── 富 schema：对象定义 ──
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const spec = value as RichInputParam;
      const label =
        typeof spec.title === 'string' && spec.title.trim() ? spec.title.trim() : name;
      const desc =
        typeof spec.description === 'string' && spec.description.trim()
          ? spec.description.trim()
          : undefined;

      const rawEnum = Array.isArray(spec.enum) ? spec.enum : [];
      const enumStrings = coerceSchemaEnumToStrings(rawEnum);

      // 有 enum → 一律选择器（integer 但带 enum 也走这里）
      if (enumStrings.length > 0) {
        const options = enumStrings.map((v) => ({ value: v, label: v }));
        const defPick = stringifySchemaDefaultForEnum(spec.default);
        const defaultValue =
          defPick && enumStrings.includes(defPick) ? defPick : (enumStrings[0] ?? null);
        const parts = [desc].filter(Boolean) as string[];
        return {
          name,
          label,
          type: 'select' as const,
          required: Boolean(spec.required),
          defaultValue,
          options,
          description: parts.length ? parts.join(' ') : undefined,
        };
      }

      const st = String(spec.type || '').toLowerCase();

      // boolean → 开关
      if (st === 'boolean') {
        const parts = [desc].filter(Boolean) as string[];
        return {
          name,
          label,
          type: 'boolean' as const,
          required: Boolean(spec.required),
          defaultValue: parseSchemaBooleanDefault(spec.default),
          description: parts.length ? parts.join(' ') : undefined,
        };
      }

      // array → 多为 URL 列表 / 参考图：用上传组件（值最终合并为 URL 字符串数组）
      if (st === 'array') {
        const hints = getArrayItemStringHints(spec);
        const uploadType = pickArrayUploadFieldType(name, hints);
        const maxItems = resolveSchemaMaxItems(spec);
        const maxHint =
          maxItems !== undefined
            ? uploadType === 'audio'
              ? t('modelDetail.playground.maxAudios').replace('{n}', String(maxItems))
              : t('modelDetail.playground.maxImages').replace('{n}', String(maxItems))
            : undefined;
        const description = [desc, maxHint].filter(Boolean).join(' ') || undefined;
        return {
          name,
          label,
          type: uploadType,
          required: Boolean(spec.required),
          description,
        };
      }

      const maxLen =
        typeof spec.max_length === 'number' && Number.isFinite(spec.max_length)
          ? spec.max_length
          : typeof spec.maxLength === 'number' && Number.isFinite(spec.maxLength)
            ? spec.maxLength
            : typeof spec.length === 'number' && Number.isFinite(spec.length)
              ? spec.length
              : undefined;

      const defStr =
        spec.default === null || spec.default === undefined
          ? ''
          : typeof spec.default === 'string'
            ? spec.default
            : typeof spec.default === 'number' && Number.isFinite(spec.default)
              ? String(spec.default)
              : typeof spec.default === 'boolean'
                ? spec.default
                  ? 'true'
                  : 'false'
                : String(spec.default).trim();

      const maxHint =
        maxLen !== undefined
          ? t('modelDetail.playground.maxChars').replace('{n}', String(maxLen))
          : undefined;
      const description = [desc, maxHint].filter(Boolean).join(' ') || undefined;

      if (st === 'number' || st === 'integer' || st === 'float') {
        let numDefault: number | null = null;
        if (defStr !== '') {
          const n = Number(defStr);
          if (Number.isFinite(n)) numDefault = n;
        }
        return {
          name,
          label,
          type: 'number' as const,
          required: Boolean(spec.required),
          defaultValue: numDefault,
          description,
        };
      }

      // string（无 enum）→ 单行或多行输入
      const useTextarea =
        name === 'prompt' ||
        (maxLen !== undefined && maxLen > 256) ||
        st === 'text' ||
        st === 'textarea';

      return {
        name,
        label,
        type: useTextarea ? ('textarea' as const) : ('string' as const),
        required: Boolean(spec.required) || name === 'prompt',
        defaultValue: defStr !== '' ? defStr : null,
        description,
      };
    }

    // ── legacy：string[] → select ──
    if (Array.isArray(value)) {
      const strs = value.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
      return {
        name,
        label: name,
        type: 'select' as const,
        defaultValue: strs[0] ?? null,
        options: strs.map((v) => ({ value: v, label: v })),
      };
    }

    // ── legacy：number ──
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (isImageKey(name)) {
        return {
          name,
          label: name,
          type: 'image' as const,
          description: t('modelDetail.playground.maxImages').replace('{n}', String(value)),
        };
      }
      if (isAudioKey(name)) {
        return {
          name,
          label: name,
          type: 'audio' as const,
          description: t('modelDetail.playground.maxAudios').replace('{n}', String(value)),
        };
      }
      return {
        name,
        label: name,
        type: name === 'prompt' ? ('textarea' as const) : ('string' as const),
        required: name === 'prompt',
        description: t('modelDetail.playground.maxChars').replace('{n}', String(value)),
      };
    }

    return {
      name,
      label: name,
      type: 'string' as const,
      defaultValue: typeof value === 'string' ? value : null,
      description: undefined,
    };
  });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      className="relative inline-flex items-center justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          // ignore
        }
      }}
      aria-label={copied ? 'Copied' : 'Copy'}
    >
      {copied ? (
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
          <rect x="8" y="8" width="12" height="12" rx="2" />
        </svg>
      )}
      {copied ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[11px] font-medium text-white">
          Copied
        </span>
      ) : null}
    </button>
  );
}

function modalityIcon(kind: string) {
  switch (kind) {
    case 'text':
      return TextTypeIcon;
    case 'image':
      return ImageTypeIcon;
    case 'file':
      return FileTypeIcon;
    case 'audio':
      return AudioTypeIcon;
    case 'video':
      return VideoTypeIcon;
    default:
      return null;
  }
}

const MODALITY_ORDER = ['text', 'image', 'file', 'audio', 'video'] as const;
type ModalityKind = (typeof MODALITY_ORDER)[number];

function modalityIsActive(active: Set<string>, kind: ModalityKind) {
  return [...active].some((x) => String(x).toLowerCase() === kind);
}

function ModalityIconsRow({ active }: { active: Set<string> }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {MODALITY_ORDER.map((m) => {
        const Icon = modalityIcon(m);
        if (!Icon) return null;
        const isActive = modalityIsActive(active, m);
        return (
          <span
            key={m}
            className={cn(
              'inline-flex items-center justify-center rounded-sm transition-colors',
              isActive
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-300 dark:text-gray-600'
            )}
            title={m}
            aria-label={m}
          >
            <Icon className="size-4" />
          </span>
        );
      })}
    </div>
  );
}

export default function ModelDetail({
  id,
  modelId,
}: {
  /** 优先使用 id 查详情；旧路由兼容传 modelId 时也可用 */
  id?: string;
  modelId?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [row, setRow] = useState<ApiModelRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'playground' | 'requests' | 'price'>(
    'playground'
  );
  const lookupId = id || modelId || '';

  const handleTabSelect = useCallback((k: 'playground' | 'api' | 'requests' | 'price') => {
    if (k === 'api') {
      window.open(SHUYOU_DOCS_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    setTab(k);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        // 详情接口：通过 id 查询
        const res = await apiFetch('/api/model/detail', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: lookupId }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          code: number;
          msg?: string;
          data?: ApiModelRow;
        };
        if (json.code !== 0) throw new Error(json.msg || 'API error');
        if (!cancelled) setRow(json.data ?? null);
      } catch {
        if (!cancelled) setRow(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lookupId]);

  const [submitInfo, setSubmitInfo] = useState<ChangeInfo | null>(null);
  const [panelKey, setPanelKey] = useState(0);
  const [playgroundPredictionMedia, setPlaygroundPredictionMedia] = useState<
    PredictionMediaItem[]
  >([]);
  const [playgroundImageLoading, setPlaygroundImageLoading] = useState(false);
  const [playgroundImageError, setPlaygroundImageError] = useState<string | null>(null);
  const [playgroundPollHint, setPlaygroundPollHint] = useState(false);
  const [playgroundOutputViewTab, setPlaygroundOutputViewTab] = useState<
    'preview' | 'json'
  >('preview');
  const [playgroundPredictionPollJson, setPlaygroundPredictionPollJson] = useState<
    string | null
  >(null);
  const predictionAbortRef = useRef<AbortController | null>(null);

  const displayPricing = useMemo(
    () => normalizeDisplayPricingRaw(row?.displayPricing),
    [row?.displayPricing]
  );
  const displayPricingTextLines = useMemo(
    () => getDisplayPricingTextLines(displayPricing),
    [displayPricing]
  );
  const displayPricingObjectTiers = useMemo(
    () => getDisplayPricingObjectTiers(displayPricing),
    [displayPricing]
  );
  const pricingGroups = useMemo(
    () => normalizePricingRaw(row?.pricing),
    [row?.pricing]
  );
  const pricingGroupCards = useMemo(
    () => pricingGroups.filter((item) => getPricingGroupSkuRows(item).length > 0),
    [pricingGroups]
  );
  const showPricingDetailsModule = useMemo(() => {
    if (pricingGroupCards.length > 0) return true;
    if (displayPricing.length === 0) return false;
    if (displayPricingTextLines.length > 0) return true;
    return displayPricingObjectTiers.some(isNonEmptyDisplayPricingObject);
  }, [
    pricingGroupCards.length,
    displayPricing.length,
    displayPricingTextLines,
    displayPricingObjectTiers,
  ]);
  const firstPricingObject = displayPricingObjectTiers[0];
  const headerPriceColumns = useMemo(
    () => resolveHeaderPriceColumns(firstPricingObject),
    [firstPricingObject]
  );
  const visibleHeaderPriceColumns = useMemo(
    () =>
      headerPriceColumns.filter(
        (col): col is HeaderPriceColumn & { price: number } =>
          isPositiveHeaderPrice(col.price)
      ),
    [headerPriceColumns]
  );
  const headerStatsColCount = visibleHeaderPriceColumns.length + 2;

  const inputKinds = useMemo(
    () => (row?.inputModalities ?? []).map((x) => String(x).toLowerCase()),
    [row?.inputModalities]
  );
  const outputKinds = useMemo(
    () => (row?.outputModalities ?? []).map((x) => String(x).toLowerCase()),
    [row?.outputModalities]
  );
  /** 图片 / 视频 / 音频输出：走 /v1/predictions；function 分别为 image、video、audio */
  const isPredictionPlayground =
    outputKinds.includes('image') ||
    outputKinds.includes('video') ||
    outputKinds.includes('audio');
  const predictionPlaygroundFunction = useMemo<'image' | 'video' | 'audio'>(() => {
    if (outputKinds.includes('video')) return 'video';
    if (outputKinds.includes('audio')) return 'audio';
    return 'image';
  }, [outputKinds]);

  useEffect(() => {
    return () => {
      predictionAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    predictionAbortRef.current?.abort();
    predictionAbortRef.current = null;
    setPlaygroundPredictionMedia([]);
    setPlaygroundImageError(null);
    setPlaygroundPollHint(false);
    setPlaygroundOutputViewTab('preview');
    setPlaygroundPredictionPollJson(null);
  }, [panelKey]);

  /** 仅用 `schema.input` 生成字段；缺失或为空时降级到 inputModalities */
  const playgroundFields = useMemo<FieldDef[]>(() => {
    const schemaInput = getSchemaInputRecord(row?.schema);
    if (Object.keys(schemaInput).length > 0) {
      const built = buildFieldsFromSchemaInput(schemaInput, t);
      if (built.length > 0) return built;
    }
    // fallback：基于 inputModalities 生成基础字段
    const fields: FieldDef[] = [];
    if (inputKinds.includes('text') || inputKinds.length === 0) {
      fields.push({
        name: 'prompt',
        label: 'prompt',
        type: 'textarea',
        required: true,
        placeholder: t('modelDetail.playground.promptPlaceholder'),
        description: t('modelDetail.playground.promptDesc'),
      });
    }
    if (inputKinds.includes('image')) {
      fields.push({ name: 'image', label: 'image', type: 'image', description: t('modelDetail.playground.imageDesc') });
    }
    if (inputKinds.includes('video')) {
      fields.push({
        name: 'video',
        label: 'video',
        type: 'image',
        description: t('modelDetail.playground.videoUploadDesc'),
      });
    }
    if (inputKinds.includes('audio')) {
      fields.push({ name: 'audio', label: 'audio', type: 'audio', description: t('modelDetail.playground.audioDesc') });
    }
    if (inputKinds.includes('file')) {
      fields.push({ name: 'file', label: 'file', type: 'image', description: t('modelDetail.playground.fileDesc') });
    }
    return fields;
  }, [row?.schema, inputKinds, t]);

  const handlePlaygroundRun = useCallback(async () => {
    if (!row) return;
    if (!isLoggedInClient()) {
      router.push(
        `/signin?redirect=${encodeURIComponent(`/models/detail/${encodeURIComponent(lookupId)}`)}`
      );
      return;
    }
    if (!submitInfo) return;

    if (isPredictionPlayground) {
      if (submitInfo.tab === 'json' && !submitInfo.jsonParsed) {
        toast.error(t('modelDetail.playground.imageJsonInvalid'));
        return;
      }

      predictionAbortRef.current?.abort();
      const controller = new AbortController();
      predictionAbortRef.current = controller;
      const { signal } = controller;

      setPlaygroundImageLoading(true);
      setPlaygroundImageError(null);
      setPlaygroundPredictionMedia([]);
      setPlaygroundPredictionPollJson(null);
      setPlaygroundPollHint(false);

      try {
        let input: Record<string, unknown>;
        try {
          input = await buildImagePredictionInput(submitInfo, playgroundFields);
        } catch {
          toast.error(t('modelDetail.playground.imageUploadFailed'));
          setPlaygroundImageError(t('modelDetail.playground.imageUploadFailed'));
          return;
        }

        const modelId = row.modelId?.trim() || lookupId;
        const res = await apiFetch('/v1/predictions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            model: modelId,
            function: predictionPlaygroundFunction,
            input,
            webhook: process.env.NEXT_PUBLIC_PREDICTIONS_WEBHOOK_URL?.trim() ?? '',
          }),
          signal,
        });

        const raw = (await res.json()) as Record<string, unknown>;
        if (!res.ok) {
          throw new Error(String(raw.msg || `HTTP ${res.status}`));
        }
        if (!isPollResponseCodeOk(raw.code)) {
          throw new Error(String(raw.msg || 'request failed'));
        }

        const taskId = parseCreatePredictionTaskId(raw);

        const { mediaItems, responseBody } = await pollPredictionTask(
          taskId,
          signal,
          () => {
            setPlaygroundPollHint(true);
          }
        );

        setPlaygroundPollHint(false);
        setPlaygroundPredictionPollJson(JSON.stringify(responseBody, null, 2));
        setPlaygroundPredictionMedia(mediaItems);
        if (mediaItems.length === 0) {
          setPlaygroundImageError(t('modelDetail.playground.predictionNoOutput'));
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        const msg = (e as Error).message || String(e);
        toast.error(msg || t('modelDetail.playground.imageGenFailed'));
        setPlaygroundImageError(msg);
      } finally {
        setPlaygroundImageLoading(false);
        setPlaygroundPollHint(false);
        if (predictionAbortRef.current === controller) {
          predictionAbortRef.current = null;
        }
      }
      return;
    }

    console.log('Run with:', submitInfo.serializableValues);
  }, [
    row,
    lookupId,
    submitInfo,
    playgroundFields,
    isPredictionPlayground,
    predictionPlaygroundFunction,
    router,
    t,
  ]);

  return (
    <section className="bg-white dark:bg-[#101828]">
      <div className="mx-auto py-6">
        <div className="mx-auto max-w-[1656px] px-4 sm:px-6 lg:px-8 mb-6" >
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/model/back.svg"
              alt=""
              aria-hidden="true"
              className="size-4"
            />{' '}
            {t('modelDetail.back')}
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('modelDetail.loading')}
          </div>
        ) : !row ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('modelDetail.notFound').replace('{id}', lookupId)}
          </div>
        ) : (
          <>
            <div className="mx-auto max-w-[1656px] px-4 sm:px-6 lg:px-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                    {row.authorIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.authorIcon}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-700 dark:text-white/80">
                        {(row.authorName || row.author || row.name || '?')
                          .trim()
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h1 className="min-w-0 truncate text-[38px]  font-bold text-gray-900 dark:text-white/90">
                    {row.name || row.modelId || lookupId}
                  </h1>
                  <CopyButton value={row.modelId || lookupId} />
                </div>
                <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[#7D7D84] dark:text-gray-400">
                  {row.description || '—'}
                </p>

                <div
                  className={cn(
                    'mt-4 grid grid-cols-2 gap-y-5 md:gap-y-0 md:divide-x md:divide-gray-100 dark:md:divide-gray-800',
                    headerStatsColCount === 2 && 'md:grid-cols-2',
                    headerStatsColCount === 3 && 'md:grid-cols-3',
                    headerStatsColCount === 4 && 'md:grid-cols-4'
                  )}
                >
                  {visibleHeaderPriceColumns.map((col, idx) => (
                    <div
                      key={col.labelKey}
                      className={cn(
                        'flex flex-col justify-center md:px-8',
                        idx === 0 && 'md:pl-0'
                      )}
                    >
                      <ModelDetailHeaderPrice
                        price={col.price}
                        perMillionTokens={col.perMillionTokens}
                      />
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t(col.labelKey)}
                      </div>
                    </div>
                  ))}

                  <div
                    className={cn(
                      'flex flex-col justify-center md:px-8',
                      visibleHeaderPriceColumns.length === 0 && 'md:pl-0'
                    )}
                  >
                    <div className="flex min-h-[28px] items-center">
                      <ModalityIconsRow active={new Set(inputKinds)} />
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('modelDetail.inputType')}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center md:px-8">
                    <div className="flex min-h-[28px] items-center">
                      <ModalityIconsRow active={new Set(outputKinds)} />
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('modelDetail.outputType')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 hidden lg:block">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-7 py-2 text-sm font-medium text-gray-900 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-primary dark:text-white/90 dark:hover:bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/model/chat1.svg"
                    alt=""
                    aria-hidden="true"
                    className="size-4"
                  />{' '}
                  {t('modelDetail.chat')}
                </button>
              </div>
            </div>

            <div className="mx-auto mt-5 max-w-[1656px] px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-8">
                    {(
                      [
                        {
                          key: 'playground' as const,
                          label: t('modelDetail.tabs.playground'),
                          iconSrc: '/images/model/playground.svg',
                        },
                        {
                          key: 'api' as const,
                          label: t('modelDetail.tabs.api'),
                          iconSrc: '/images/model/api.svg',
                        },
                        {
                          key: 'requests' as const,
                          label: t('modelDetail.tabs.requests'),
                          iconSrc: '/images/model/requests.svg',
                        },
                        {
                          key: 'price' as const,
                          label: t('modelDetail.tabs.price'),
                          iconSrc: null,
                        },
                      ]
                    ).map(({ key: k, label, iconSrc }) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleTabSelect(k)}
                        className={cn(
                          'relative inline-flex items-center gap-2 py-3 text-sm font-medium text-gray-500 dark:text-gray-400',
                          tab === k &&
                            'text-gray-900 dark:text-white/90 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#475CFF]'
                        )}
                      >
                        {iconSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={iconSrc}
                            alt=""
                            aria-hidden="true"
                            className={cn(
                              'size-4 opacity-60 transition-opacity',
                              tab === k && 'opacity-100'
                            )}
                          />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className={cn(
                              'size-4 opacity-60 transition-opacity',
                              tab === k && 'opacity-100'
                            )}
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M15 9a3 3 0 0 0-3-2c-1.7 0-3 1-3 2.5S10.3 12 12 12s3 .9 3 2.5-1.3 2.5-3 2.5a3 3 0 0 1-3-2" />
                            <path d="M12 6.5v1M12 16.5v1" />
                          </svg>
                        )}
                        {label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-primary dark:text-white/90 dark:hover:bg-white/5 lg:hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/model/chat1.svg"
                      alt=""
                      aria-hidden="true"
                      className="size-4"
                    />{' '}
                    {t('modelDetail.chat')}
                  </button>
                </div>
            </div>

            {tab === 'playground' ? (
              <div
                className={cn(
                  'bg-white dark:bg-[#0d1424]',
                  row.capabilities?.includes('TG') ? 'py-4 sm:py-5' : 'py-6'
                )}
              >
                <div
                  className={cn(
                    'mx-auto max-w-[1656px] px-4 sm:px-6 lg:px-8',
                    row.capabilities?.includes('TG') && 'min-h-0'
                  )}
                >
                  {row.capabilities?.includes('TG') ? (
                    /* ── 文本生成：聊天界面（高度随视口收缩，避免输入框被挤出可视区域）── */
                    <TextGeneratorStudio
                      key={panelKey}
                      initialModelId={row.modelId || lookupId}
                      initialModelLabel={row.name || row.modelId}
                      containerClassName="flex h-[min(680px,calc(100dvh-22rem))] min-h-[220px] w-full min-h-0 flex-col overflow-hidden"
                      embeddedModelDetailPlayground
                      embeddedConversationId={row.id}
                      detailModelRow={apiModelRowToTextGenModelRow(row)}
                    />
                  ) : (
                    /* ── 其他模型：参数表单 ── */
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white/90">
                          {t('modelDetail.playground.input')}
                        </h2>

                        <ApiSubmitPanel
                          key={panelKey}
                          fields={playgroundFields}
                          httpDocFileName={
                            row.modelId?.trim()
                              ? `http/${row.modelId.trim()}.md`
                              : 'http/default-chat.md'
                          }
                          onChange={setSubmitInfo}
                        />

                        <div className="mt-4 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="h-9 rounded-full border border-gray-200 px-4 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                            onClick={() => setPanelKey((k) => k + 1)}
                          >
                            {t('modelDetail.playground.reset')}
                          </button>
                          <button
                            type="button"
                            className="h-9 rounded-full bg-[#475CFF] px-4 text-xs font-medium text-white hover:bg-[#3d50ea] disabled:opacity-50"
                            disabled={isPredictionPlayground && playgroundImageLoading}
                            onClick={() => void handlePlaygroundRun()}
                          >
                            {isLoggedInClient()
                              ? t('modelDetail.playground.run')
                              : t('modelDetail.playground.signInToRun')}
                          </button>
                        </div>
                      </div>
                      <div>
                        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white/90">
                          {t('modelDetail.playground.output')}
                        </h2>
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-dark-primary">
                          {isPredictionPlayground ? (
                            <>
                              <div className="mb-3 flex gap-4 border-b border-gray-100 pb-2 text-xs font-medium dark:border-gray-800">
                                <button
                                  type="button"
                                  onClick={() => setPlaygroundOutputViewTab('preview')}
                                  className={cn(
                                    'transition-colors',
                                    playgroundOutputViewTab === 'preview'
                                      ? 'font-semibold text-gray-900 dark:text-white/90'
                                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                                  )}
                                >
                                  {t('modelDetail.playground.preview')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPlaygroundOutputViewTab('json')}
                                  className={cn(
                                    'transition-colors',
                                    playgroundOutputViewTab === 'json'
                                      ? 'font-semibold text-gray-900 dark:text-white/90'
                                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                                  )}
                                >
                                  {t('modelDetail.playground.json')}
                                </button>
                              </div>
                              <div className="min-h-[200px] w-full rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/5">
                                {playgroundOutputViewTab === 'json' ? (
                                  <pre className="max-h-[min(480px,70vh)] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-900 p-4 font-mono text-xs leading-relaxed text-gray-100 dark:bg-black/50 dark:text-gray-200">
                                    {playgroundPredictionPollJson?.trim()
                                      ? playgroundPredictionPollJson
                                      : t('modelDetail.playground.outputJsonPlaceholder')}
                                  </pre>
                                ) : playgroundImageLoading ? (
                                  <div className="space-y-2 text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      {t('modelDetail.playground.generating')}
                                    </p>
                                    {playgroundPollHint ? (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('modelDetail.playground.imagePolling')}
                                      </p>
                                    ) : null}
                                  </div>
                                ) : playgroundImageError ? (
                                  <p className="text-center text-sm text-red-600 dark:text-red-400">
                                    {playgroundImageError}
                                  </p>
                                ) : playgroundPredictionMedia.length > 0 ? (
                                  <div className="flex flex-wrap justify-center gap-4">
                                    {playgroundPredictionMedia.map((m) =>
                                      m.kind === 'video' ? (
                                        <video
                                          key={m.url}
                                          src={m.url}
                                          controls
                                          className="max-h-[min(480px,70vh)] max-w-full rounded-xl border border-gray-200 object-contain dark:border-gray-700"
                                        />
                                      ) : m.kind === 'audio' ? (
                                        <audio
                                          key={m.url}
                                          src={m.url}
                                          controls
                                          className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700"
                                        />
                                      ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          key={m.url}
                                          src={m.url}
                                          alt=""
                                          className="max-h-[min(480px,70vh)] max-w-full rounded-xl border border-gray-200 object-contain dark:border-gray-700"
                                        />
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      {t('modelDetail.playground.preview')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="aspect-video w-full rounded-xl bg-gray-100 dark:bg-white/5" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : tab === 'price' ? (
              <div className="bg-white py-6 dark:bg-[#0d1424]">
                <div
                  className="mx-auto max-w-[1656px] px-4 sm:px-6 lg:px-8"
                  role="region"
                  aria-label={t('modelDetail.pricingDetails')}
                >
                  {showPricingDetailsModule ? (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02] sm:p-5">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white/90">
                        {t('modelDetail.pricingDetails')}
                      </div>
                      <ul className="mt-4 list-none space-y-4">
                        {pricingGroupCards.map((item, idx) => (
                          <ModelDetailPricingGroupCard
                            key={`${item.group ?? 'group'}-${idx}`}
                            item={item}
                            t={t}
                          />
                        ))}
                        {displayPricingTextLines.map((line, idx) => (
                          <li
                            key={`txt-${idx}-${line.slice(0, 32)}`}
                            className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 dark:text-white/85"
                          >
                            {line}
                          </li>
                        ))}
                        {displayPricingObjectTiers
                          .filter(isNonEmptyDisplayPricingObject)
                          .map((tier, idx) => (
                            <ModelDetailPricingObjectTier key={`obj-${idx}`} tier={tier} t={t} />
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-dark-primary dark:text-gray-400">
                      {t('modelDetail.pricing.empty')}
                    </div>
                  )}
                </div>
              </div>
            ) : !row.modelId?.trim() ? (
              <div className="mx-auto mt-6 w-full max-w-[1656px] px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-amber-600 dark:border-gray-800 dark:bg-dark-primary dark:text-amber-400">
                  {t('modelDetail.requests.noModelId')}
                </div>
              </div>
            ) : (
              <ModelRequestsPanel modelId={row.modelId.trim()} />
            )}
          </>
        )}
      </div>
    </section>
  );
}

