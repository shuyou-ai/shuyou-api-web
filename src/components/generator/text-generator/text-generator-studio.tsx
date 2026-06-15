'use client';

import { useChat } from '@ai-sdk/react';
import { createIdGenerator } from 'ai';
import { useI18n } from '../../../lib/studio-text';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import GeneratorInput from '../generator-input';
import { RenderMessage } from '../render-message';
import { isLoggedInClient } from '../../../lib/auth/client';
import { apiFetch } from '../../../lib/api/client';
import { toast } from 'sonner';
import {
  AudioTypeIcon,
  FileTypeIcon,
  ImageTypeIcon,
  TextTypeIcon,
  VideoTypeIcon,
} from '../../../icons/icons';
import { cn } from '../../../lib/utils';

type ChatPart = {
  type?: 'text' | 'reasoning';
  text?: string;
};

type ChatMessage = {
  role?: string;
  parts?: ChatPart[];
  id?: string;
  modelLabel?: string;
  modelAuthorIcon?: string | null;
};

type ChatThread = {
  id: string;
  conversationId: string;
  modelId: string;
  createdAt: number;
  title: string;
  messages: ChatMessage[];
};

export type ModelListRow = {
  id: string;
  modelId: string;
  slug?: string;
  /** 字典行顶层 tags（与 metadata.tags 二选一或并存） */
  tags?: string[];
  name: string;
  author?: string;
  authorName?: string;
  authorIcon?: string;
  providers?: unknown[];
  contextLength?: string;
  displayContextLength?: string;
  inputModalities?: string[];
  outputModalities?: string[];
  displayPricing?: Array<
    | string
    | {
        prompt?: number;
        completion?: number;
        criteria?: string;
        [key: string]: unknown;
      }
  >;
  description?: string;
  discount?: number;
  displayTags?: string[];
  displayMaxCompletionTokens?: string;
  releaseDate?: string;
};

type UploadedAsset = {
  localId: string;
  kind: 'file' | 'image';
  name: string;
  mimeType: string;
  remoteId?: string;
  status: 'uploading' | 'done' | 'error';
};

const CONVERSATION_PAGE_SIZE = 30;
const MESSAGE_PAGE_SIZE = 200;

const DEFAULT_MODEL_ID = 'gpt-4o-mini';
const MODEL_DICT_TYPE = 'provider_model_chat';

const MODEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'gpt-4o-mini', label: 'OpenAI: GPT-4o mini' },
  { value: 'gpt-4o', label: 'OpenAI: GPT-4o' },
  { value: 'gpt-4.1-mini', label: 'OpenAI: GPT-4.1 mini' },
];

const SYSTEM_PROMPT_MAX_LEN = 1000;

type ModelGenerateConfig = {
  systemPrompt: string;
  maxMessageCount: number;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
};

const DEFAULT_MODEL_GENERATE_CONFIG: ModelGenerateConfig = {
  systemPrompt: '',
  maxMessageCount: 0,
  temperature: 0,
  topP: 0,
  maxOutputTokens: 0,
};

function clampNum(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function stepRound(n: number, step: number) {
  const k = Math.round(n / step);
  return k * step;
}

function buildGenerateParams(
  message: string,
  cfg: ModelGenerateConfig,
  featureFlags: { enableThinking: boolean; enableSearch: boolean },
  attachments: { fileIds: string[]; imageIds: string[] }
): Record<string, unknown> {
  return {
    message,
    prompt: cfg.systemPrompt.trim(),
    message_count: cfg.maxMessageCount,
    temperature: cfg.temperature,
    top_p: cfg.topP,
    max_tokens: cfg.maxOutputTokens,
    enable_thinking: featureFlags.enableThinking,
    enable_search: featureFlags.enableSearch,
    file_ids: attachments.fileIds,
    image_ids: attachments.imageIds,
  };
}

function InputToolbarAtomIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
    </svg>
  );
}

function InputToolbarGlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c-4 4.5-4 13.5 0 18M12 3c4 4.5 4 13.5 0 18" />
    </svg>
  );
}

function ChatListKebabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

function safeUUID() {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    // ignore
  }
  return `chat_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function deriveTitleFromMessages(messages: ChatMessage[]): string {
  try {
    const userMsg = messages.find((m) => m?.role === 'user');
    if (!userMsg) return '';
    const textPart = userMsg?.parts?.find((p) => p?.type === 'text');
    const text = (textPart?.text ?? '').trim();
    if (!text) return '';
    return text.length > 26 ? `${text.slice(0, 26)}…` : text;
  } catch {
    return '';
  }
}

function normalizeConversationRow(row: Record<string, unknown>): ChatThread | null {
  const idRaw = row.id ?? row.conversationId;
  if (idRaw == null) return null;
  const id = String(idRaw);
  const conversationId = String(row.conversationId ?? id);
  const titleRaw = row.title;
  const createdAtRaw = row.createTime ?? row.createdAt ?? row.updateTime ?? row.updatedAt;
  const modelIdRaw = row.modelId;

  return {
    id,
    conversationId,
    modelId:
      typeof modelIdRaw === 'string' && modelIdRaw.trim() ? modelIdRaw : DEFAULT_MODEL_ID,
    createdAt:
      typeof createdAtRaw === 'number'
        ? createdAtRaw
        : Date.parse(String(createdAtRaw ?? '')) || Date.now(),
    title:
      typeof titleRaw === 'string' && titleRaw.trim()
        ? titleRaw
        : 'Untitled conversation',
    messages: [],
  };
}

function parseConversationPageRows(data: unknown): ChatThread[] {
  if (!data || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;
  const pageObj =
    d.page && typeof d.page === 'object' ? (d.page as Record<string, unknown>) : null;
  const rows =
    (Array.isArray(d.rows) && d.rows) ||
    (Array.isArray(d.records) && d.records) ||
    (Array.isArray(d.list) && d.list) ||
    (Array.isArray(pageObj?.rows) && pageObj?.rows) ||
    (Array.isArray(pageObj?.records) && pageObj?.records) ||
    [];
  return rows
    .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
    .map(normalizeConversationRow)
    .filter((x): x is ChatThread => x !== null);
}

function parseMessagePageRows(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;
  const pageObj =
    d.page && typeof d.page === 'object' ? (d.page as Record<string, unknown>) : null;
  const rows =
    (Array.isArray(d.rows) && d.rows) ||
    (Array.isArray(d.records) && d.records) ||
    (Array.isArray(d.list) && d.list) ||
    (Array.isArray(pageObj?.rows) && pageObj?.rows) ||
    (Array.isArray(pageObj?.records) && pageObj?.records) ||
    [];
  return rows.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object');
}

function normalizeMessageRow(row: Record<string, unknown>): ChatMessage[] {
  const userTextRaw = row.message ?? row.userMessage ?? row.prompt ?? '';
  const assistantTextRaw = row.assistant ?? row.answer ?? row.response ?? row.outputText ?? '';
  const reasoningRaw =
    row.reasoning ?? row.thinking ?? row.reasonContent ?? row.reasoningContent ?? '';
  const userText =
    typeof userTextRaw === 'string' ? userTextRaw.trim() : String(userTextRaw ?? '').trim();
  const assistantText =
    typeof assistantTextRaw === 'string'
      ? assistantTextRaw.trim()
      : String(assistantTextRaw ?? '').trim();
  const reasoning =
    typeof reasoningRaw === 'string' ? reasoningRaw.trim() : String(reasoningRaw ?? '').trim();
  const modelLabel =
    typeof row.model === 'string'
      ? row.model
      : typeof row.modelLabel === 'string'
        ? row.modelLabel
        : typeof row.modelName === 'string'
          ? row.modelName
          : undefined;
  const modelAuthorIcon =
    typeof row.providerIcon === 'string' && row.providerIcon.trim()
      ? row.providerIcon
      : typeof row.modelAuthorIcon === 'string'
        ? row.modelAuthorIcon
        : typeof row.modelIcon === 'string'
          ? row.modelIcon
          : undefined;

  const out: ChatMessage[] = [];
  if (userText) {
    out.push({
      id: `${String(row.id ?? safeUUID())}_u`,
      role: 'user',
      parts: [{ type: 'text', text: userText }],
    });
  }
  if (assistantText || reasoning) {
    out.push(
      makeAssistantMessage({
        answer: assistantText,
        reasoning,
        modelLabel,
        modelAuthorIcon,
      })
    );
  }
  return out;
}

function extractModelRowsFromDictData(data: unknown): Record<string, unknown>[] {
  const providers: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    providers.push(...data.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object'));
  } else if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const arr =
      (Array.isArray(d.rows) && d.rows) ||
      (Array.isArray(d.list) && d.list) ||
      (Array.isArray(d.records) && d.records) ||
      [];
    providers.push(...arr.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object'));
  }

  const sortedProviders = [...providers].sort((a, b) => {
    const as = Number(a.sort ?? Number.MAX_SAFE_INTEGER);
    const bs = Number(b.sort ?? Number.MAX_SAFE_INTEGER);
    return as - bs;
  });

  const out: Record<string, unknown>[] = [];
  for (const p of sortedProviders) {
    const providerLabel = String(p.label ?? p.value ?? p.parentId ?? 'Other');
    const providerValue = String(p.value ?? providerLabel);
    const providerIcon =
      typeof p.icon === 'string'
        ? p.icon
        : (p.metadata &&
            typeof p.metadata === 'object' &&
            typeof (p.metadata as Record<string, unknown>).icon === 'string'
            ? String((p.metadata as Record<string, unknown>).icon)
            : undefined);

    const children = Array.isArray(p.children)
      ? (p.children.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object') as Record<
          string,
          unknown
        >[])
      : [];
    const sortedChildren = [...children].sort((a, b) => {
      const as = Number(a.sort ?? Number.MAX_SAFE_INTEGER);
      const bs = Number(b.sort ?? Number.MAX_SAFE_INTEGER);
      return as - bs;
    });

    for (const child of sortedChildren) {
      out.push({
        ...child,
        providerLabel,
        providerValue,
        providerIcon,
      });
    }
  }
  return out;
}

function normalizeModelRowFromDict(row: Record<string, unknown>): ModelListRow | null {
  const meta =
    row.metadata && typeof row.metadata === 'object'
      ? (row.metadata as Record<string, unknown>)
      : null;

  const modelIdRaw =
    (meta?.modelId as unknown) ??
    row.modelId ??
    row.value ??
    row.id ??
    (meta?.slug as unknown) ??
    row.slug;
  if (modelIdRaw == null) return null;
  const modelId = String(modelIdRaw);
  const id = String((meta?.id as unknown) ?? row.id ?? modelId);
  const name = String((meta?.name as unknown) ?? row.name ?? row.label ?? row.modelName ?? modelId);

  const pricingTiers =
    meta?.pricing && typeof meta.pricing === 'object'
      ? (meta.pricing as Record<string, unknown>).tiers
      : undefined;
  const displayPricing = Array.isArray(pricingTiers)
    ? pricingTiers
        .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
        .map((x) => ({
          prompt: typeof x.prompt === 'number' ? x.prompt : undefined,
          completion: typeof x.completion === 'number' ? x.completion : undefined,
        }))
    : undefined;

  const contextLengthRaw = (meta?.contextLength as unknown) ?? row.contextLength;
  const maxOutputRaw = (meta?.maxCompletionTokens as unknown) ?? row.displayMaxCompletionTokens;

  return {
    id,
    modelId,
    slug:
      typeof (meta?.slug as unknown) === 'string'
        ? String(meta?.slug)
        : typeof row.slug === 'string'
          ? row.slug
          : undefined,
    name,
    author:
      typeof (meta?.author as unknown) === 'string'
        ? String(meta?.author)
        : typeof row.providerValue === 'string'
          ? row.providerValue
          : undefined,
    authorName: typeof row.providerLabel === 'string' ? row.providerLabel : undefined,
    authorIcon:
      typeof row.providerIcon === 'string'
        ? row.providerIcon
        : typeof row.icon === 'string'
          ? row.icon
          : undefined,
    providers:
      (Array.isArray(meta?.providers) && (meta?.providers as unknown[])) ||
      (Array.isArray(row.providers) && row.providers) ||
      undefined,
    contextLength:
      contextLengthRaw != null && contextLengthRaw !== '' ? String(contextLengthRaw) : undefined,
    displayContextLength:
      contextLengthRaw != null && contextLengthRaw !== '' ? String(contextLengthRaw) : undefined,
    inputModalities: Array.isArray(meta?.inputModalities)
      ? (meta?.inputModalities as string[])
      : undefined,
    outputModalities: Array.isArray(meta?.outputModalities)
      ? (meta?.outputModalities as string[])
      : undefined,
    displayPricing,
    description:
      typeof (meta?.description as unknown) === 'string'
        ? String(meta?.description)
        : typeof row.description === 'string'
          ? row.description
          : undefined,
    discount: typeof row.discount === 'number' ? row.discount : undefined,
    displayTags: Array.isArray(meta?.tags)
      ? (meta?.tags as string[])
      : Array.isArray(row.tags)
        ? (row.tags as string[])
        : undefined,
    displayMaxCompletionTokens:
      maxOutputRaw != null && maxOutputRaw !== '' ? String(maxOutputRaw) : undefined,
    releaseDate:
      typeof (meta?.releaseDate as unknown) === 'string'
        ? String(meta?.releaseDate)
        : typeof row.releaseDate === 'string'
          ? row.releaseDate
          : undefined,
  };
}

function makeTextMessage(role: 'user' | 'assistant', text: string): ChatMessage {
  return {
    id: safeUUID(),
    role,
    parts: [{ type: 'text', text }],
  };
}

function buildAssistantMessageParts(answer: string, reasoning: string): ChatPart[] {
  const parts: ChatPart[] = [];
  if (reasoning.length > 0) parts.push({ type: 'reasoning', text: reasoning });
  if (answer.length > 0) parts.push({ type: 'text', text: answer });
  return parts;
}

function makeAssistantMessage({
  answer = '',
  reasoning = '',
  modelLabel,
  modelAuthorIcon,
  id,
}: {
  answer?: string;
  reasoning?: string;
  modelLabel?: string;
  modelAuthorIcon?: string | null;
  id?: string;
}): ChatMessage {
  return {
    id: id ?? safeUUID(),
    role: 'assistant',
    parts: buildAssistantMessageParts(answer, reasoning),
    modelLabel,
    modelAuthorIcon: modelAuthorIcon ?? null,
  };
}

function extractGenerateText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const obj = payload as Record<string, unknown>;
  if (typeof obj.text === 'string' && obj.text.trim()) return obj.text;
  if (typeof obj.content === 'string' && obj.content.trim()) return obj.content;
  const choices = obj.choices;
  if (Array.isArray(choices)) {
    let merged = '';
    for (const c of choices) {
      if (!c || typeof c !== 'object') continue;
      const choice = c as Record<string, unknown>;
      const delta = choice.delta;
      if (delta && typeof delta === 'object') {
        const d = delta as Record<string, unknown>;
        if (typeof d.content === 'string' && d.content) {
          merged += d.content;
        }
      }
      const message = choice.message;
      if (message && typeof message === 'object') {
        const m = message as Record<string, unknown>;
        if (typeof m.content === 'string' && m.content) {
          merged += m.content;
        }
      }
      if (typeof choice.text === 'string' && choice.text) {
        merged += choice.text;
      }
    }
    if (merged) return merged;
  }
  const data = obj.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.text === 'string' && d.text.trim()) return d.text;
    if (typeof d.content === 'string' && d.content.trim()) return d.content;
    if (typeof d.output === 'string' && d.output.trim()) return d.output;
    const dChoices = d.choices;
    if (Array.isArray(dChoices)) {
      let merged = '';
      for (const c of dChoices) {
        if (!c || typeof c !== 'object') continue;
        const choice = c as Record<string, unknown>;
        const delta = choice.delta;
        if (delta && typeof delta === 'object') {
          const dd = delta as Record<string, unknown>;
          if (typeof dd.content === 'string' && dd.content) {
            merged += dd.content;
          }
        }
      }
      if (merged) return merged;
    }
  }
  return '';
}

function extractGenerateReasoning(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const obj = payload as Record<string, unknown>;

  if (typeof obj.reasoning === 'string' && obj.reasoning.trim()) return obj.reasoning;

  const choices = obj.choices;
  if (Array.isArray(choices)) {
    let merged = '';
    for (const c of choices) {
      if (!c || typeof c !== 'object') continue;
      const choice = c as Record<string, unknown>;
      const delta = choice.delta;
      if (delta && typeof delta === 'object') {
        const d = delta as Record<string, unknown>;
        if (typeof d.reasoning === 'string' && d.reasoning) merged += d.reasoning;
      }
      const message = choice.message;
      if (message && typeof message === 'object') {
        const m = message as Record<string, unknown>;
        if (typeof m.reasoning === 'string' && m.reasoning) merged += m.reasoning;
      }
    }
    if (merged) return merged;
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.reasoning === 'string' && d.reasoning.trim()) return d.reasoning;
    const dChoices = d.choices;
    if (Array.isArray(dChoices)) {
      let merged = '';
      for (const c of dChoices) {
        if (!c || typeof c !== 'object') continue;
        const choice = c as Record<string, unknown>;
        const delta = choice.delta;
        if (delta && typeof delta === 'object') {
          const dd = delta as Record<string, unknown>;
          if (typeof dd.reasoning === 'string' && dd.reasoning) merged += dd.reasoning;
        }
      }
      if (merged) return merged;
    }
  }

  return '';
}

function extractGenerateError(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const obj = payload as Record<string, unknown>;
  if (typeof obj.error === 'string' && obj.error.trim()) return obj.error;
  const err = obj.error;
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
  }
  if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
  const data = obj.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.error === 'string' && d.error.trim()) return d.error;
    if (typeof d.message === 'string' && d.message.trim()) return d.message;
  }
  return '';
}

async function readGenerateErrorMessage(res: Response): Promise<string> {
  const fallback = `HTTP ${res.status}`;
  try {
    const raw = await res.text();
    if (!raw.trim()) return fallback;

    try {
      const obj = JSON.parse(raw) as unknown;
      const err = extractGenerateError(obj);
      return err || raw;
    } catch {
      // maybe SSE-like text payload
      const lines = raw.split(/\r?\n/).map((x) => x.trim());
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const obj = JSON.parse(payload) as unknown;
          const err = extractGenerateError(obj);
          if (err) return err;
        } catch {
          // ignore
        }
      }
      return raw;
    }
  } catch {
    return fallback;
  }
}

function modalityIcon(kind: string) {
  switch (kind.toLowerCase()) {
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

function ModalityIconsRow({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {values.map((v) => {
        const Icon = modalityIcon(v);
        if (!Icon) return null;
        return (
          <span
            key={v}
            className="inline-flex items-center justify-center rounded-sm text-gray-800 dark:text-gray-200"
            title={v}
          >
            <Icon className="size-4" />
          </span>
        );
      })}
    </div>
  );
}

/** `displayPricing` 首条含数值的对象项（跳过纯字符串文案项） */
function firstDisplayPricingObject(model: ModelListRow | null | undefined): {
  prompt?: number;
  completion?: number;
} | undefined {
  const arr = model?.displayPricing;
  if (!Array.isArray(arr)) return undefined;
  for (const x of arr) {
    if (typeof x === 'object' && x !== null && !Array.isArray(x)) {
      return x as { prompt?: number; completion?: number };
    }
  }
  return undefined;
}

function ModelEmptyState({
  modelLabel,
  model,
  t,
}: {
  modelLabel: string;
  model: ModelListRow | null;
  t: (key: string) => string;
}) {
  const title = model
    ? `${model.authorName ? `${model.authorName}: ` : ''}${model.name || model.modelId || modelLabel}`
    : modelLabel;
  const modelId = model?.modelId || modelLabel;
  const providerCount = Array.isArray(model?.providers) ? model?.providers.length : 0;
  const context = model?.displayContextLength || model?.contextLength || '-';
  const inputMods = model?.inputModalities ?? [];
  const outputMods = model?.outputModalities ?? [];
  const maxOutput = model?.displayMaxCompletionTokens || '-';
  const discount = Number(model?.discount);
  const pricingTier = firstDisplayPricingObject(model);
  const showDiscount = Number.isFinite(discount) && discount > 0;

  return (
    <div className="w-full px-5 py-6 md:px-12 lg:h-full lg:flex lg:items-center lg:justify-center">
      <div className="w-full max-w-[720px]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-md dark:border-gray-700 dark:bg-dark-primary/60">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-white/10 dark:text-white/80">
                {model?.authorIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={model.authorIcon}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span aria-hidden>{(title || '?').trim().slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="min-w-0 truncate text-base font-semibold text-gray-900 dark:text-white">
                    {title}
                  </p>
                  {model?.displayTags?.includes('newest') ? (
                    <span className="shrink-0 rounded-sm bg-[#FF6164] px-1 py-1 text-[10px] leading-none text-white">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 min-w-0 truncate text-xs text-gray-500 dark:text-gray-400">
                  {modelId}
                </p>
              </div>
            </div>
          </div>

          {(pricingTier?.prompt != null ||
            pricingTier?.completion != null ||
            showDiscount) ? (
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {pricingTier?.prompt != null ? (
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-[#475CFF] dark:text-[#8B97FF]">
                    ${pricingTier.prompt}
                  </span>
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    /M input tokens
                  </span>
                </span>
              ) : null}
              {pricingTier?.completion != null ? (
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-[#475CFF] dark:text-[#8B97FF]">
                    ${pricingTier.completion}
                  </span>
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    /M output tokens
                  </span>
                </span>
              ) : null}
              {showDiscount ? (
                <span className="shrink-0 rounded-sm bg-[#2CCD82] px-1 py-0.5 text-[11px] font-semibold text-white">
                  {Math.round(discount)}% off
                </span>
              ) : null}
            </div>
          ) : null}

          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-[#7D7D84] dark:text-gray-400">
            {model?.description || '-'}
          </p>

          <div className="mt-auto rounded-xl text-xs text-gray-600 dark:text-gray-300">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="shrink-0 whitespace-nowrap font-medium text-gray-700 dark:text-gray-200">
                  {t('models.card.inputLabel')}:
                </span>
                <ModalityIconsRow values={inputMods} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="shrink-0 whitespace-nowrap font-medium text-gray-700 dark:text-gray-200">
                  {t('models.card.outputLabel')}:
                </span>
                <ModalityIconsRow values={outputMods} />
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <span className="font-medium text-gray-700 dark:text-gray-200">Context:</span>
                <span className="text-gray-700 dark:text-gray-200">{context}</span>
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <span className="font-medium text-gray-700 dark:text-gray-200">Max Output:</span>
                <span className="text-gray-700 dark:text-gray-200">{maxOutput}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-2 pt-2.5">
              <span className="h-[22px] flex items-center text-[11px] text-gray-400 dark:text-gray-500">
                by {model?.author || model?.authorName || '-'}
                {model?.releaseDate ? ` | ${model.releaseDate.split(' ')[0]}` : ''}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                Providers: {providerCount}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function TextGeneratorStudio({
  initialChatId,
  initialModelId,
  initialModelLabel,
  containerClassName,
  /** 模型详情页嵌入的对话 playground：隐藏侧栏历史、模型选择与中间模型信息卡 */
  embeddedModelDetailPlayground = false,
  /** 嵌入模式下用于补齐字典未返回时的模型元数据（输入类型、标签等） */
  detailModelRow = null,
  /** 嵌入模式：与 /api/model/detail 返回的 id 一致，作为会话 conversationId，并用 /api/chat/message/page 恢复历史 */
  embeddedConversationId,
}: {
  initialChatId?: string;
  initialModelId?: string;
  initialModelLabel?: string;
  containerClassName?: string;
  embeddedModelDetailPlayground?: boolean;
  detailModelRow?: ModelListRow | null;
  embeddedConversationId?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId ?? null);
  const [activeModelId, setActiveModelId] = useState<string>(initialModelId ?? '');
  const [activeModelLabel, setActiveModelLabel] = useState<string>(
    initialModelLabel ?? initialModelId ?? ''
  );
  const [activeModelAuthorIcon, setActiveModelAuthorIcon] = useState<string | null>(null);
  const [activeModelData, setActiveModelData] = useState<ModelListRow | null>(null);
  const activeChatIdRef = useRef<string | null>(activeChatId);
  const modelPanelRef = useRef<HTMLDivElement | null>(null);

  const [isThinking, setIsThinking] = useState(false);
  const [modelPanelOpen, setModelPanelOpen] = useState(false);
  const [activeProviderName, setActiveProviderName] = useState('');

  const [modelRows, setModelRows] = useState<ModelListRow[]>([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [chatListLoadingMore, setChatListLoadingMore] = useState(false);
  const [chatListHasMore, setChatListHasMore] = useState(true);
  const [chatListPageNum, setChatListPageNum] = useState(1);
  const [input, setInput] = useState('');

  const [modelGenerateConfig, setModelGenerateConfig] = useState<ModelGenerateConfig>(
    DEFAULT_MODEL_GENERATE_CONFIG
  );
  const [modelConfigDraft, setModelConfigDraft] = useState<ModelGenerateConfig>(
    DEFAULT_MODEL_GENERATE_CONFIG
  );
  const [showModelConfigDialog, setShowModelConfigDialog] = useState(false);
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const chatListScrollRef = useRef<HTMLDivElement | null>(null);
  const messageLoadReqRef = useRef<string | null>(null);
  const chatMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [chatMenuThreadId, setChatMenuThreadId] = useState<string | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [clearAllBusy, setClearAllBusy] = useState(false);
  /** 非 SSE 响应时，对最新助手回复做打字机展示 */
  const [animatingAnswerMessageId, setAnimatingAnswerMessageId] = useState<string | null>(
    null
  );

  const chatHandler = useChat({
    generateId: createIdGenerator({ prefix: 'msgc' }),
    sendExtraMessageFields: true,
    onResponse: () => setIsThinking(false),
  });

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    return () => {
      if (chatMenuCloseTimerRef.current != null) {
        window.clearTimeout(chatMenuCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const tags = activeModelData?.displayTags;
    if (!tags?.includes('reasoning')) setEnableThinking(false);
    if (!tags?.includes('web-search')) setEnableSearch(false);
  }, [activeModelData?.modelId, activeModelData?.displayTags]);

  useEffect(() => {
    if (isLoggedInClient()) return;
    router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  useEffect(() => {
    if (activeModelLabel && activeModelLabel !== activeModelId) return;
    const hit = MODEL_OPTIONS.find((x) => x.value === activeModelId);
    if (hit?.label) setActiveModelLabel(hit.label);
  }, [activeModelId, activeModelLabel]);

  async function fetchConversationPage(pageNum: number, append: boolean) {
    const setLoading = append ? setChatListLoadingMore : setChatListLoading;
    setLoading(true);
    try {
      const res = await apiFetch('/api/chat/conversation/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          order: 'desc',
          pageNum: String(pageNum),
          pageSize: String(CONVERSATION_PAGE_SIZE),
          query: { title: '' },
          sort: 'createTime',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        code?: number;
        msg?: string;
        data?: unknown;
      };
      if (json.code !== 0) throw new Error(json.msg || `API code ${json.code}`);
      const rows = parseConversationPageRows(json.data);
      setChats((prev) => {
        if (!append) return rows;
        const map = new Map<string, ChatThread>();
        for (const c of prev) map.set(c.id, c);
        for (const c of rows) if (!map.has(c.id)) map.set(c.id, c);
        return Array.from(map.values());
      });
      setChatListPageNum(pageNum);
      setChatListHasMore(rows.length >= CONVERSATION_PAGE_SIZE);
      return rows;
    } catch (e) {
      toast.error((e as Error).message || '加载会话失败');
      setChatListHasMore(false);
      return [] as ChatThread[];
    } finally {
      setLoading(false);
    }
  }

  async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const reqKey = `${conversationId}_${Date.now()}`;
    messageLoadReqRef.current = reqKey;
    try {
      const res = await apiFetch('/api/chat/message/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          order: 'asc',
          pageNum: '1',
          pageSize: String(MESSAGE_PAGE_SIZE),
          query: { conversationId },
          sort: 'requestTime',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        code?: number;
        msg?: string;
        data?: unknown;
      };
      if (json.code !== 0) throw new Error(json.msg || `API code ${json.code}`);
      const rows = parseMessagePageRows(json.data);
      const normalized = rows.flatMap(normalizeMessageRow);
      if (messageLoadReqRef.current !== reqKey) return [];
      return normalized;
    } catch (e) {
      if (messageLoadReqRef.current === reqKey) {
        toast.error((e as Error).message || '加载会话消息失败');
      }
      return [];
    }
  }

  useEffect(() => {
    if (embeddedModelDetailPlayground) return;
    let mounted = true;
    (async () => {
      const firstPage = await fetchConversationPage(1, false);
      if (!mounted) return;

      let firstId = initialChatId ?? null;
      if (firstId && !firstPage.some((c) => c.id === firstId)) {
        firstId = null;
      }
      if (!firstId) {
        firstId = firstPage[0]?.id ?? null;
      }
      if (firstId) {
        const chat = firstPage.find((c) => c.id === firstId);
        activeChatIdRef.current = firstId;
        setActiveChatId(firstId);
        setActiveModelId(chat?.modelId ?? DEFAULT_MODEL_ID);
        if (chat?.conversationId) {
          const loadedMessages = await fetchConversationMessages(chat.conversationId);
          if (!mounted) return;
          setChats((prev) =>
            prev.map((c) => (c.id === firstId ? { ...c, messages: loadedMessages } : c))
          );
          chatHandler.setMessages(loadedMessages as unknown as typeof chatHandler.messages);
        } else {
          chatHandler.setMessages(chat?.messages ?? []);
        }
      }
      setHydrated(true);
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 模型详情嵌入：会话 id = 详情接口 id，进入时拉取历史消息 */
  useEffect(() => {
    if (!embeddedModelDetailPlayground) return;
    let mounted = true;
    setHydrated(false);

    (async () => {
      const mid = initialModelId?.trim() || DEFAULT_MODEL_ID;
      const convId = embeddedConversationId?.trim();

      if (!convId) {
        const id = safeUUID();
        const thread: ChatThread = {
          id,
          conversationId: safeUUID(),
          modelId: mid,
          createdAt: Date.now(),
          title: t('generator.textGenerator.newChatTitle'),
          messages: [],
        };
        activeChatIdRef.current = id;
        setActiveChatId(id);
        setChats([thread]);
        chatHandler.setMessages([]);
        if (mounted) setHydrated(true);
        return;
      }

      const thread: ChatThread = {
        id: convId,
        conversationId: convId,
        modelId: mid,
        createdAt: Date.now(),
        title: t('generator.textGenerator.newChatTitle'),
        messages: [],
      };
      activeChatIdRef.current = convId;
      setActiveChatId(convId);
      setChats([thread]);
      chatHandler.setMessages([]);

      const loadedMessages = await fetchConversationMessages(convId);
      if (!mounted) return;
      setChats([{ ...thread, messages: loadedMessages }]);
      chatHandler.setMessages(loadedMessages as unknown as typeof chatHandler.messages);
      setHydrated(true);
    })();

    return () => {
      mounted = false;
    };
    // fetchConversationMessages / chatHandler 仅初始化拉取用；勿加入 deps 避免不必要的重置
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embeddedModelDetailPlayground, embeddedConversationId, initialModelId, t]);

  useEffect(() => {
    if (!modelPanelOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (modelPanelRef.current?.contains(target)) return;
      setModelPanelOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [modelPanelOpen]);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setModelLoading(true);
      setModelError(null);
      try {
        const res = await apiFetch(`/api/query/data/${MODEL_DICT_TYPE}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          code: number;
          msg?: string;
          data?: unknown;
        };
        if (json.code !== 0) throw new Error(json.msg || `API code ${json.code}`);
        const allRows = extractModelRowsFromDictData(json.data)
          .map(normalizeModelRowFromDict)
          .filter((x): x is ModelListRow => x !== null);
        setModelRows(allRows);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setModelRows([]);
        setModelError((e as Error).message || String(e));
      } finally {
        setModelLoading(false);
      }
    }
    run();
    return () => controller.abort();
  }, []);

  const providerGroups = useMemo(() => {
    const map = new Map<string, { name: string; icon?: string; models: ModelListRow[] }>();
    for (const m of modelRows) {
      const providerName = (m.authorName || m.author || 'Other').trim() || 'Other';
      const hit = map.get(providerName);
      if (hit) {
        hit.models.push(m);
        if (!hit.icon && m.authorIcon) hit.icon = m.authorIcon;
      } else {
        map.set(providerName, {
          name: providerName,
          icon: m.authorIcon || undefined,
          models: [m],
        });
      }
    }
    return Array.from(map.values());
  }, [modelRows]);

  const activeProviderGroup = useMemo(() => {
    if (providerGroups.length === 0) return null;
    const byName = providerGroups.find((g) => g.name === activeProviderName);
    if (byName) return byName;
    const byModel = providerGroups.find((g) =>
      g.models.some((m) => (m.modelId || m.id) === activeModelId)
    );
    return byModel || providerGroups[0];
  }, [providerGroups, activeProviderName, activeModelId]);

  useEffect(() => {
    if (!activeProviderGroup) return;
    if (activeProviderName === activeProviderGroup.name) return;
    setActiveProviderName(activeProviderGroup.name);
  }, [activeProviderGroup, activeProviderName]);

  useEffect(() => {
    const hit =
      activeModelId && modelRows.length > 0
        ? modelRows.find((m) => (m.modelId || m.id) === activeModelId)
        : null;

    if (embeddedModelDetailPlayground) {
      if (detailModelRow) {
        const target = hit ?? detailModelRow;
        setActiveModelAuthorIcon(target.authorIcon || null);
        if (target.name) setActiveModelLabel(target.name);
        setActiveModelData(target);
        return;
      }
      if (modelRows.length === 0) return;
      const target = hit;
      if (!target) return;
      setActiveModelAuthorIcon(target.authorIcon || null);
      if (target.name) setActiveModelLabel(target.name);
      setActiveModelData(target);
      return;
    }

    if (modelRows.length === 0) return;
    const target = hit || modelRows[0];
    if (!target) return;

    const targetId = target.modelId || target.id;
    if (!activeModelId || !hit) {
      setActiveModelId(targetId);
    }
    setActiveModelAuthorIcon(target.authorIcon || null);
    if (target.name) setActiveModelLabel(target.name);
    setActiveModelData(target);
  }, [modelRows, activeModelId, embeddedModelDetailPlayground, detailModelRow]);

  function selectModel(model: ModelListRow) {
    setActiveModelId(model.modelId || model.id);
    setActiveModelLabel(model.name || model.modelId || model.id);
    setActiveModelAuthorIcon(model.authorIcon || null);
    setActiveModelData(model);
    setModelPanelOpen(false);
    if (!activeChatIdRef.current) return;
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatIdRef.current
          ? { ...c, modelId: model.modelId || model.id }
          : c
      )
    );
  }

  // Persist messages into the selected chat thread.
  useEffect(() => {
    if (!hydrated) return;
    const id = activeChatIdRef.current;
    if (!id) return;

    const title = deriveTitleFromMessages(chatHandler.messages as unknown as ChatMessage[]);

    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;

      const next = [...prev];
      next[idx] = {
        ...next[idx],
        modelId: activeModelId,
        title: title || next[idx].title || t('generator.textGenerator.newChatTitle'),
        messages: chatHandler.messages as unknown as ChatMessage[],
      };
      return next;
    });
  }, [chatHandler.messages, hydrated, activeModelId, t]);

  function createNewChat() {
    const id = safeUUID();
    const nextChat: ChatThread = {
      id,
      conversationId: safeUUID(),
      modelId: activeModelId,
      createdAt: Date.now(),
      title: t('generator.textGenerator.newChatTitle'),
      messages: [],
    };

    setChats((prev) => [nextChat, ...prev]);
    activeChatIdRef.current = id;
    setActiveChatId(id);
    chatHandler.setMessages([]);
  }

  async function selectChat(threadId: string) {
    const chat = chats.find((c) => c.id === threadId);
    if (!chat) return;

    activeChatIdRef.current = threadId;
    setActiveChatId(threadId);
    setActiveModelId(chat.modelId || DEFAULT_MODEL_ID);
    const loadedMessages = await fetchConversationMessages(chat.conversationId);
    if (activeChatIdRef.current !== threadId) return;
    setChats((prev) =>
      prev.map((c) => (c.id === threadId ? { ...c, messages: loadedMessages } : c))
    );
    chatHandler.setMessages(loadedMessages as unknown as typeof chatHandler.messages);
    setIsThinking(false);
  }

  function clearChatMenuCloseTimer() {
    if (chatMenuCloseTimerRef.current != null) {
      window.clearTimeout(chatMenuCloseTimerRef.current);
      chatMenuCloseTimerRef.current = null;
    }
  }

  function scheduleChatMenuClose() {
    clearChatMenuCloseTimer();
    chatMenuCloseTimerRef.current = window.setTimeout(() => {
      setChatMenuThreadId(null);
      chatMenuCloseTimerRef.current = null;
    }, 220);
  }

  function openChatMenu(threadId: string) {
    clearChatMenuCloseTimer();
    setChatMenuThreadId(threadId);
  }

  async function persistConversationTitle(thread: ChatThread, title: string) {
    const res = await apiFetch('/ai/chat/conversation/update', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: thread.conversationId, title }),
      cache: 'no-store',
    });
    const json = (await res.json()) as { code?: number; msg?: string };
    if (!res.ok) throw new Error(json.msg || `HTTP ${res.status}`);
    if (json.code !== 0) throw new Error(json.msg || t('generator.textGenerator.chatList.renameError'));
  }

  async function removeConversation(thread: ChatThread) {
    const res = await apiFetch('/ai/chat/conversation/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify([thread.conversationId]),
      cache: 'no-store',
    });
    const json = (await res.json()) as { code?: number; msg?: string };
    if (!res.ok) throw new Error(json.msg || `HTTP ${res.status}`);
    if (json.code !== 0) throw new Error(json.msg || t('generator.textGenerator.chatList.deleteError'));
  }

  async function handleSaveRenameTitle() {
    if (!renameTargetId || renameSaving) return;
    const title = renameDraft.trim();
    if (!title) {
      toast.error(t('generator.textGenerator.chatList.renameEmpty'));
      return;
    }
    const thread = chats.find((c) => c.id === renameTargetId);
    if (!thread) return;
    setRenameSaving(true);
    try {
      await persistConversationTitle(thread, title);
      setChats((prev) =>
        prev.map((c) => (c.id === renameTargetId ? { ...c, title } : c))
      );
      setRenameTargetId(null);
      setRenameDraft('');
      toast.success(t('generator.textGenerator.chatList.renameSuccess'));
    } catch (e) {
      toast.error((e as Error).message || t('generator.textGenerator.chatList.renameError'));
    } finally {
      setRenameSaving(false);
    }
  }

  async function handleConfirmDeleteConversation() {
    if (!deleteTargetId || deleteSaving) return;
    const thread = chats.find((c) => c.id === deleteTargetId);
    if (!thread) return;
    setDeleteSaving(true);
    try {
      await removeConversation(thread);
      const remaining = chats.filter((c) => c.id !== deleteTargetId);
      setChats(remaining);
      setDeleteTargetId(null);
      clearChatMenuCloseTimer();
      setChatMenuThreadId(null);
      toast.success(t('generator.textGenerator.chatList.deleteSuccess'));
      if (activeChatId === thread.id) {
        if (remaining[0]) {
          void selectChat(remaining[0].id);
        } else {
          createNewChat();
        }
      }
    } catch (e) {
      toast.error((e as Error).message || t('generator.textGenerator.chatList.deleteError'));
    } finally {
      setDeleteSaving(false);
    }
  }

  async function handleClearAllConversations() {
    if (clearAllBusy) return;
    setClearAllBusy(true);
    try {
      const res = await apiFetch('/ai/chat/conversation/clear', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
        cache: 'no-store',
      });
      const json = (await res.json()) as { code?: number; msg?: string };
      if (!res.ok) throw new Error(json.msg || `HTTP ${res.status}`);
      if (json.code !== 0) {
        throw new Error(json.msg || t('generator.textGenerator.chatList.clearAllError'));
      }
      setClearAllDialogOpen(false);
      clearChatMenuCloseTimer();
      setChatMenuThreadId(null);
      const rows = await fetchConversationPage(1, false);
      toast.success(t('generator.textGenerator.chatList.clearAllSuccess'));
      if (rows.length > 0) {
        void selectChat(rows[0].id);
      } else {
        createNewChat();
      }
    } catch (e) {
      toast.error((e as Error).message || t('generator.textGenerator.chatList.clearAllError'));
    } finally {
      setClearAllBusy(false);
    }
  }

  async function uploadAsset(file: File, kind: 'file' | 'image') {
    const localId = safeUUID();
    setUploadedAssets((prev) => [
      ...prev,
      {
        localId,
        kind,
        name: file.name,
        mimeType: file.type || '',
        status: 'uploading',
      },
    ]);

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await apiFetch('/sys/file/upload', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as {
        code?: number;
        data?: { id?: string };
        msg?: string;
      };
      const remoteId = json?.data?.id?.trim();
      if (json?.code !== 0 || !remoteId) {
        throw new Error(json?.msg || 'upload failed');
      }

      setUploadedAssets((prev) =>
        prev.map((x) =>
          x.localId === localId ? { ...x, remoteId, status: 'done' } : x
        )
      );
    } catch {
      setUploadedAssets((prev) =>
        prev.map((x) => (x.localId === localId ? { ...x, status: 'error' } : x))
      );
      toast.error('上传失败，请重试');
    }
  }

  async function submitGenerate(message: string, options?: { appendUser?: boolean }) {
    const appendUser = options?.appendUser !== false;
    let chatId = activeChatIdRef.current;
    if (!chatId) {
      createNewChat();
      chatId = activeChatIdRef.current;
    }
    if (!chatId) return;
    const thread = chats.find((c) => c.id === chatId);
    const embedConv = embeddedModelDetailPlayground && embeddedConversationId?.trim();
    const conversationId = embedConv
      ? embeddedConversationId!.trim()
      : thread?.conversationId || safeUUID();
    const fileIds = uploadedAssets
      .filter((x) => x.kind === 'file' && x.status === 'done' && x.remoteId)
      .map((x) => x.remoteId as string);
    const imageIds = uploadedAssets
      .filter((x) => x.kind === 'image' && x.status === 'done' && x.remoteId)
      .map((x) => x.remoteId as string);

    setIsThinking(true);
    if (appendUser) {
      chatHandler.setMessages((prev) => [...prev, makeTextMessage('user', message)]);
    }

    const appendAssistantReply = (
      answer: string,
      reasoning: string,
      assistantId: string
    ) => {
      chatHandler.setMessages((prev) => [
        ...prev,
        makeAssistantMessage({
          id: assistantId,
          answer,
          reasoning,
          modelLabel: activeModelLabel,
          modelAuthorIcon: activeModelAuthorIcon,
        }),
      ]);
      setIsThinking(false);
      const shouldAnimate =
        Boolean(answer.trim()) && !answer.startsWith('Request failed:');
      setAnimatingAnswerMessageId(shouldAnimate ? assistantId : null);
    };

    try {
      const requestGenerate = (model: string) =>
        apiFetch('/v1/generates', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            function: 'chat',
            model,
            params: buildGenerateParams(message, modelGenerateConfig, {
              enable_thinking:
                !!activeModelData?.displayTags?.includes('reasoning') && enableThinking,
              enable_search:
                !!activeModelData?.displayTags?.includes('web-search') && enableSearch,
            }, { fileIds, imageIds }),
          }),
        });

      const primaryModel = activeModelId;
      const fallbackModel =
        activeModelData?.slug && activeModelData.slug !== primaryModel ? activeModelData.slug : '';

      let res = await requestGenerate(primaryModel);
      if (!res.ok && res.status === 400 && fallbackModel) {
        // Some provider entries only accept slug-like IDs.
        res = await requestGenerate(fallbackModel);
      }
      if (!res.ok) {
        const err = await readGenerateErrorMessage(res);
        throw new Error(err || `HTTP ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';

      // SSE response: parse event/data lines and aggregate text output.
      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        if (!reader) throw new Error('SSE reader unavailable');
        const decoder = new TextDecoder();
        let buffer = '';
        let fullAnswer = '';
        let fullReasoning = '';
        let errorText = '';
        const streamAssistantId = safeUUID();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith(':')) continue;

            // Some backends may concatenate multiple `data:` blocks in one line.
            const segments =
              line.includes('data:') && !line.startsWith('data:')
                ? line
                    .split('data:')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [line.startsWith('data:') ? line.slice(5).trim() : ''];

            for (const payload of segments) {
              if (!payload) continue;
              if (payload === '[DONE]') continue;
              if (payload.startsWith('event:')) continue;

              try {
                const obj = JSON.parse(payload) as unknown;
                const part = extractGenerateText(obj);
                if (part) fullAnswer += part;
                const reasoningPart = extractGenerateReasoning(obj);
                if (reasoningPart) fullReasoning += reasoningPart;
                const err = extractGenerateError(obj);
                if (err) errorText = err;
              } catch {
                // Non-JSON data payload: treat as plain text chunk
                fullAnswer += payload;
              }
            }
          }
        }

        const tail = buffer.trim();
        if (tail.startsWith('data:')) {
          const payload = tail.slice(5).trim();
          if (payload && payload !== '[DONE]') {
            try {
              const obj = JSON.parse(payload) as unknown;
              const part = extractGenerateText(obj);
              if (part) fullAnswer += part;
              const reasoningPart = extractGenerateReasoning(obj);
              if (reasoningPart) fullReasoning += reasoningPart;
              const err = extractGenerateError(obj);
              if (err) errorText = err;
            } catch {
              fullAnswer += payload;
            }
          }
        }

        const shouldShowNoResponse = !fullReasoning.trim() && !fullAnswer.trim();
        const finalAnswer = errorText
          ? `Request failed: ${errorText}`
          : shouldShowNoResponse
            ? 'No response.'
            : fullAnswer;
        const finalReasoning = errorText ? '' : fullReasoning;

        appendAssistantReply(finalAnswer, finalReasoning, streamAssistantId);
      } else {
        const json = (await res.json()) as unknown;
        const answer = extractGenerateText(json);
        const reasoning = extractGenerateReasoning(json);
        const shouldShowNoResponse = !reasoning.trim() && !answer.trim();
        const finalAnswer = shouldShowNoResponse ? 'No response.' : answer;
        const assistantId = safeUUID();

        appendAssistantReply(finalAnswer, reasoning || '', assistantId);
      }
    } catch (e) {
      const msg = (e as Error).message || String(e);
      appendAssistantReply(`Request failed: ${msg}`, '', safeUUID());
    } finally {
      setIsThinking(false);
    }
  }

  async function handleEditResubmit(messageId: string, newMessage: string) {
    const nextPrompt = newMessage.trim();
    if (!nextPrompt) return;

    chatHandler.setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === messageId);
      if (idx < 0) return prev;
      const truncated = prev.slice(0, idx + 1).map((m, i) => {
        if (i !== idx) return m;
        return {
          ...m,
          parts: [{ type: 'text', text: nextPrompt }],
        };
      });
      return truncated;
    });

    await submitGenerate(nextPrompt, { appendUser: false });
  }

  const hasMessages = chatHandler.messages.length > 0;

  const supportsReasoning = activeModelData?.displayTags?.includes('reasoning') ?? false;
  const supportsWebSearch = activeModelData?.displayTags?.includes('web-search') ?? false;

  return (
    <div
      className={cn(
        'flex w-full min-h-0 flex-1 flex-col bg-white/60 dark:bg-dark-secondary lg:flex-row',
        embeddedModelDetailPlayground
          ? 'overflow-hidden'
          : 'overflow-y-auto lg:overflow-hidden',
        containerClassName ?? 'h-full w-full min-h-0 flex-1'
      )}
    >
      {/* Left: New Chat + History（模型详情嵌入对话 playground 时隐藏） */}
      {!embeddedModelDetailPlayground ? (
      <aside className="w-full shrink-0 border-b border-gray-100 dark:border-gray-800 lg:w-[288px] lg:border-b-0 lg:border-r">
        <div className="flex max-h-[42vh] min-h-0 flex-col lg:h-full lg:max-h-none">
          <div className="p-4">
            <button
              type="button"
              onClick={createNewChat}
              className="w-full bg-gray-700 dark:bg-white/15 dark:hover:bg-white/25 font-medium text-sm hover:bg-gray-800 transition text-white py-3 px-5 rounded-full"
            >
              {t('generator.textGenerator.newChatButton')}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 px-4 pb-2">
            <span className="text-xs font-medium tracking-wide text-gray-400 dark:text-gray-500">
              {t('generator.textGenerator.chatList.historyTitle')}
            </span>
            <button
              type="button"
              disabled={
                clearAllBusy ||
                chatListLoading ||
                (!chatListLoading && chats.length === 0)
              }
              onClick={() => setClearAllDialogOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-40 dark:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-300"
              aria-label={t('generator.textGenerator.chatList.clearAllAria')}
            >
              <svg
                className="size-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M3 6h18M8 6V4h8v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12zM10 11v6M14 11v6" />
              </svg>
              {t('generator.textGenerator.chatList.clearAll')}
            </button>
          </div>

          <div
            ref={chatListScrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (!chatListHasMore || chatListLoading || chatListLoadingMore) return;
              const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
              if (distance > 96) return;
              void fetchConversationPage(chatListPageNum + 1, true);
            }}
            className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar"
          >
            <div className="space-y-2">
              {chatListLoading && chats.length === 0 ? (
                <div className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Loading...
                </div>
              ) : null}
              {!chatListLoading && chats.length === 0 ? (
                <div className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {t('generator.textGenerator.noChatYet')}
                </div>
              ) : null}

              {chats.map((c) => {
                const isActive = c.id === activeChatId;
                const menuOpen = chatMenuThreadId === c.id;
                return (
                  <div
                    key={c.id}
                    className={cn(
                      'group/chat-item flex w-full min-h-10 items-stretch rounded-xl border transition',
                      isActive
                        ? 'border-primary-500/30 bg-primary-50/60 dark:bg-white/10 dark:border-white/15'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50/50 dark:hover:bg-white/5'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        void selectChat(c.id);
                      }}
                      className="min-w-0 flex-1 px-3 py-2 text-left"
                      title={c.title}
                    >
                      <div className="flex h-full min-w-0 flex-col justify-center">
                        <div className="truncate text-sm font-medium text-gray-900 dark:text-white/90">
                          {c.title || t('generator.textGenerator.newChatTitle')}
                        </div>
                      </div>
                    </button>
                    <div
                      className="relative flex shrink-0 items-center pr-1"
                      onMouseLeave={scheduleChatMenuClose}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => openChatMenu(c.id)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearChatMenuCloseTimer();
                          setChatMenuThreadId((id) => (id === c.id ? null : c.id));
                        }}
                        className={cn(
                          'rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-200/80 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white',
                          'opacity-100 sm:opacity-0 sm:group-hover/chat-item:opacity-100',
                          menuOpen && 'opacity-100'
                        )}
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        aria-label={t('generator.textGenerator.chatList.moreLabel')}
                      >
                        <ChatListKebabIcon className="size-5" />
                      </button>
                      {menuOpen ? (
                        <div
                          role="menu"
                          className="absolute right-0 top-full z-[100] min-w-[148px] pt-1"
                          onMouseEnter={() => openChatMenu(c.id)}
                          onMouseLeave={scheduleChatMenuClose}
                        >
                          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-theme-lg dark:border-gray-700 dark:bg-dark-primary">
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-800 transition hover:bg-gray-50 dark:text-white/90 dark:hover:bg-white/10"
                            onClick={() => {
                              clearChatMenuCloseTimer();
                              setChatMenuThreadId(null);
                              setRenameTargetId(c.id);
                              setRenameDraft(c.title || '');
                            }}
                          >
                            <svg
                              className="size-4 shrink-0 text-gray-500 dark:text-gray-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden
                            >
                              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            {t('generator.textGenerator.chatList.rename')}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            onClick={() => {
                              clearChatMenuCloseTimer();
                              setChatMenuThreadId(null);
                              setDeleteTargetId(c.id);
                            }}
                          >
                            <svg
                              className="size-4 shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden
                            >
                              <path d="M3 6h18M8 6V4h8v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12zM10 11v6M14 11v6" />
                            </svg>
                            {t('generator.textGenerator.chatList.delete')}
                          </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {chatListLoadingMore ? (
                <div className="px-2 py-2 text-xs text-gray-400 dark:text-gray-500 text-center">
                  Loading more...
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
      ) : null}

      {/* Right: model selector + content + input */}
      <main
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col bg-[#F9FAFB] dark:bg-white/5',
          embeddedModelDetailPlayground
            ? 'overflow-hidden'
            : 'overflow-y-auto lg:overflow-hidden'
        )}
      >
        {!embeddedModelDetailPlayground ? (
        <div className="bg-[#fff] dark:bg-white/3 shrink-0 border-b border-gray-100 px-5 py-4 dark:border-gray-800 md:px-12">
          <div className="relative w-full max-w-[520px]" ref={modelPanelRef}>
            <button
              type="button"
              onClick={() => setModelPanelOpen((v) => !v)}
              className="relative inline-flex h-11 w-full max-w-[350px] items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-4 pr-9 text-sm font-medium text-[#7D7D84] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              aria-expanded={modelPanelOpen}
              aria-haspopup="listbox"
              aria-label="Select model"
            >
              <span className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                {activeModelAuthorIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeModelAuthorIcon}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                    {activeModelLabel.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-left">{activeModelLabel}</span>
              <svg
                className={cn(
                  'absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400 transition',
                  modelPanelOpen && 'rotate-180'
                )}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {modelPanelOpen ? (
              <div className="static lg:absolute lg:left-0 lg:top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-theme-lg dark:border-gray-700 dark:bg-dark-primary">
                <div className="max-h-[360px] overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                  {modelLoading ? (
                    <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400">
                      Loading models...
                    </div>
                  ) : modelError ? (
                    <div className="px-3 py-6 text-sm text-red-500">{modelError}</div>
                  ) : providerGroups.length === 0 ? (
                    <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400">
                      No models found.
                    </div>
                  ) : (
                    <div className="flex h-[360px] min-h-0">
                      <div className="w-[42%] overflow-y-auto border-r border-gray-100 bg-gray-50/40 p-1.5 custom-scrollbar dark:border-gray-700 dark:bg-white/5">
                        <div className="space-y-1">
                          {providerGroups.map((g) => {
                            const active = g.name === activeProviderGroup?.name;
                            return (
                              <button
                                key={g.name}
                                type="button"
                                className={cn(
                                  'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition',
                                  active
                                    ? 'bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white'
                                    : 'text-gray-700 hover:bg-white dark:text-white/80 dark:hover:bg-white/5'
                                )}
                                onClick={() => setActiveProviderName(g.name)}
                              >
                                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                  {g.icon ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={g.icon}
                                      alt=""
                                      className="h-full w-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                                      {g.name.slice(0, 1).toUpperCase()}
                                    </span>
                                  )}
                                </span>
                                <span className="min-w-0 flex-1 truncate">{g.name}</span>
                                <svg
                                  className="size-4 shrink-0 text-gray-400"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden
                                >
                                  <path d="m9 6 6 6-6 6" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="w-[58%] overflow-y-auto p-1.5 custom-scrollbar">
                        <div className="space-y-1">
                          {(activeProviderGroup?.models || []).map((m) => {
                            const id = m.modelId || m.id;
                            const active = id === activeModelId;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                role="option"
                                aria-selected={active}
                                className={cn(
                                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition',
                                  active
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                                    : 'text-gray-700 hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5'
                                )}
                                onClick={() => selectModel(m)}
                              >
                                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                  {m.name || id}
                                </span>
                                {active ? (
                                  <svg
                                    className="ml-2 size-4 shrink-0"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                  >
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {hasMessages ? (
            <RenderMessage
              useChat={chatHandler}
              isThinking={isThinking}
              onEditResubmit={handleEditResubmit}
              animatingAnswerMessageId={animatingAnswerMessageId}
              onAnswerRevealComplete={() => setAnimatingAnswerMessageId(null)}
            />
          ) : embeddedModelDetailPlayground ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 px-5 py-12 text-gray-400 md:px-12 lg:h-full">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
                <svg
                  className="size-7 text-gray-300 dark:text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
                </svg>
              </div>
              <p className="text-sm">{t('tgPlayground.emptyHint')}</p>
            </div>
          ) : (
            <ModelEmptyState modelLabel={activeModelLabel} model={activeModelData} t={t} />
          )}
        </div>

        <div
          className={cn(
            'mt-auto shrink-0 px-5 md:px-12',
            embeddedModelDetailPlayground
              ? 'pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]'
              : 'pb-4'
          )}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const prompt = input.trim();
              if (!prompt) return;
              if (uploadedAssets.some((x) => x.status === 'uploading')) {
                toast.error('文件上传中，请稍后再发送');
                return;
              }
              setInput('');
              setUploadedAssets([]);
              await submitGenerate(prompt);
            }}
          >
            <GeneratorInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              inputModalities={activeModelData?.inputModalities}
              attachments={uploadedAssets}
              onRemoveAttachment={(localId) =>
                setUploadedAssets((prev) => prev.filter((x) => x.localId !== localId))
              }
              onAttachSelected={uploadAsset}
              afterAttachSlot={
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setModelConfigDraft(modelGenerateConfig);
                      setShowModelConfigDialog(true);
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E4E7EC] bg-white/40 px-2 py-1 text-xs font-medium leading-normal text-[#667085] transition hover:bg-white/70 dark:border-white/15 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  >
                    <svg
                      className="size-3 shrink-0 text-[#98A2B3] dark:text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    {t('generator.textGenerator.modelConfig.openButton')}
                  </button>
                  {supportsReasoning ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enableThinking}
                      onClick={() => setEnableThinking((v) => !v)}
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium leading-normal transition',
                        enableThinking
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'border-[#E4E7EC] bg-white/40 text-[#667085] hover:bg-white/70 dark:border-white/15 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                      )}
                    >
                      <InputToolbarAtomIcon className="size-3 shrink-0 opacity-90" />
                      {t('generator.textGenerator.feature.deepThinking')}
                    </button>
                  ) : null}
                  {supportsWebSearch ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enableSearch}
                      onClick={() => setEnableSearch((v) => !v)}
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium leading-normal transition',
                        enableSearch
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'border-[#E4E7EC] bg-white/40 text-[#667085] hover:bg-white/70 dark:border-white/15 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                      )}
                    >
                      <InputToolbarGlobeIcon className="size-3 shrink-0 opacity-90" />
                      {t('generator.textGenerator.feature.webSearch')}
                    </button>
                  ) : null}
                </>
              }
            />
          </form>
        </div>
      </main>

      {showModelConfigDialog ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          aria-hidden={false}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-config-title"
            className="flex max-h-[90vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-dark-primary"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <div className="flex min-w-0 items-center gap-2">
                <svg
                  className="size-5 shrink-0 text-gray-700 dark:text-gray-200"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 3 16 7l-4 4-4-4 4-4zm0 8 4 4-4 4-4-4 4-4z" />
                </svg>
                <h2
                  id="model-config-title"
                  className="truncate text-base font-semibold text-gray-900 dark:text-white"
                >
                  {t('generator.textGenerator.modelConfig.title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModelConfigDialog(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={t('generator.textGenerator.modelConfig.close')}
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('generator.textGenerator.modelConfig.systemPrompt')}
                    </span>
                    <ModelConfigHint
                      description={t('generator.textGenerator.modelConfig.hint.systemPrompt')}
                    />
                  </div>
                  <div className="relative">
                    <textarea
                      value={modelConfigDraft.systemPrompt}
                      onChange={(e) =>
                        setModelConfigDraft((d) => ({
                          ...d,
                          systemPrompt: e.target.value.slice(0, SYSTEM_PROMPT_MAX_LEN),
                        }))
                      }
                      rows={4}
                      placeholder={t('generator.textGenerator.modelConfig.systemPromptPlaceholder')}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-dark-secondary dark:text-white dark:placeholder:text-gray-500"
                    />
                    <div className="pointer-events-none absolute bottom-2 right-3 text-xs text-gray-400 dark:text-gray-500">
                      {modelConfigDraft.systemPrompt.length} / {SYSTEM_PROMPT_MAX_LEN}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <ConfigSliderRow
                    label={t('generator.textGenerator.modelConfig.maxMessageCount')}
                    hint={t('generator.textGenerator.modelConfig.hint.maxMessageCount')}
                    min={0}
                    max={100}
                    step={1}
                    value={modelConfigDraft.maxMessageCount}
                    onChange={(v) => setModelConfigDraft((d) => ({ ...d, maxMessageCount: v }))}
                    formatInt
                  />
                  <ConfigSliderRow
                    label={t('generator.textGenerator.modelConfig.temperature')}
                    hint={t('generator.textGenerator.modelConfig.hint.temperature')}
                    min={0}
                    max={1.9999}
                    step={0.01}
                    value={modelConfigDraft.temperature}
                    onChange={(v) => setModelConfigDraft((d) => ({ ...d, temperature: v }))}
                  />
                  <ConfigSliderRow
                    label={t('generator.textGenerator.modelConfig.topP')}
                    hint={t('generator.textGenerator.modelConfig.hint.topP')}
                    min={0}
                    max={1}
                    step={0.01}
                    value={modelConfigDraft.topP}
                    onChange={(v) => setModelConfigDraft((d) => ({ ...d, topP: v }))}
                  />
                  <ConfigSliderRow
                    label={t('generator.textGenerator.modelConfig.maxOutputTokens')}
                    hint={t('generator.textGenerator.modelConfig.hint.maxOutputTokens')}
                    min={0}
                    max={1_000_000}
                    step={100}
                    value={modelConfigDraft.maxOutputTokens}
                    onChange={(v) => setModelConfigDraft((d) => ({ ...d, maxOutputTokens: v }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-700">
              <button
                type="button"
                onClick={() =>
                  setModelConfigDraft({ ...DEFAULT_MODEL_GENERATE_CONFIG })
                }
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                {t('generator.textGenerator.modelConfig.reset')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setModelGenerateConfig(modelConfigDraft);
                  setShowModelConfigDialog(false);
                }}
                className="rounded-full bg-gray-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                {t('generator.textGenerator.modelConfig.save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {renameTargetId ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => {
            if (renameSaving) return;
            setRenameTargetId(null);
            setRenameDraft('');
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-chat-title"
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-dark-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <h2
                id="rename-chat-title"
                className="text-base font-semibold text-gray-900 dark:text-white"
              >
                {t('generator.textGenerator.chatList.renameDialogTitle')}
              </h2>
            </div>
            <div className="px-5 py-4">
              <input
                type="text"
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSaveRenameTitle();
                }}
                placeholder={t('generator.textGenerator.chatList.renamePlaceholder')}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-dark-secondary dark:text-white dark:placeholder:text-gray-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-700">
              <button
                type="button"
                disabled={renameSaving}
                onClick={() => {
                  setRenameTargetId(null);
                  setRenameDraft('');
                }}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                {t('generator.textGenerator.chatList.renameCancel')}
              </button>
              <button
                type="button"
                disabled={renameSaving}
                aria-busy={renameSaving}
                onClick={() => void handleSaveRenameTitle()}
                className="inline-flex min-w-[5.5rem] items-center justify-center gap-2 rounded-full bg-gray-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-900 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <span className="whitespace-nowrap">
                  {t('generator.textGenerator.chatList.renameSave')}
                </span>
                {renameSaving ? (
                  <svg
                    className="size-4 shrink-0 animate-spin text-white dark:text-gray-900"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTargetId ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => {
            if (deleteSaving) return;
            setDeleteTargetId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-chat-title"
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-dark-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <h2
                id="delete-chat-title"
                className="text-base font-semibold text-gray-900 dark:text-white"
              >
                {t('generator.textGenerator.chatList.deleteConfirmTitle')}
              </h2>
            </div>
            <p className="px-5 py-4 text-sm text-gray-600 dark:text-white/70">
              {t('generator.textGenerator.chatList.deleteConfirmBody')}
            </p>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-700">
              <button
                type="button"
                disabled={deleteSaving}
                onClick={() => setDeleteTargetId(null)}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                {t('generator.textGenerator.chatList.deleteCancel')}
              </button>
              <button
                type="button"
                disabled={deleteSaving}
                aria-busy={deleteSaving}
                onClick={() => void handleConfirmDeleteConversation()}
                className="inline-flex min-w-[5.5rem] items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <span className="whitespace-nowrap">
                  {t('generator.textGenerator.chatList.deleteConfirm')}
                </span>
                {deleteSaving ? (
                  <svg
                    className="size-4 shrink-0 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {clearAllDialogOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => {
            if (clearAllBusy) return;
            setClearAllDialogOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-all-chat-title"
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-dark-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <h2
                id="clear-all-chat-title"
                className="text-base font-semibold text-gray-900 dark:text-white"
              >
                {t('generator.textGenerator.chatList.clearAllConfirmTitle')}
              </h2>
            </div>
            <p className="px-5 py-4 text-sm text-gray-600 dark:text-white/70">
              {t('generator.textGenerator.chatList.clearAllConfirmBody')}
            </p>
            <div className="flex justify-end gap-2 px-5 py-4 dark:border-gray-700">
              <button
                type="button"
                disabled={clearAllBusy}
                onClick={() => setClearAllDialogOpen(false)}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                {t('generator.textGenerator.chatList.clearAllCancel')}
              </button>
              <button
                type="button"
                disabled={clearAllBusy}
                aria-busy={clearAllBusy}
                onClick={() => void handleClearAllConversations()}
                className="inline-flex min-w-[5.5rem] items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <span className="whitespace-nowrap">
                  {t('generator.textGenerator.chatList.clearAllConfirm')}
                </span>
                {clearAllBusy ? (
                  <svg
                    className="size-4 shrink-0 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ModelConfigHint({ description }: { description: string }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  function measureTrigger() {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.bottom + 6,
      left: r.left + r.width / 2,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    measureTrigger();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => measureTrigger();
    const closeOnScroll = () => setOpen(false);
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const tooltip =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: 'translateX(-50%)',
              zIndex: 200,
            }}
            className="pointer-events-none relative w-max max-w-[min(288px,calc(100vw-2rem))] rounded-lg bg-gray-900 px-3 py-2 text-left text-xs leading-relaxed text-white shadow-lg dark:bg-gray-800"
          >
            <span
              className="absolute -top-1 left-1/2 z-10 size-2 -translate-x-1/2 rotate-45 bg-gray-900 dark:bg-gray-800"
              aria-hidden
            />
            <span className="relative block pt-0.5">{description}</span>
          </div>,
          document.body
        )
      : null;

  return (
    <span className="relative inline-flex shrink-0 align-middle">
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => {
          measureTrigger();
          setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => {
          measureTrigger();
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        className="flex size-4 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold leading-none text-gray-700 outline-none transition hover:bg-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 dark:focus-visible:ring-gray-500 dark:ring-offset-dark-primary"
        aria-label={description}
      >
        !
      </button>
      {tooltip}
    </span>
  );
}

function ConfigSliderRow(props: {
  label: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  formatInt?: boolean;
}) {
  const { label, hint, min, max, step, value, onChange, formatInt } = props;

  function normalize(raw: number) {
    let v = stepRound(raw, step);
    v = clampNum(v, min, max);
    if (formatInt) v = Math.round(v);
    return v;
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        {hint ? <ModelConfigHint description={hint} /> : null}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          className="h-1.5 flex-1 cursor-pointer accent-gray-800 dark:accent-white"
          min={min}
          max={max}
          step={step}
          value={clampNum(value, min, max)}
          onChange={(e) => onChange(normalize(Number(e.target.value)))}
        />
        <input
          type="number"
          className="w-[108px] shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-sm tabular-nums text-gray-900 focus:border-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-dark-secondary dark:text-white"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : min}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (Number.isNaN(n)) return;
            onChange(normalize(n));
          }}
        />
      </div>
    </div>
  );
}

