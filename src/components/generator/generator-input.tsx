'use client';

import { useI18n } from '../../lib/studio-text';
import { AttachmentIcon, LongArrowUpIcon } from '../../icons/icons';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type PropsType = {
  onChange?: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  value?: string;
  disabled?: boolean;
  /** 渲染在附件按钮同一行右侧（例如模型配置按钮） */
  afterAttachSlot?: ReactNode;
  /** 模型 metadata.inputModalities；包含 file / image 时才显示对应上传项 */
  inputModalities?: string[];
  onAttachSelected?: (file: File, kind: 'file' | 'image') => void;
  attachments?: Array<{
    localId: string;
    kind: 'file' | 'image';
    name: string;
    mimeType?: string;
    status?: 'uploading' | 'done' | 'error';
  }>;
  onRemoveAttachment?: (localId: string) => void;
};

function normalizeModalities(mods: string[] | undefined) {
  return (mods ?? []).map((x) => String(x).trim().toLowerCase()).filter(Boolean);
}

function AttachMenuFileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M10 13h8M10 17h8M10 9h4" strokeLinecap="round" />
    </svg>
  );
}

function AttachMenuImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function GeneratorInput({
  onChange,
  value,
  disabled,
  afterAttachSlot,
  inputModalities,
  onAttachSelected,
  attachments = [],
  onRemoveAttachment,
}: PropsType) {
  const { t } = useI18n();
  const uid = useId();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachWrapRef = useRef<HTMLDivElement>(null);
  const attachButtonRef = useRef<HTMLButtonElement>(null);
  const attachMenuPortalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [attachMenuAnchor, setAttachMenuAnchor] = useState({ left: 0, top: 0 });

  const mods = normalizeModalities(inputModalities);
  const supportsFile = mods.includes('file');
  const supportsImage = mods.includes('image');
  const showAttachControl = supportsFile || supportsImage;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useLayoutEffect(() => {
    if (!attachMenuOpen) return;
    function measure() {
      const btn = attachButtonRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      setAttachMenuAnchor({ left: r.left, top: r.top });
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [attachMenuOpen]);

  useEffect(() => {
    if (!attachMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (attachWrapRef.current?.contains(t)) return;
      if (attachMenuPortalRef.current?.contains(t)) return;
      setAttachMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [attachMenuOpen]);

  function openFilePicker(kind: 'file' | 'image') {
    setAttachMenuOpen(false);
    window.setTimeout(() => {
      if (kind === 'file') fileInputRef.current?.click();
      else imageInputRef.current?.click();
    }, 0);
  }

  return (
    <div className="sticky bottom-0 inset-x-0 z-30 mt-auto">
      <div className="h-4" />

      <div
        className="bg-white/15 dark:bg-white/5 border border-[#E4E7EC] dark:border-white/10 rounded-3xl backdrop-blur-[10px] shadow-theme-md aria-disabled:opacity-70 aria-disabled:pointer-events-none"
        aria-disabled={disabled}
      >
        <div className="p-5 pb-0 pr-[calc((var(--spacing)*5)-10px)]">
          {attachments.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((item) => (
                <div
                  key={item.localId}
                  className="relative inline-flex max-w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                >
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 dark:border-white/10 dark:text-gray-300">
                    {item.kind === 'image' ? (
                      <AttachMenuImageIcon className="size-3.5" />
                    ) : (
                      <AttachMenuFileIcon className="size-3.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm text-gray-900 dark:text-gray-100">
                      {item.name}
                    </div>
                    {item.status === 'uploading' ? (
                      <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {t('generator.textGenerator.attach.uploading')}
                      </div>
                    ) : item.status === 'error' ? (
                      <div className="truncate text-xs text-red-500 dark:text-red-300">
                        {t('generator.textGenerator.attach.uploadFailed')}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment?.(item.localId)}
                    className="ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
                    aria-label={t('generator.textGenerator.attach.remove')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <textarea
            ref={textareaRef}
            placeholder="Type your message"
            value={value}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitButtonRef.current?.click();
              }
            }}
            className="dark:text-white/90 focus:outline-0 placeholder:text-sm dark:placeholder:text-white/50 resize-none max-h-44 leading-5 w-full custom-scrollbar pb-8"
            required
            rows={1}
          />
        </div>
        <div className="flex justify-between items-center gap-2 p-3 pt-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {showAttachControl ? (
              <div className="relative shrink-0" ref={attachWrapRef}>
                <button
                  ref={attachButtonRef}
                  type="button"
                  onClick={() => setAttachMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-md px-0.5 py-0.5 text-sm text-[#98A2B3] transition hover:text-gray-600 dark:hover:text-gray-300"
                  aria-expanded={attachMenuOpen}
                  aria-haspopup="menu"
                >
                  <AttachmentIcon />
                  <span>{t('generator.textGenerator.attachMenu.open')}</span>
                </button>

                {attachMenuOpen && typeof document !== 'undefined'
                  ? createPortal(
                      <div
                        ref={attachMenuPortalRef}
                        role="menu"
                        style={{
                          position: 'fixed',
                          left: attachMenuAnchor.left,
                          top: attachMenuAnchor.top,
                          transform: 'translateY(calc(-100% - 8px))',
                          zIndex: 200,
                        }}
                        className="min-w-[138px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-theme-lg dark:border-gray-700 dark:bg-dark-primary"
                      >
                        {supportsFile ? (
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-gray-800 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
                            onClick={() => openFilePicker('file')}
                          >
                            <AttachMenuFileIcon className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
                            {t('generator.textGenerator.attachMenu.uploadFile')}
                          </button>
                        ) : null}
                        {supportsImage ? (
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-gray-800 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
                            onClick={() => openFilePicker('image')}
                          >
                            <AttachMenuImageIcon className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
                            {t('generator.textGenerator.attachMenu.uploadImage')}
                          </button>
                        ) : null}
                      </div>,
                      document.body
                    )
                  : null}

                <input
                  ref={fileInputRef}
                  type="file"
                  id={`gen-attach-file-${uid}`}
                  className="sr-only"
                  tabIndex={-1}
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onAttachSelected?.(f, 'file');
                    e.target.value = '';
                  }}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  id={`gen-attach-image-${uid}`}
                  className="sr-only"
                  tabIndex={-1}
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onAttachSelected?.(f, 'image');
                    e.target.value = '';
                  }}
                />
              </div>
            ) : null}
            {afterAttachSlot ? (
              <div className="flex min-w-0 flex-wrap items-center gap-2">{afterAttachSlot}</div>
            ) : null}
          </div>

          <button
            type="submit"
            ref={submitButtonRef}
            className="size-10 flex bg-[#1D2939] dark:bg-primary-500 dark:disabled:bg-white/20 transition items-center justify-center rounded-full text-white"
            disabled={!value?.trim()}
          >
            <span className="sr-only">Submit</span>
            <LongArrowUpIcon />
          </button>
        </div>
      </div>

      <div className="h-5" />
    </div>
  );
}
