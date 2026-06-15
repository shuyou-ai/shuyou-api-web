'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../../lib/utils';
import { useI18n } from '../../../lib/studio-text';
import { SelectMenu } from '../select-menu';
import ReactMarkdown from 'react-markdown';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabId = 'form' | 'json' | 'http';

export type FieldType =
  | 'string'
  | 'secret'
  | 'textarea'
  | 'select'
  | 'number'
  | 'boolean'
  | 'image'
  | 'audio';

export type SelectOption = { value: string; label: string };

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: string | number | boolean | null;
  options?: SelectOption[];
};

/** 表单值类型：普通字段用 string/number/boolean/null，文件字段用 File[] */
export type FormValues = Record<string, string | number | boolean | null | File[]>;

export type ChangeInfo = {
  tab: TabId;
  values: FormValues;
  /** 可序列化版本（File[] 被置为空数组） */
  serializableValues: Record<string, unknown>;
  /** JSON 标签页且解析成功时的完整对象；其它标签页为 null */
  jsonParsed: Record<string, unknown> | null;
};

export type ApiSubmitPanelProps = {
  fields: FieldDef[];
  /** HTTP 标签页读取的 markdown（位于 /public/model/http；完整 curl，无单独 JSON 块） */
  httpDocFileName?: string;
  onChange?: (info: ChangeInfo) => void;
  className?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_IDS: TabId[] = ['form', 'json', 'http'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSerializableValues(
  values: FormValues
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(values)) {
    result[key] = Array.isArray(val) ? [] : val;
  }
  return result;
}

function buildDefaultValues(fields: FieldDef[]): FormValues {
  const values: FormValues = {};
  for (const f of fields) {
    if (f.type === 'image' || f.type === 'audio') {
      values[f.name] = [];
    } else if (f.type === 'boolean') {
      values[f.name] = typeof f.defaultValue === 'boolean' ? f.defaultValue : false;
    } else {
      values[f.name] = f.defaultValue ?? null;
    }
  }
  return values;
}

function indentJson(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

function safeParseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldIcon({ type }: { type: FieldType }) {
  const base = 'flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold';
  if (type === 'string' || type === 'textarea') {
    return (
      <span className={cn(base, 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400')}>
        T
      </span>
    );
  }
  if (type === 'secret') {
    return (
      <span className={cn(base, 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400')}>
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
    );
  }
  if (type === 'select') {
    return (
      <span className={cn(base, 'bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400')}>
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </span>
    );
  }
  if (type === 'number') {
    return (
      <span className={cn(base, 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400')}>
        #
      </span>
    );
  }
  if (type === 'boolean') {
    return (
      <span className={cn(base, 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400')}>
        B
      </span>
    );
  }
  if (type === 'image') {
    return (
      <span className={cn(base, 'bg-pink-50 text-pink-500 dark:bg-pink-500/10 dark:text-pink-400')}>
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </span>
    );
  }
  if (type === 'audio') {
    return (
      <span className={cn(base, 'bg-cyan-50 text-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-400')}>
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </span>
    );
  }
  return null;
}

function FieldTypeTag({ type, required }: { type: FieldType; required?: boolean }) {
  const labels: Record<FieldType, string> = {
    string: 'string',
    secret: 'secret',
    textarea: 'string',
    select: 'string',
    number: 'number',
    boolean: 'boolean',
    image: 'file[]',
    audio: 'file[]',
  };
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
      {required && <span className="text-red-500">*</span>}
      <span>{labels[type]}</span>
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          // ignore
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-primary dark:text-gray-300 dark:hover:bg-white/5"
    >
      {copied ? (
        <>
          <svg className="size-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {t('apiSubmitPanel.copied')}
        </>
      ) : (
        <>
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
            <rect x="8" y="8" width="12" height="12" rx="2" />
          </svg>
          {t('apiSubmitPanel.copy')}
        </>
      )}
    </button>
  );
}

// ─── File Upload Field ────────────────────────────────────────────────────────

function FileUploadField({
  field,
  files,
  onChange,
}: {
  field: FieldDef;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = field.type === 'image';
  const accept = isImage ? 'image/*' : 'audio/*';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500 transition hover:border-primary-400 hover:bg-primary-50/30 dark:border-gray-700 dark:bg-white/3 dark:text-gray-400 dark:hover:border-primary-500 dark:hover:bg-primary-500/5"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        role="button"
        tabIndex={0}
        aria-label={isImage ? t('apiSubmitPanel.uploadImageFile') : t('apiSubmitPanel.uploadAudioFile')}
      >
        {isImage ? (
          <svg className="size-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        ) : (
          <svg className="size-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
        <span>
          {isImage ? t('apiSubmitPanel.clickUploadImage') : t('apiSubmitPanel.clickUploadAudio')}
          {files.length > 0 && (
            <span className="ml-1 text-primary-500">
              {t('apiSubmitPanel.selectedCount').replace('{count}', String(files.length))}
            </span>
          )}
        </span>
        <span className="text-xs text-gray-400">
          {isImage ? t('apiSubmitPanel.imageFormats') : t('apiSubmitPanel.audioFormats')}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-white/5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg className="size-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="truncate text-gray-700 dark:text-gray-300">{file.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-2 shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
                aria-label={t('apiSubmitPanel.removeFile')}
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Form Tab ─────────────────────────────────────────────────────────────────

function FormTab({
  fields,
  values,
  onChange,
}: {
  fields: FieldDef[];
  values: FormValues;
  onChange: (name: string, value: string | number | boolean | null | File[]) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <div key={field.name}>
          <div className="mb-2 flex items-center gap-2">
            <FieldIcon type={field.type} />
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">
              {field.label}
            </span>
            <FieldTypeTag type={field.type} required={field.required} />
          </div>

          {(field.type === 'string' || field.type === 'number') && (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={(values[field.name] as string | number | null) ?? ''}
              placeholder={field.placeholder}
              onChange={(e) =>
                onChange(
                  field.name,
                  field.type === 'number'
                    ? e.target.value === '' ? null : Number(e.target.value)
                    : e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-primary-500"
            />
          )}

          {field.type === 'secret' && (
            <SecretField
              value={(values[field.name] as string | null) ?? ''}
              placeholder={field.placeholder}
              onChange={(v) => onChange(field.name, v)}
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              value={(values[field.name] as string | null) ?? ''}
              placeholder={field.placeholder}
              rows={4}
              onChange={(e) => onChange(field.name, e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 resize-none dark:border-gray-700 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-primary-500"
            />
          )}

          {field.type === 'boolean' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(values[field.name])}
                aria-label={t('apiSubmitPanel.booleanSwitch').replace('{label}', field.label)}
                onClick={() => onChange(field.name, !Boolean(values[field.name]))}
                className={cn(
                  'relative inline-flex h-9 w-[3.25rem] shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50',
                  values[field.name]
                    ? 'bg-primary-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform',
                    values[field.name] ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {values[field.name] ? t('apiSubmitPanel.booleanOn') : t('apiSubmitPanel.booleanOff')}
              </span>
            </div>
          )}

          {field.type === 'select' && (
            <SelectMenu
              value={(values[field.name] as string | null) ?? ''}
              options={field.options ?? []}
              onChange={(v) => onChange(field.name, v)}
              placeholder={field.placeholder ?? t('apiSubmitPanel.selectPlaceholder')}
              ariaLabel={field.label}
              className="w-full"
              buttonClassName={cn(
                'h-11 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 pr-9 text-sm font-medium text-gray-700 shadow-theme-xs transition',
                'hover:border-gray-400 focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-white/5 dark:text-gray-200 dark:hover:border-gray-600'
              )}
              menuClassName="rounded-xl dark:bg-dark-secondary"
            />
          )}

          {(field.type === 'image' || field.type === 'audio') && (
            <FileUploadField
              field={field}
              files={(values[field.name] as File[]) ?? []}
              onChange={(files) => onChange(field.name, files)}
            />
          )}

          {field.description && (
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              {field.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function SecretField({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-primary-500"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? t('apiSubmitPanel.secretHide') : t('apiSubmitPanel.secretShow')}
      >
        {show ? (
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" x2="23" y1="1" y2="23" />
          </svg>
        ) : (
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── JSON Tab ─────────────────────────────────────────────────────────────────

function JsonTab({
  jsonText,
  jsonError,
  onChange,
}: {
  jsonText: string;
  jsonError: string | null;
  onChange: (text: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[300px] w-full flex-col">
      {jsonError && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>{t('apiSubmitPanel.jsonError').replace('{error}', jsonError)}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">JSON</span>
        <CopyButton value={jsonText} />
      </div>
      <textarea
        value={jsonText}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="min-h-[280px] w-full flex-1 resize-y border-0 bg-gray-50 px-4 py-3 font-mono text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-gray-500"
      />

      <p className="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
        {t('apiSubmitPanel.jsonSyncHint')}
      </p>
    </div>
  );
}

// ─── HTTP Markdown Tab ────────────────────────────────────────────────────────

function HttpMarkdownTab({ fileName }: { fileName: string }) {
  const { t } = useI18n();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/model/${encodeURIComponent(fileName)}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const md = await res.text();
        if (!cancelled) setContent(md);
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message || 'fetch failed');
          setContent('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [fileName]);

  return (
    <div className="max-h-[min(85vh,560px)] min-h-[200px] w-full overflow-auto">
      {loading ? (
        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          {t('apiSubmitPanel.httpDocLoading')}
        </p>
      ) : error ? (
        <p className="px-4 py-3 text-sm text-red-500">
          {t('apiSubmitPanel.httpDocLoadError').replace('{error}', error)}
        </p>
      ) : content.trim() ? (
        <article className="prose prose-sm w-full max-w-none px-4 py-3 text-gray-700 prose-pre:my-0 prose-pre:w-full prose-pre:max-w-none prose-pre:rounded-none prose-pre:border-0 prose-pre:bg-gray-50 prose-pre:p-4 prose-pre:text-sm prose-pre:text-gray-800 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none dark:text-gray-300 dark:prose-headings:text-white/90 dark:prose-pre:bg-white/5 dark:prose-pre:text-gray-100">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      ) : (
        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          {t('apiSubmitPanel.httpDocEmpty')}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ApiSubmitPanel({
  fields,
  httpDocFileName = 'http/default-chat.md',
  onChange,
  className,
}: ApiSubmitPanelProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>('form');
  const [values, setValues] = useState<FormValues>(() => buildDefaultValues(fields));
  const valuesRef = useRef<FormValues>(values);
  valuesRef.current = values;

  // JSON editor state — synced from form when switching to JSON tab
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    onChange?.({
      tab: 'form',
      values,
      serializableValues: getSerializableValues(values),
      jsonParsed: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 挂载时用初始表单通知父级
  }, []);

  // Notify parent on change
  const notifyChange = useCallback(
    (
      tab: TabId,
      currentValues: FormValues,
      jsonParsed: Record<string, unknown> | null = null
    ) => {
      onChange?.({
        tab,
        values: currentValues,
        serializableValues: getSerializableValues(currentValues),
        jsonParsed: tab === 'json' ? jsonParsed : null,
      });
    },
    [onChange]
  );

  // Handle form field change
  const handleFieldChange = useCallback(
    (name: string, value: string | number | boolean | null | File[]) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        queueMicrotask(() => {
          const jp =
            activeTab === 'json' ? safeParseJsonObject(jsonText) : null;
          notifyChange(activeTab, next, jp);
        });
        return next;
      });
    },
    [activeTab, notifyChange, jsonText]
  );

  // Handle JSON text change
  const handleJsonChange = useCallback(
    (text: string) => {
      setJsonText(text);
      try {
        const root = JSON.parse(text) as unknown;
        if (!root || typeof root !== 'object' || Array.isArray(root)) {
          throw new Error('root must be a JSON object');
        }
        const parsed = root as Record<string, unknown>;
        setJsonError(null);
        setValues((prev) => {
          const next = { ...prev };
          for (const field of fields) {
            if (field.type === 'image' || field.type === 'audio') continue;
            if (!Object.prototype.hasOwnProperty.call(parsed, field.name)) continue;
            const raw = parsed[field.name];
            if (field.type === 'boolean') {
              if (typeof raw === 'boolean') {
                next[field.name] = raw;
              } else if (raw === 'true' || raw === 1 || raw === '1') {
                next[field.name] = true;
              } else if (raw === 'false' || raw === 0 || raw === '0') {
                next[field.name] = false;
              } else {
                next[field.name] = null;
              }
              continue;
            }
            next[field.name] =
              raw === null ? null : typeof raw === 'number' ? raw : String(raw);
          }
          queueMicrotask(() => {
            notifyChange('json', next, parsed);
          });
          return next;
        });
      } catch (err) {
        setJsonError(err instanceof Error ? err.message : String(err));
        queueMicrotask(() => {
          notifyChange('json', valuesRef.current, null);
        });
      }
    },
    [fields, notifyChange]
  );

  // Sync JSON text when switching to JSON tab.
  // 首次打开：从 form 值生成全量 JSON。
  // 再次切回：只更新 JSON 中已有的 key，不补回用户主动删除的 key。
  const handleTabChange = useCallback(
    (tab: TabId) => {
      if (tab === 'json') {
        const serializable = getSerializableValues(values);
        let nextJsonText = jsonText;
        if (!jsonText.trim()) {
          nextJsonText = indentJson(serializable as Record<string, unknown>);
          setJsonText(nextJsonText);
        } else {
          try {
            const parsed = JSON.parse(jsonText) as Record<string, unknown>;
            const updated: Record<string, unknown> = {};
            for (const key of Object.keys(parsed)) {
              updated[key] = Object.prototype.hasOwnProperty.call(serializable, key)
                ? serializable[key]
                : parsed[key];
            }
            nextJsonText = indentJson(updated);
            setJsonText(nextJsonText);
          } catch {
            nextJsonText = indentJson(serializable as Record<string, unknown>);
            setJsonText(nextJsonText);
          }
        }
        setJsonError(null);
        setActiveTab(tab);
        notifyChange(tab, values, safeParseJsonObject(nextJsonText));
        return;
      }
      setActiveTab(tab);
      notifyChange(tab, values, null);
    },
    [values, jsonText, notifyChange]
  );

  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-700 dark:bg-dark-primary', className)}>
      {/* Tab Bar */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 px-3 dark:border-gray-700">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabChange(id)}
            className={cn(
              'relative px-3 py-3 text-sm font-medium transition-colors',
              'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:transition-all',
              activeTab === id
                ? 'text-gray-900 after:bg-primary-500 dark:text-white'
                : 'text-gray-500 hover:text-gray-800 after:bg-transparent dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            {t(`apiSubmitPanel.tabs.${id}`)}
          </button>
        ))}
      </div>

      {/* Tab Content：JSON / HTTP 与卡片同宽铺满，避免套多层带边框容器 */}
      <div className={cn(activeTab === 'form' ? 'p-5' : 'p-0')}>
        {activeTab === 'form' && (
          <FormTab fields={fields} values={values} onChange={handleFieldChange} />
        )}
        {activeTab === 'json' && (
          <JsonTab jsonText={jsonText} jsonError={jsonError} onChange={handleJsonChange} />
        )}
        {activeTab === 'http' && (
          <HttpMarkdownTab fileName={httpDocFileName} />
        )}
      </div>
    </div>
  );
}
