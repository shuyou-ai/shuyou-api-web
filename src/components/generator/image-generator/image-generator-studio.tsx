'use client';

import { useI18n } from '../../../lib/studio-text';
import { cn } from '../../../lib/utils';
import {
  fetchModelHotImageList,
  readMaxReferenceImageCount,
  readSchemaInputEnum,
  readSchemaInputStringDefault,
  type ModelHotImageRow,
} from '../../../lib/api/model-hot-image';
import {
  buildAiImageGenerateMessage,
  createAiGenerateWebSocketHeartbeat,
  getAiImageGenerateWebSocketUrl,
  handleAiGenerateWebSocketMessage,
  isAiGenerateWsHeartbeatPayload,
  parseAiGenerateWebSocketMessage,
} from '../../../lib/api/ai-image-generate-ws';
import { uploadImageFile } from '../../../lib/api/file-upload';
import {
  deleteImageMessage,
  fetchImageMessagePage,
  IMAGE_MESSAGE_PAGE_SIZE,
  mapImageMessageRecordToGenLike,
} from '../../../lib/api/image-message-page';
import { downloadRemoteFile } from '../../../lib/download-file';
import { genListCostTagClass, genListMetaTagClass } from '../gen-list-tag-styles';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import { SelectMenu, type SelectMenuOption } from '../../ui/select-menu';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

type GenRecord = {
  id: string;
  sessionId?: string;
  prompt: string;
  model: string;
  aspect: string;
  resolution: string;
  imageUrl?: string;
  /** 参考图列表，用于提示词左侧展示 */
  referenceImageUrls?: string[];
  /** 无图时的占位渐变 */
  previewClass?: string;
  /** 花费（美元），如 `$0.01` */
  costUsd?: string;
};

const PLACEHOLDER_PREVIEW =
  'from-fuchsia-200 via-violet-200 to-cyan-200 dark:from-fuchsia-950/50 dark:via-violet-950/50 dark:to-cyan-950/40';

type RefImageAsset = {
  localId: string;
  name: string;
  previewUrl: string;
  remoteUrl?: string;
  status: 'uploading' | 'done' | 'error';
};

function newLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Windows 下部分图片 `file.type` 为空，用扩展名兜底 */
function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|bmp|heic|heif|avif|svg)$/i.test(file.name);
}

function historyImageAspectStyle(aspect: string | undefined) {
  const trimmed = aspect?.trim() ?? '';
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);
  if (match) {
    return { aspectRatio: `${match[1]} / ${match[2]}` };
  }
  return { aspectRatio: '1 / 1' };
}

/** 底部工具条内 SelectMenu 触发器：与模型选择器风格一致 */
const studioPillSelectButton =
  'h-9 w-auto rounded-full border-gray-200 bg-white px-3 pr-9 text-xs font-medium text-gray-800 shadow-theme-xs hover:border-gray-300 focus:border-[#475CFF] focus:ring-[#475CFF]/20 dark:border-gray-700 dark:bg-dark-primary dark:text-white/90 dark:hover:border-gray-600';

/** 上传区空槽 / 预览槽统一尺寸与圆角 */
const studioUploadSlotBox = 'size-[72px] shrink-0 overflow-hidden rounded-2xl';

const studioUploadEmptyLabel = cn(
  'group/upload relative flex cursor-pointer flex-col items-center justify-center gap-1 transition-all duration-200',
  studioUploadSlotBox,
  'border border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white text-gray-400',
  'hover:border-solid hover:border-[#475CFF]/60 hover:from-[#475CFF]/5 hover:to-[#8B97FF]/10 hover:text-[#475CFF] hover:shadow-[0_4px_16px_-4px_rgba(71,92,255,0.25)]',
  'dark:border-gray-700 dark:from-white/[0.03] dark:to-white/[0.06] dark:text-gray-500',
  'dark:hover:border-[#8B97FF]/60 dark:hover:from-[#8B97FF]/[0.08] dark:hover:to-[#475CFF]/[0.12] dark:hover:text-[#8B97FF] dark:hover:shadow-[0_4px_16px_-4px_rgba(139,151,255,0.35)]'
);

const studioUploadPreviewBox = cn(
  'relative ring-1 ring-gray-200/80 bg-gray-100 transition-all duration-200',
  'hover:ring-[#475CFF]/40 hover:shadow-[0_4px_16px_-4px_rgba(71,92,255,0.25)]',
  'dark:ring-gray-700/80 dark:bg-white/10',
  'dark:hover:ring-[#8B97FF]/40 dark:hover:shadow-[0_4px_16px_-4px_rgba(139,151,255,0.35)]',
  studioUploadSlotBox
);

const studioUploadRemoveButton =
  'absolute -right-1.5 -top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-gray-900/85 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition hover:scale-110 hover:bg-red-500 dark:bg-white/90 dark:text-gray-900 dark:ring-black/10 dark:hover:bg-red-500 dark:hover:text-white opacity-0 group-hover/preview:opacity-100 focus:opacity-100';

export function ImageGeneratorStudio() {
  const { t } = useI18n();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [modelRows, setModelRows] = useState<ModelHotImageRow[]>([]);
  const [modelListLoading, setModelListLoading] = useState(true);
  const [aspect, setAspect] = useState('1:1');
  /** 对应 schema 的 `resolution`（如 1K/high）或回退 low/medium/high */
  const [resolution, setResolution] = useState('high');
  const [refImages, setRefImages] = useState<RefImageAsset[]>([]);
  const refImagesRef = useRef<RefImageAsset[]>([]);
  const [generating, setGenerating] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsHeartbeatRef = useRef<{ stop: () => void } | null>(null);
  const wsGenIdRef = useRef(0);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const genFinishedRef = useRef(false);
  const lastGenMetaRef = useRef<{
    prompt: string;
    model: string;
    aspect: string;
    resolution: string;
    referenceImageUrls?: string[];
  }>({
    prompt: '',
    model: '',
    aspect: '',
    resolution: '',
  });
  const [items, setItems] = useState<GenRecord[]>([]);
  const [historyInitialLoading, setHistoryInitialLoading] = useState(true);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [itemMenuOpenId, setItemMenuOpenId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [downloadingItemId, setDownloadingItemId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<GenRecord | null>(null);

  const historyFirstPageReadyRef = useRef(false);
  const itemMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyFetchLockedRef = useRef(false);
  const nextHistoryPageRef = useRef(1);
  const apiHistoryLoadedCountRef = useRef(0);
  const lastListScrollTopRef = useRef(-1);
  const historyInitialScrollDoneRef = useRef(false);

  const mapApiToGenRecord = useCallback(
    (r: ReturnType<typeof mapImageMessageRecordToGenLike>): GenRecord => ({
      id: r.id,
      prompt: r.prompt,
      model: r.model,
      aspect: r.aspect,
      resolution: r.resolution,
      imageUrl: r.imageUrl,
      referenceImageUrls: r.referenceImageUrls,
      previewClass: r.imageUrl ? undefined : PLACEHOLDER_PREVIEW,
      costUsd: r.costUsd,
    }),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      setModelListLoading(true);
      try {
        const list = await fetchModelHotImageList(controller.signal);
        if (cancelled) return;
        setModelRows(list);
        setModel((prev) => {
          if (prev && list.some((x) => x.modelId === prev)) return prev;
          return list[0]?.modelId ?? '';
        });
      } catch {
        if (!cancelled) {
          setModelRows([]);
          setModel('');
        }
      } finally {
        if (!cancelled) setModelListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      setHistoryInitialLoading(true);
      historyFirstPageReadyRef.current = false;
      nextHistoryPageRef.current = 1;
      apiHistoryLoadedCountRef.current = 0;
      try {
        const { records, total } = await fetchImageMessagePage(1, {
          signal: controller.signal,
        });
        if (cancelled) return;
        const mapped = [...records].reverse().map(mapApiToGenRecord);
        setItems(mapped);
        apiHistoryLoadedCountRef.current = records.length;
        nextHistoryPageRef.current = 2;
        const hasMore =
          records.length > 0 &&
          (total > 0
            ? apiHistoryLoadedCountRef.current < total
            : records.length >= IMAGE_MESSAGE_PAGE_SIZE);
        setHasMoreHistory(hasMore);
        historyFirstPageReadyRef.current = true;
      } catch {
        if (!cancelled) {
          toast.error(t('imageGen.history.loadFailed'));
          setItems([]);
          setHasMoreHistory(false);
        }
      } finally {
        if (!cancelled) setHistoryInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [mapApiToGenRecord, t]);

  const modelSelectOptions = useMemo((): SelectMenuOption[] => {
    if (modelListLoading) {
      return [{ value: '', label: t('imageGen.modelLoading') }];
    }
    if (modelRows.length === 0) {
      return [{ value: '', label: t('imageGen.modelEmpty') }];
    }
    return modelRows.map((m) => ({
      value: m.modelId,
      label: m.name,
      icon: m.icon ?? null,
    }));
  }, [modelListLoading, modelRows, t]);

  const selectedModel = useMemo(
    () => modelRows.find((m) => m.modelId === model),
    [modelRows, model]
  );

  const aspectOptions = useMemo((): SelectMenuOption[] | null => {
    const e = readSchemaInputEnum(selectedModel, 'aspect_ratio');
    if (!e?.length) return null;
    return e.map((v) => ({ value: v, label: v }));
  }, [selectedModel]);

  const resolutionOptions = useMemo((): SelectMenuOption[] | null => {
    const e = readSchemaInputEnum(selectedModel, 'resolution');
    if (!e?.length) return null;
    return e.map((v) => ({ value: v, label: v }));
  }, [selectedModel]);

  const showAspectRatio = Boolean(aspectOptions?.length);
  const showResolution = Boolean(resolutionOptions?.length);

  const maxRefImages = useMemo(
    () => readMaxReferenceImageCount(selectedModel),
    [selectedModel]
  );

  const uploadHintText = useMemo(
    () => t('imageGen.uploadHint').replace(/\{count\}/g, String(maxRefImages)),
    [t, maxRefImages]
  );

  useEffect(() => {
    refImagesRef.current = refImages;
  }, [refImages]);

  useEffect(() => {
    setRefImages((prev) => {
      if (prev.length <= maxRefImages) return prev;
      const kept = prev.slice(0, maxRefImages);
      prev.slice(maxRefImages).forEach((x) => URL.revokeObjectURL(x.previewUrl));
      return kept;
    });
  }, [maxRefImages]);

  useEffect(() => {
    return () => {
      refImagesRef.current.forEach((x) => URL.revokeObjectURL(x.previewUrl));
    };
  }, []);

  const uploadRefImage = useCallback(
    async (file: File, localId: string) => {
      try {
        const { url: remoteUrl } = await uploadImageFile(file);
        setRefImages((prev) =>
          prev.map((x) =>
            x.localId === localId ? { ...x, remoteUrl, status: 'done' } : x
          )
        );
      } catch (err) {
        setRefImages((prev) =>
          prev.map((x) => (x.localId === localId ? { ...x, status: 'error' } : x))
        );
        toast.error(
          err instanceof Error && err.message ? err.message : t('imageGen.upload.failed')
        );
      }
    },
    [t]
  );

  const enqueueRefImages = useCallback(
    (files: File[]) => {
      const imgs = files.filter(isImageFile);
      if (!imgs.length) {
        toast.error(t('imageGen.upload.invalidType'));
        return;
      }

      const room = Math.max(0, maxRefImages - refImagesRef.current.length);
      if (room <= 0) {
        toast.error(t('imageGen.upload.maxReached'));
        return;
      }

      const batch = imgs.slice(0, room);
      if (!batch.length) return;

      const additions: RefImageAsset[] = batch.map((file) => ({
        localId: newLocalId(),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading',
      }));

      batch.forEach((file, index) => {
        void uploadRefImage(file, additions[index]!.localId);
      });

      setRefImages((prev) => [...prev, ...additions]);
    },
    [maxRefImages, t, uploadRefImage]
  );

  const removeRefImage = useCallback((localId: string) => {
    setRefImages((prev) => {
      const target = prev.find((x) => x.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((x) => x.localId !== localId);
    });
  }, []);

  const refImagesUploading = refImages.some((x) => x.status === 'uploading');

  const handleRefImagesFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list?.length) return;
      const picked = Array.from(list);
      e.target.value = '';
      enqueueRefImages(picked);
    },
    [enqueueRefImages]
  );

  const handleRefImagesPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = e.clipboardData?.files;
      if (!files?.length) return;
      const imgs = Array.from(files).filter(isImageFile);
      if (!imgs.length) return;
      e.preventDefault();
      enqueueRefImages(imgs);
    },
    [enqueueRefImages]
  );

  const handleRefImagesDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      enqueueRefImages(Array.from(files));
    },
    [enqueueRefImages]
  );

  const refImagesAtMax = refImages.length >= maxRefImages;

  useEffect(() => {
    if (!selectedModel) return;
    const ae = readSchemaInputEnum(selectedModel, 'aspect_ratio');
    const ad = readSchemaInputStringDefault(selectedModel, 'aspect_ratio');
    if (ae?.length) {
      setAspect((prev) =>
        ae.includes(prev) ? prev : ad && ae.includes(ad) ? ad : ae[0]!
      );
    }
    const re = readSchemaInputEnum(selectedModel, 'resolution');
    const rd = readSchemaInputStringDefault(selectedModel, 'resolution');
    if (re?.length) {
      setResolution((prev) =>
        re.includes(prev) ? prev : rd && re.includes(rd) ? rd : re[0]!
      );
    }
  }, [selectedModel]);

  const clearWsHeartbeat = useCallback(() => {
    wsHeartbeatRef.current?.stop();
    wsHeartbeatRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearWsHeartbeat();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [clearWsHeartbeat]);

  const loadOlderHistoryPage = useCallback(async () => {
    if (!historyFirstPageReadyRef.current) return;
    if (!hasMoreHistory || historyFetchLockedRef.current) return;
    if (historyLoadingMore || historyInitialLoading) return;

    historyFetchLockedRef.current = true;
    setHistoryLoadingMore(true);

    const el = listScrollRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;
    const prevScrollTop = el?.scrollTop ?? 0;

    try {
      const page = nextHistoryPageRef.current;
      const { records, total } = await fetchImageMessagePage(page);
      if (records.length === 0) {
        setHasMoreHistory(false);
        return;
      }
      const batch = [...records].reverse().map(mapApiToGenRecord);
      setItems((prev) => [...batch, ...prev]);
      nextHistoryPageRef.current = page + 1;
      apiHistoryLoadedCountRef.current += records.length;
      const hasMore =
        total > 0
          ? apiHistoryLoadedCountRef.current < total
          : records.length >= IMAGE_MESSAGE_PAGE_SIZE;
      setHasMoreHistory(hasMore);

      requestAnimationFrame(() => {
        const box = listScrollRef.current;
        if (!box) return;
        const delta = box.scrollHeight - prevScrollHeight;
        box.scrollTop = prevScrollTop + delta;
      });
    } catch {
      toast.error(t('imageGen.history.loadFailed'));
    } finally {
      historyFetchLockedRef.current = false;
      setHistoryLoadingMore(false);
    }
  }, [
    hasMoreHistory,
    historyInitialLoading,
    historyLoadingMore,
    mapApiToGenRecord,
    t,
  ]);

  useEffect(() => {
    const el = listScrollRef.current;
    if (!el) return;
    lastListScrollTopRef.current = el.scrollTop;

    const onScroll = () => {
      const st = el.scrollTop;
      const prev = lastListScrollTopRef.current;
      lastListScrollTopRef.current = st;
      const scrollingUp = prev >= 0 && st < prev - 1;
      if (scrollingUp && st < 160) {
        void loadOlderHistoryPage();
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadOlderHistoryPage]);

  const scrollListToBottom = useCallback((onlyIfScrollable = false) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = listScrollRef.current;
        if (!el) return;
        if (onlyIfScrollable && el.scrollHeight <= el.clientHeight) return;
        el.scrollTop = el.scrollHeight;
      });
    });
  }, []);

  useLayoutEffect(() => {
    if (historyInitialLoading || items.length === 0 || historyInitialScrollDoneRef.current) {
      return;
    }
    historyInitialScrollDoneRef.current = true;
    scrollListToBottom(true);
  }, [historyInitialLoading, items.length, scrollListToBottom]);

  useLayoutEffect(() => {
    if (!generating) return;
    const el = listScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [generating]);

  const wsMessageTexts = useMemo(
    () => ({
      emptyDataList: t('imageGen.ws.emptyDataList'),
      noResultUrl: t('imageGen.ws.noResultUrl'),
      server500: t('imageGen.ws.server500'),
      insufficientBalance: t('imageGen.ws.insufficientBalance'),
      generateFailed: t('imageGen.ws.generateFailed'),
    }),
    [t]
  );

  const finishGeneration = useCallback(
    (errorMessage?: string) => {
      genFinishedRef.current = true;
      clearWsHeartbeat();
      setGenerating(false);
      if (errorMessage) {
        setWsError(errorMessage);
        toast.error(errorMessage);
      }
      try {
        wsRef.current?.close(1000, 'done');
      } catch {
        /* ignore */
      }
      if (wsRef.current) wsRef.current = null;
    },
    [clearWsHeartbeat]
  );

  const applyWsMessage = useCallback(
    (raw: string) => {
      const parsed = parseAiGenerateWebSocketMessage(raw);
      if (!parsed) return;

      const result = handleAiGenerateWebSocketMessage(parsed, wsMessageTexts);

      if (result.kind === 'session') {
        sessionIdRef.current = result.sessionId;
        return;
      }

      if (result.kind === 'ignore') return;

      if (result.kind === 'error') {
        finishGeneration(result.message);
        return;
      }

      if (result.sessionId) {
        sessionIdRef.current = result.sessionId;
      }

      const meta = lastGenMetaRef.current;
      const baseId = result.sessionId ?? `gen-${Date.now()}`;
      const newRecords: GenRecord[] = result.imageUrls.map((imageUrl, index) => ({
        id: `${baseId}-${index}`,
        sessionId: result.sessionId,
        prompt: meta.prompt,
        model: meta.model,
        aspect: meta.aspect,
        resolution: meta.resolution,
        imageUrl,
        referenceImageUrls: meta.referenceImageUrls,
        costUsd: result.costUsd,
      }));

      setItems((prev) => [...prev, ...newRecords]);
      finishGeneration();
      scrollListToBottom();
    },
    [finishGeneration, scrollListToBottom, wsMessageTexts]
  );

  const handleGenerate = useCallback(
    async (
      overridePrompt?: string,
      overrideRefImages?: RefImageAsset[],
      overrideAspect?: string,
      overrideResolution?: string,
      overrideModel?: string
    ) => {
      const usePrompt = overridePrompt ?? prompt;
      const useRefImages = overrideRefImages ?? refImages;
      const useAspect = overrideAspect ?? aspect;
      const useResolution = overrideResolution ?? resolution;
      const useModel = overrideModel ?? model;

      setWsError(null);
      if (modelListLoading || modelRows.length === 0 || !useModel) {
        setWsError(t('imageGen.error.noModel'));
        return;
      }
      if (!usePrompt.trim()) {
        setWsError(t('imageGen.error.promptRequired'));
        return;
      }
      if (generating) return;
      if (refImagesUploading) {
        setWsError(t('imageGen.upload.inProgress'));
        toast.error(t('imageGen.upload.inProgress'));
        return;
      }

      const imageUrls = useRefImages
        .filter((x) => x.status === 'done' && x.remoteUrl)
        .map((x) => x.remoteUrl!);

      genFinishedRef.current = false;
      setGenerating(true);
      lastGenMetaRef.current = {
        prompt: usePrompt.trim(),
        model: useModel,
        aspect: showAspectRatio ? useAspect : '',
        resolution: showResolution ? useResolution : '',
        referenceImageUrls: imageUrls,
      };
      try {
        const message = buildAiImageGenerateMessage({
          model: useModel,
          prompt: usePrompt.trim(),
          aspectRatio: showAspectRatio ? useAspect : undefined,
          resolution: showResolution ? useResolution : undefined,
          imageUrls,
        });
        const payload = JSON.stringify(message);

        clearWsHeartbeat();

        const prevWs = wsRef.current;
        wsRef.current = null;
        prevWs?.close(1000, 'replaced');

        const genId = ++wsGenIdRef.current;
        const url = getAiImageGenerateWebSocketUrl();
        let connectTimer: ReturnType<typeof setTimeout> | undefined;
        let wsHeartbeat: ReturnType<typeof createAiGenerateWebSocketHeartbeat> | undefined;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        const failConnect = (detail?: string) => {
          if (wsGenIdRef.current !== genId || genFinishedRef.current) return;
          const msg = detail
            ? `${t('imageGen.ws.error')} (${detail})`
            : t('imageGen.ws.error');
          finishGeneration(msg);
        };

        const sendPayload = () => {
          if (wsGenIdRef.current !== genId || ws.readyState !== WebSocket.OPEN) return;
          if (connectTimer) {
            clearTimeout(connectTimer);
            connectTimer = undefined;
          }
          ws.send(payload);
          wsHeartbeat = createAiGenerateWebSocketHeartbeat(ws);
          wsHeartbeatRef.current = wsHeartbeat;
        };

        connectTimer = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            try {
              ws.close();
            } catch {
              /* ignore */
            }
            failConnect('timeout');
          }
        }, 20000);

        ws.onopen = () => {
          if (wsGenIdRef.current !== genId) return;
          try {
            sendPayload();
          } catch {
            failConnect('send');
          }
        };

        ws.onmessage = (event) => {
          if (wsGenIdRef.current !== genId) return;
          const raw = typeof event.data === 'string' ? event.data : '';
          if (!raw) return;
          wsHeartbeat?.touch();
          if (isAiGenerateWsHeartbeatPayload(raw)) return;
          applyWsMessage(raw);
        };

        ws.onerror = () => {
          if (wsGenIdRef.current !== genId || genFinishedRef.current) return;
          failConnect();
        };

        ws.onclose = (event) => {
          if (connectTimer) {
            clearTimeout(connectTimer);
            connectTimer = undefined;
          }
          if (wsHeartbeatRef.current === wsHeartbeat) {
            wsHeartbeat?.stop();
            wsHeartbeatRef.current = null;
          }
          if (wsGenIdRef.current !== genId) return;
          if (wsRef.current === ws) wsRef.current = null;
          if (!genFinishedRef.current) {
            const detail =
              event.code !== 1000 && event.code !== 1005
                ? `code ${event.code}${event.reason ? `: ${event.reason}` : ''}`
                : undefined;
            failConnect(detail);
          }
        };
      } catch {
        finishGeneration(t('imageGen.ws.error'));
      }
    },
    [
      aspect,
      generating,
      model,
      modelListLoading,
      modelRows.length,
      prompt,
      refImages,
      refImagesUploading,
      resolution,
      showAspectRatio,
      showResolution,
      clearWsHeartbeat,
      applyWsMessage,
      finishGeneration,
      t,
    ]
  );

  const clearItemMenuCloseTimer = useCallback(() => {
    if (itemMenuCloseTimerRef.current != null) {
      window.clearTimeout(itemMenuCloseTimerRef.current);
      itemMenuCloseTimerRef.current = null;
    }
  }, []);

  const scheduleItemMenuClose = useCallback(() => {
    clearItemMenuCloseTimer();
    itemMenuCloseTimerRef.current = window.setTimeout(() => {
      setItemMenuOpenId(null);
      itemMenuCloseTimerRef.current = null;
    }, 150);
  }, [clearItemMenuCloseTimer]);

  const openItemMenu = useCallback(
    (id: string) => {
      clearItemMenuCloseTimer();
      setItemMenuOpenId(id);
    },
    [clearItemMenuCloseTimer]
  );

  useEffect(() => {
    return () => clearItemMenuCloseTimer();
  }, [clearItemMenuCloseTimer]);

  const openDeleteConfirm = useCallback(
    (item: GenRecord) => {
      clearItemMenuCloseTimer();
      setItemMenuOpenId(null);
      setDeleteCandidate(item);
      setDeleteConfirmOpen(true);
    },
    [clearItemMenuCloseTimer]
  );

  const handleDownloadItem = useCallback(
    async (item: GenRecord) => {
      if (!item.imageUrl || downloadingItemId) return;

      clearItemMenuCloseTimer();
      setItemMenuOpenId(null);
      setDownloadingItemId(item.id);

      try {
        await downloadRemoteFile(item.imageUrl, `image-${item.id}.png`);
        toast.success(t('imageGen.action.downloadSuccess'));
      } catch (err) {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : t('imageGen.action.downloadFailed')
        );
      } finally {
        setDownloadingItemId(null);
      }
    },
    [clearItemMenuCloseTimer, downloadingItemId, t]
  );

  const handleDeleteItem = useCallback(
    async (item: GenRecord): Promise<boolean> => {
      if (deletingItemId) return false;

      const snapshot = items;
      setDeletingItemId(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));

      try {
        await deleteImageMessage(item.id);
        toast.success(t('imageGen.action.deleteSuccess'));
        return true;
      } catch (err) {
        setItems(snapshot);
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : t('imageGen.action.deleteFailed')
        );
        return false;
      } finally {
        setDeletingItemId(null);
      }
    },
    [deletingItemId, items, t]
  );

  const handleReEdit = useCallback((item: GenRecord) => {
    setPrompt(item.prompt);
    setModel(item.model);
    if (item.aspect) setAspect(item.aspect);
    if (item.resolution) setResolution(item.resolution);

    if (item.referenceImageUrls && item.referenceImageUrls.length > 0) {
      const refImages = item.referenceImageUrls.map((url) => ({
        localId: newLocalId(),
        name: `reference-${item.id}`,
        previewUrl: url,
        remoteUrl: url,
        status: 'done' as const,
      }));
      setRefImages(refImages);
    } else {
      setRefImages([]);
    }

    setTimeout(() => {
      fileInputRef.current?.focus();
    }, 100);
  }, []);

  const handleRegenerate = useCallback((item: GenRecord) => {
    const refImageAssets = item.referenceImageUrls && item.referenceImageUrls.length > 0
      ? item.referenceImageUrls.map((url) => ({
          localId: newLocalId(),
          name: `reference-${item.id}`,
          previewUrl: url,
          remoteUrl: url,
          status: 'done' as const,
        }))
      : [];

    setPrompt(item.prompt);
    setModel(item.model);
    if (item.aspect) setAspect(item.aspect);
    if (item.resolution) setResolution(item.resolution);
    setRefImages(refImageAssets);

    queueMicrotask(() => {
      setTimeout(() => {
        void handleGenerate(item.prompt, refImageAssets, item.aspect, item.resolution, item.model);
      }, 50);
    });
  }, [handleGenerate]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col bg-gray-50 dark:bg-gray-900">
      <div
        ref={listScrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-6 sm:px-6 md:px-10"
      >
        <div className="mx-auto max-w-4xl space-y-10">
          {historyInitialLoading ? (
            <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
              {t('imageGen.history.loading')}
            </p>
          ) : (
            <>
              {historyLoadingMore ? (
                <p className="py-2 text-center text-xs text-gray-400 dark:text-gray-500">
                  {t('imageGen.history.loadingMore')}
                </p>
              ) : null}
              {items.length === 0 && !generating ? (
                <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  {t('imageGen.promptPlaceholder')}
                </p>
              ) : null}
              {items.map((item) => {
                const itemMenuOpen = itemMenuOpenId === item.id;
                return (
            <article
              key={item.id}
              className="border-b border-gray-100 pb-10 last:border-b-0 dark:border-gray-800"
            >
              <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    {item.referenceImageUrls && item.referenceImageUrls.length > 0 ? (
                      <div className="flex -space-x-1.5">
                        {item.referenceImageUrls.slice(0, 3).map((url, idx) => (
                          <div
                            key={idx}
                            className="relative size-11 shrink-0 overflow-hidden rounded-xl border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-white/10"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>
                        ))}
                        {item.referenceImageUrls.length > 3 && (
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-gray-200 text-[11px] font-medium text-gray-600 dark:border-gray-900 dark:bg-gray-700 dark:text-gray-300">
                            +{item.referenceImageUrls.length - 3}
                          </div>
                        )}
                      </div>
                    ) : null}
                    <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-gray-900 dark:text-white/90">
                      {item.prompt}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={genListMetaTagClass}>{item.model}</span>
                    {item.aspect ? (
                      <span className={genListMetaTagClass}>{item.aspect}</span>
                    ) : null}
                    {item.resolution ? (
                      <span className={genListMetaTagClass}>{item.resolution}</span>
                    ) : null}
                    {item.costUsd ? (
                      <span className={genListCostTagClass}>{item.costUsd}</span>
                    ) : null}
                  </div>
                  {item.imageUrl ? (
                    <div
                      className="mt-4 w-full max-w-md overflow-hidden rounded-2xl bg-gray-100 shadow-inner ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10"
                      style={historyImageAspectStyle(item.aspect)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- 生图结果 URL 域名不固定 */}
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'mt-4 w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br shadow-inner ring-1 ring-black/5 dark:ring-white/10',
                        item.previewClass ?? PLACEHOLDER_PREVIEW
                      )}
                      style={historyImageAspectStyle(item.aspect)}
                    />
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleReEdit(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-primary dark:text-gray-200 dark:hover:bg-white/5"
                    >
                      {t('imageGen.action.reEdit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegenerate(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-primary dark:text-gray-200 dark:hover:bg-white/5"
                    >
                      {t('imageGen.action.regenerate')}
                    </button>
                    <div
                      className="relative"
                      onMouseLeave={scheduleItemMenuClose}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => openItemMenu(item.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearItemMenuCloseTimer();
                          setItemMenuOpenId((prev) =>
                            prev === item.id ? null : item.id
                          );
                        }}
                        className={cn(
                          'inline-flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-primary dark:text-gray-400 dark:hover:bg-white/5',
                          itemMenuOpen && 'bg-gray-50 dark:bg-white/10'
                        )}
                        aria-expanded={itemMenuOpen}
                        aria-haspopup="menu"
                        aria-label={t('imageGen.action.more')}
                      >
                        ···
                      </button>
                      {itemMenuOpen ? (
                        <div
                          role="menu"
                          className="absolute bottom-full right-0 z-20 mb-1 min-w-[104px] pt-1"
                          onMouseEnter={() => openItemMenu(item.id)}
                          onMouseLeave={scheduleItemMenuClose}
                        >
                          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-theme-lg dark:border-gray-700 dark:bg-dark-primary">
                            <button
                              type="button"
                              role="menuitem"
                              disabled={
                                !item.imageUrl ||
                                downloadingItemId === item.id ||
                                deletingItemId === item.id
                              }
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-800 transition hover:bg-gray-50 disabled:opacity-50 dark:text-white/90 dark:hover:bg-white/10"
                              onClick={() => handleDownloadItem(item)}
                            >
                              <svg
                                className="size-4 shrink-0 text-gray-500 dark:text-gray-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <path d="M12 3v12" />
                                <path d="m7 10 5 5 5-5" />
                                <path d="M5 21h14" />
                              </svg>
                              {t('imageGen.action.download')}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              disabled={
                                deletingItemId === item.id ||
                                downloadingItemId === item.id
                              }
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                              onClick={() => openDeleteConfirm(item)}
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
                              {t('imageGen.action.delete')}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
              </div>
            </article>
                );
              })}
          {generating ? (
            <article className="border-b border-gray-100 pb-10 dark:border-gray-800">
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageGen.generating')}</p>
                <div
                  className={cn(
                    'mt-4 w-full max-w-md animate-pulse overflow-hidden rounded-2xl bg-gradient-to-br',
                    PLACEHOLDER_PREVIEW
                  )}
                  style={historyImageAspectStyle(aspect)}
                />
              </div>
            </article>
          ) : null}
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 px-4 pb-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-theme-md dark:border-gray-800 dark:bg-dark-primary">
            <div className="flex gap-3" data-ref-image-count={refImages.length}>
              <div className="flex w-[88px] shrink-0 flex-col items-center">
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple={maxRefImages > 1}
                  disabled={refImagesAtMax}
                  className="sr-only"
                  onChange={handleRefImagesFileChange}
                />
                <label
                  htmlFor={fileInputId}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleRefImagesDrop}
                  className={cn(
                    studioUploadEmptyLabel,
                    refImagesAtMax && 'pointer-events-none cursor-not-allowed opacity-50'
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 transition-transform duration-200 group-hover/upload:scale-110"
                    aria-hidden
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="9" cy="9" r="1.6" />
                    <path d="m21 15-4.5-4.5L7 21" />
                  </svg>
                  <span className="text-[10px] font-medium leading-none">
                    {t('common.upload') ?? '上传'}
                  </span>
                </label>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onPaste={handleRefImagesPaste}
                rows={3}
                placeholder={t('imageGen.promptPlaceholder')}
                className="min-h-[72px] w-full resize-none rounded-xl border-0 bg-transparent text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-white/90 dark:placeholder:text-gray-500"
              />
            </div>
            <p className="mt-1 pl-[100px] text-[11px] leading-snug text-gray-400 dark:text-gray-500">
              {uploadHintText}
            </p>
            {refImages.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2 pl-[100px]">
                {refImages.map((asset) => (
                  <li key={asset.localId} className="group/preview relative">
                    <div
                      className={cn(
                        studioUploadPreviewBox,
                        asset.status === 'error' && 'ring-red-300 dark:ring-red-800'
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.previewUrl}
                        alt=""
                        className={cn(
                          'size-full object-cover transition-transform duration-300 group-hover/preview:scale-105',
                          asset.status === 'uploading' && 'opacity-60'
                        )}
                      />
                      {asset.status === 'uploading' ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                          <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        </span>
                      ) : null}
                      {asset.status === 'error' ? (
                        <span className="absolute inset-x-0 bottom-0 bg-red-500/85 py-0.5 text-center text-[10px] font-medium text-white">
                          {t('common.failed') ?? '失败'}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRefImage(asset.localId)}
                      className={studioUploadRemoveButton}
                      aria-label={t('common.clear')}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3"
                        aria-hidden
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {wsError ? (
              <p className="mt-1 pl-[100px] text-[11px] text-red-600 dark:text-red-400" role="alert">
                {wsError}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <SelectMenu
                  ariaLabel={t('imageGen.label.model')}
                  value={modelListLoading || modelRows.length === 0 ? '' : model}
                  onChange={setModel}
                  options={modelSelectOptions}
                  disabled={modelListLoading || modelRows.length === 0}
                  menuPlacement="above"
                  truncateLabels={false}
                  className="w-auto min-w-[13rem] sm:min-w-[15rem]"
                  buttonClassName={cn(
                    studioPillSelectButton,
                    'min-w-[13rem] max-w-[min(100%,20rem)] sm:min-w-[15rem]'
                  )}
                  menuClassName="min-w-[min(100vw-2rem,18rem)] max-w-[min(100vw-2rem,28rem)] sm:min-w-[20rem]"
                />
                {showAspectRatio && aspectOptions ? (
                  <SelectMenu
                    ariaLabel={t('imageGen.label.aspect')}
                    value={aspect}
                    onChange={setAspect}
                    options={aspectOptions}
                    menuPlacement="above"
                    className="w-auto"
                    buttonClassName={cn(studioPillSelectButton, 'min-w-[5.25rem]')}
                    menuClassName="min-w-[8.5rem] max-w-[12rem]"
                  />
                ) : null}
                {showResolution && resolutionOptions ? (
                  <SelectMenu
                    ariaLabel={t('imageGen.label.quality')}
                    value={resolution}
                    onChange={setResolution}
                    options={resolutionOptions}
                    menuPlacement="above"
                    className="w-auto"
                    buttonClassName={cn(studioPillSelectButton, 'min-w-[5.25rem]')}
                    menuClassName="min-w-[8.5rem] max-w-[12rem]"
                  />
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={
                  generating ||
                  refImagesUploading ||
                  modelListLoading ||
                  modelRows.length === 0 ||
                  !model ||
                  !prompt.trim()
                }
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <span className="text-base leading-none text-amber-300 dark:text-amber-500" aria-hidden>
                  ⚡
                </span>
                {generating ? t('imageGen.generating') : t('imageGen.generate')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('imageGen.action.deleteConfirm.title')}
        description={t('imageGen.action.deleteConfirm.description')}
        confirmText={t('imageGen.action.delete')}
        variant="danger"
        loading={!!deleteCandidate && deletingItemId === deleteCandidate.id}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteCandidate(null);
        }}
        onConfirm={async () => {
          if (!deleteCandidate) return;
          const ok = await handleDeleteItem(deleteCandidate);
          if (ok) {
            setDeleteConfirmOpen(false);
            setDeleteCandidate(null);
          }
        }}
      />
    </div>
  );
}
