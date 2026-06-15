'use client';

import { useI18n } from '../../../lib/studio-text';
import { cn } from '../../../lib/utils';
import {
  fetchModelHotVideoList,
  modelHasFirstFrameVideoTag,
  modelHasFirstLastFrameVideoTag,
  readMaxReferenceImageCount,
  readSchemaInputEnum,
  readSchemaInputStringDefault,
  type ModelHotVideoRow,
} from '../../../lib/api/model-hot-video';
import {
  buildAiVideoGenerateMessage,
  createAiGenerateWebSocketHeartbeat,
  getAiVideoGenerateWebSocketUrl,
  handleAiGenerateWebSocketMessage,
  isAiGenerateWsHeartbeatPayload,
  parseAiGenerateWebSocketMessage,
  type VideoFrameUploadMode,
} from '../../../lib/api/ai-video-generate-ws';
import { uploadImageFile } from '../../../lib/api/file-upload';
import {
  deleteVideoMessage,
  fetchVideoMessagePage,
  VIDEO_MESSAGE_PAGE_SIZE,
  mapVideoMessageRecordToGenLike,
  type VideoReferenceImageLayout,
} from '../../../lib/api/video-message-page';
import { downloadRemoteFile } from '../../../lib/download-file';
import { genListCostTagClass, genListMetaTagClass } from '../gen-list-tag-styles';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import { SelectMenu, type SelectMenuOption } from '../../ui/select-menu';
import { VideoPlayer } from '../../ui/video-player';
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
  duration: string;
  videoUrl?: string;
  /** 参考图列表，用于提示词左侧展示 */
  referenceImageUrls?: string[];
  /** 参考图列表展示方式（首尾帧为左右并排） */
  referenceImageLayout?: VideoReferenceImageLayout;
  /** 无图时的占位渐变 */
  previewClass?: string;
  /** 花费（美元），如 `$0.01` */
  costUsd?: string;
};

const listRefThumbClass =
  'relative size-11 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-gray-100 dark:border-gray-900 dark:bg-white/10';

function resolveReferenceImageLayout(
  frameMode?: VideoFrameUploadMode,
  urlCount = 0
): VideoReferenceImageLayout | undefined {
  if (frameMode === 'first-last-frame') return 'first-last-frame';
  if (frameMode === 'first-frame') return 'first-frame';
  return urlCount > 0 ? 'default' : undefined;
}

const PLACEHOLDER_PREVIEW =
  'from-fuchsia-200 via-violet-200 to-cyan-200 dark:from-fuchsia-950/50 dark:via-violet-950/50 dark:to-cyan-950/40';

type FrameSlot = 'first' | 'last';

type RefImageAsset = {
  localId: string;
  name: string;
  previewUrl: string;
  remoteUrl?: string;
  status: 'uploading' | 'done' | 'error';
  /** 首尾帧双槽模式下的槽位 */
  slot?: FrameSlot;
};

function getFrameSlotAsset(
  images: RefImageAsset[],
  slot: FrameSlot
): RefImageAsset | undefined {
  return images.find((x) => x.slot === slot);
}

function resolveVideoImageUrls(
  images: RefImageAsset[],
  frameMode?: VideoFrameUploadMode
): string[] {
  if (frameMode === 'first-last-frame') {
    const urls: string[] = [];
    const first = images.find(
      (x) => x.slot === 'first' && x.status === 'done' && x.remoteUrl
    );
    const last = images.find(
      (x) => x.slot === 'last' && x.status === 'done' && x.remoteUrl
    );
    if (first?.remoteUrl) urls.push(first.remoteUrl);
    if (last?.remoteUrl) urls.push(last.remoteUrl);
    return urls;
  }
  return images
    .filter((x) => x.status === 'done' && x.remoteUrl)
    .map((x) => x.remoteUrl!);
}

function refAssetsFromUrls(urls: string[], dualFrame: boolean): RefImageAsset[] {
  return urls.map((url, index) => ({
    localId: newLocalId(),
    name: `reference-${index}`,
    previewUrl: url,
    remoteUrl: url,
    status: 'done' as const,
    slot: dualFrame
      ? index === 0
        ? ('first' as const)
        : index === 1
          ? ('last' as const)
          : undefined
      : undefined,
  }));
}

function newLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 将接口 duration 对齐到模型 schema 的 enum 选项（如 `5` → `5s`） */
function normalizeDurationForSchema(
  value: string,
  options: string[] | null
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!options?.length) return trimmed;
  if (options.includes(trimmed)) return trimmed;
  const withS = /s$/i.test(trimmed) ? trimmed : `${trimmed}s`;
  if (options.includes(withS)) return withS;
  const base = trimmed.replace(/s$/i, '');
  const matched = options.find((o) => o.replace(/s$/i, '') === base);
  return matched ?? trimmed;
}

/** Windows 下部分图片 `file.type` 为空，用扩展名兜底 */
function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|bmp|heic|heif|avif|svg)$/i.test(file.name);
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

const studioUploadSlotCaption =
  'max-w-[72px] text-center text-[11px] font-medium leading-snug text-gray-500 dark:text-gray-400';

export function VideoGeneratorStudio() {
  const { t } = useI18n();
  const fileInputId = useId();
  const firstFrameInputId = useId();
  const lastFrameInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [modelRows, setModelRows] = useState<ModelHotVideoRow[]>([]);
  const [modelListLoading, setModelListLoading] = useState(true);
  const [aspect, setAspect] = useState('1:1');
  /** 对应 schema 的 `resolution`（如 1K/high）或回退 low/medium/high */
  const [resolution, setResolution] = useState('high');
  /** 对应 schema 的 `duration`（视频时长） */
  const [duration, setDuration] = useState('3s');
  const [frameMode, setFrameMode] = useState<VideoFrameUploadMode>('first-frame');
  const [refImages, setRefImages] = useState<RefImageAsset[]>([]);
  const refImagesRef = useRef<RefImageAsset[]>([]);
  const [generating, setGenerating] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsHeartbeatRef = useRef<{ stop: () => void } | null>(null);
  /** 重新编辑时待回显的 duration（在 selectedModel effect 中应用） */
  const pendingReEditDurationRef = useRef<string | null>(null);
  const wsGenIdRef = useRef(0);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const genFinishedRef = useRef(false);
  const lastGenMetaRef = useRef<{
    prompt: string;
    model: string;
    aspect: string;
    resolution: string;
    duration: string;
    referenceImageUrls?: string[];
    referenceImageLayout?: VideoReferenceImageLayout;
  }>({
    prompt: '',
    model: '',
    aspect: '',
    resolution: '',
    duration: '',
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
    (r: ReturnType<typeof mapVideoMessageRecordToGenLike>): GenRecord => ({
      id: r.id,
      prompt: r.prompt,
      model: r.model,
      aspect: r.aspect,
      resolution: r.resolution,
      duration: r.duration,
      videoUrl: r.videoUrl,
      referenceImageUrls: r.referenceImageUrls,
      referenceImageLayout: r.referenceImageLayout,
      previewClass: r.videoUrl ? undefined : PLACEHOLDER_PREVIEW,
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
        const list = await fetchModelHotVideoList(controller.signal);
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
        const { records, total } = await fetchVideoMessagePage(1, {
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
            : records.length >= VIDEO_MESSAGE_PAGE_SIZE);
        setHasMoreHistory(hasMore);
        historyFirstPageReadyRef.current = true;
      } catch {
        if (!cancelled) {
          toast.error(t('videoGen.history.loadFailed'));
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
      return [{ value: '', label: t('videoGen.modelLoading') }];
    }
    if (modelRows.length === 0) {
      return [{ value: '', label: t('videoGen.modelEmpty') }];
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

  const frameModeOptions = useMemo((): SelectMenuOption[] => {
    const opts: SelectMenuOption[] = [];
    if (modelHasFirstFrameVideoTag(selectedModel)) {
      opts.push({
        value: 'first-frame',
        label: t('videoGen.frameMode.firstFrame'),
      });
    }
    if (modelHasFirstLastFrameVideoTag(selectedModel)) {
      opts.push({
        value: 'first-last-frame',
        label: t('videoGen.frameMode.firstLastFrame'),
      });
    }
    return opts;
  }, [selectedModel, t]);

  const showFrameMode = frameModeOptions.length > 0;
  const isFirstLastFrameMode = showFrameMode && frameMode === 'first-last-frame';
  const formContentIndent = isFirstLastFrameMode ? 'pl-[188px]' : 'pl-[100px]';

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

  const durationOptions = useMemo((): SelectMenuOption[] | null => {
    const e = readSchemaInputEnum(selectedModel, 'duration');
    if (!e?.length) return null;
    return e.map((v) => ({ value: v, label: v }));
  }, [selectedModel]);

  const showAspectRatio = Boolean(aspectOptions?.length);
  const showResolution = Boolean(resolutionOptions?.length);
  const showDuration = Boolean(durationOptions?.length);

  const maxRefImages = useMemo(() => {
    if (showFrameMode) {
      return frameMode === 'first-last-frame' ? 2 : 1;
    }
    return readMaxReferenceImageCount(selectedModel);
  }, [showFrameMode, frameMode, selectedModel]);

  const singleSlotAsset = maxRefImages === 1 ? refImages[0] : undefined;

  const uploadHintText = useMemo(() => {
    if (showFrameMode) {
      return frameMode === 'first-last-frame'
        ? t('videoGen.uploadHintFirstLastFrame')
        : t('videoGen.uploadHintFirstFrame');
    }
    return t('videoGen.uploadHint').replace(/\{count\}/g, String(maxRefImages));
  }, [t, maxRefImages, showFrameMode, frameMode]);

  useEffect(() => {
    if (!showFrameMode) return;
    const values = frameModeOptions.map((o) => o.value);
    setFrameMode((prev) =>
      values.includes(prev) ? (prev as VideoFrameUploadMode) : (values[0] as VideoFrameUploadMode)
    );
  }, [showFrameMode, frameModeOptions]);

  useEffect(() => {
    refImagesRef.current = refImages;
  }, [refImages]);

  useEffect(() => {
    setRefImages((prev) => {
      if (isFirstLastFrameMode) {
        const first = prev.find((x) => x.slot === 'first');
        const last = prev.find((x) => x.slot === 'last');
        const unslotted = prev.filter((x) => !x.slot);
        if (unslotted.length === 0) {
          const next = [first, last].filter(Boolean) as RefImageAsset[];
          if (next.length === prev.length) return prev;
          prev
            .filter((x) => x !== first && x !== last)
            .forEach((x) => URL.revokeObjectURL(x.previewUrl));
          return next;
        }
        const next: RefImageAsset[] = [];
        const usedIds = new Set<string>();
        if (first) {
          next.push(first);
          usedIds.add(first.localId);
        } else if (unslotted[0]) {
          next.push({ ...unslotted[0], slot: 'first' });
          usedIds.add(unslotted[0].localId);
        }
        if (last) {
          next.push(last);
        } else {
          const forLast = unslotted.find((x) => !usedIds.has(x.localId));
          if (forLast) next.push({ ...forLast, slot: 'last' });
        }
        const keptIds = new Set(next.map((x) => x.localId));
        prev.filter((x) => !keptIds.has(x.localId)).forEach((x) => URL.revokeObjectURL(x.previewUrl));
        return next;
      }
      if (prev.length <= maxRefImages) return prev;
      const kept = prev.slice(0, maxRefImages);
      prev.slice(maxRefImages).forEach((x) => URL.revokeObjectURL(x.previewUrl));
      return kept;
    });
  }, [maxRefImages, isFirstLastFrameMode]);

  useEffect(() => {
    if (isFirstLastFrameMode) return;
    setRefImages((prev) => {
      if (!prev.some((x) => x.slot)) return prev;
      if (showFrameMode && frameMode === 'first-frame') {
        const keep = prev.find((x) => x.slot === 'first') ?? prev[0];
        prev.forEach((x) => {
          if (x !== keep) URL.revokeObjectURL(x.previewUrl);
        });
        return keep ? [{ ...keep, slot: undefined }] : [];
      }
      return prev.map((item) => {
        const next = { ...item };
        delete next.slot;
        return next;
      });
    });
  }, [isFirstLastFrameMode, frameMode, showFrameMode]);

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
          err instanceof Error && err.message ? err.message : t('videoGen.upload.failed')
        );
      }
    },
    [t]
  );

  const assignFrameSlotImage = useCallback(
    (file: File, slot: FrameSlot) => {
      if (!isImageFile(file)) {
        toast.error(t('videoGen.upload.invalidType'));
        return;
      }
      const localId = newLocalId();
      const addition: RefImageAsset = {
        localId,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading',
        slot,
      };
      setRefImages((prev) => {
        const old = prev.find((x) => x.slot === slot);
        if (old) URL.revokeObjectURL(old.previewUrl);
        return [...prev.filter((x) => x.slot !== slot), addition];
      });
      void uploadRefImage(file, localId);
    },
    [t, uploadRefImage]
  );

  const enqueueRefImages = useCallback(
    (files: File[]) => {
      const imgs = files.filter(isImageFile);
      if (!imgs.length) {
        toast.error(t('videoGen.upload.invalidType'));
        return;
      }

      if (isFirstLastFrameMode) {
        const current = refImagesRef.current;
        const targetSlot: FrameSlot | null = !getFrameSlotAsset(current, 'first')
          ? 'first'
          : !getFrameSlotAsset(current, 'last')
            ? 'last'
            : null;
        if (!targetSlot) {
          toast.error(t('videoGen.upload.maxReached'));
          return;
        }
        assignFrameSlotImage(imgs[0]!, targetSlot);
        return;
      }

      const room = Math.max(0, maxRefImages - refImagesRef.current.length);
      if (room <= 0) {
        toast.error(t('videoGen.upload.maxReached'));
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
    [assignFrameSlotImage, isFirstLastFrameMode, maxRefImages, t, uploadRefImage]
  );

  const handleFrameSlotFileChange = useCallback(
    (slot: FrameSlot) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      assignFrameSlotImage(file, slot);
    },
    [assignFrameSlotImage]
  );

  const handleFrameSlotDrop = useCallback(
    (slot: FrameSlot) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = Array.from(e.dataTransfer?.files ?? []).find(isImageFile);
      if (!file) return;
      assignFrameSlotImage(file, slot);
    },
    [assignFrameSlotImage]
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
    const de = readSchemaInputEnum(selectedModel, 'duration');
    const dd = readSchemaInputStringDefault(selectedModel, 'duration');
    if (de?.length) {
      const pending = pendingReEditDurationRef.current;
      pendingReEditDurationRef.current = null;
      if (pending) {
        const normalized = normalizeDurationForSchema(pending, de) ?? pending;
        setDuration(
          de.includes(normalized)
            ? normalized
            : dd && de.includes(dd)
              ? dd
              : de[0]!
        );
        return;
      }
      setDuration((prev) =>
        de.includes(prev) ? prev : dd && de.includes(dd) ? dd : de[0]!
      );
    }
  }, [selectedModel]);

  const clearWsHeartbeat = useCallback(() => {
    wsHeartbeatRef.current?.stop();
    wsHeartbeatRef.current = null;
  }, []);

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
      const { records, total } = await fetchVideoMessagePage(page);
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
          : records.length >= VIDEO_MESSAGE_PAGE_SIZE;
      setHasMoreHistory(hasMore);

      requestAnimationFrame(() => {
        const box = listScrollRef.current;
        if (!box) return;
        const delta = box.scrollHeight - prevScrollHeight;
        box.scrollTop = prevScrollTop + delta;
      });
    } catch {
      toast.error(t('videoGen.history.loadFailed'));
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
      emptyDataList: t('videoGen.ws.emptyDataList'),
      noResultUrl: t('videoGen.ws.noResultUrl'),
      server500: t('videoGen.ws.server500'),
      insufficientBalance: t('videoGen.ws.insufficientBalance'),
      generateFailed: t('videoGen.ws.generateFailed'),
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
      const newRecords: GenRecord[] = result.videoUrls.map((videoUrl, index) => ({
        id: `${baseId}-${index}`,
        sessionId: result.sessionId,
        prompt: meta.prompt,
        model: meta.model,
        aspect: meta.aspect,
        resolution: meta.resolution,
        duration: meta.duration,
        videoUrl,
        referenceImageUrls: meta.referenceImageUrls,
        referenceImageLayout: meta.referenceImageLayout,
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
      overrideModel?: string,
      overrideDuration?: string,
      overrideFrameMode?: VideoFrameUploadMode
    ) => {
      const usePrompt = overridePrompt ?? prompt;
      const useRefImages = overrideRefImages ?? refImages;
      const useAspect = overrideAspect ?? aspect;
      const useResolution = overrideResolution ?? resolution;
      const useModel = overrideModel ?? model;
      const useDuration = overrideDuration ?? duration;

      setWsError(null);
      if (modelListLoading || modelRows.length === 0 || !useModel) {
        setWsError(t('videoGen.error.noModel'));
        return;
      }
      if (!usePrompt.trim()) {
        setWsError(t('videoGen.error.promptRequired'));
        return;
      }
      if (generating) return;
      if (refImagesUploading) {
        setWsError(t('videoGen.upload.inProgress'));
        toast.error(t('videoGen.upload.inProgress'));
        return;
      }

      const activeFrameMode =
        overrideFrameMode ?? (showFrameMode ? frameMode : undefined);
      const imageUrls = resolveVideoImageUrls(useRefImages, activeFrameMode);

      genFinishedRef.current = false;
      setGenerating(true);
      lastGenMetaRef.current = {
        prompt: usePrompt.trim(),
        model: useModel,
        aspect: showAspectRatio ? useAspect : '',
        resolution: showResolution ? useResolution : '',
        duration: showDuration ? useDuration : '',
        referenceImageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        referenceImageLayout: resolveReferenceImageLayout(activeFrameMode, imageUrls.length),
      };
      try {
        const message = buildAiVideoGenerateMessage({
          model: useModel,
          prompt: usePrompt.trim(),
          aspectRatio: showAspectRatio ? useAspect : undefined,
          resolution: showResolution ? useResolution : undefined,
          duration: showDuration ? useDuration : undefined,
          imageUrls,
          frameMode: activeFrameMode,
        });
        const payload = JSON.stringify(message);

        clearWsHeartbeat();

        const prevWs = wsRef.current;
        wsRef.current = null;
        prevWs?.close(1000, 'replaced');

        const genId = ++wsGenIdRef.current;
        const url = getAiVideoGenerateWebSocketUrl();
        let connectTimer: ReturnType<typeof setTimeout> | undefined;
        let wsHeartbeat: ReturnType<typeof createAiGenerateWebSocketHeartbeat> | undefined;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        const failConnect = (detail?: string) => {
          if (wsGenIdRef.current !== genId || genFinishedRef.current) return;
          const msg = detail
            ? `${t('videoGen.ws.error')} (${detail})`
            : t('videoGen.ws.error');
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
        finishGeneration(t('videoGen.ws.error'));
      }
    }, [
      aspect,
      generating,
      model,
      modelListLoading,
      modelRows.length,
      prompt,
      refImages,
      refImagesUploading,
      resolution,
      duration,
      showAspectRatio,
      showResolution,
      showDuration,
      showFrameMode,
      frameMode,
      clearWsHeartbeat,
      applyWsMessage,
      finishGeneration,
      t,
    ]);

  const handleReEdit = useCallback((item: GenRecord) => {
    const row = modelRows.find((m) => m.modelId === item.model);

    setPrompt(item.prompt);
    if (item.aspect) setAspect(item.aspect);
    if (item.resolution) setResolution(item.resolution);

    if (item.referenceImageLayout === 'first-last-frame') {
      setFrameMode('first-last-frame');
    } else if (item.referenceImageLayout === 'first-frame') {
      setFrameMode('first-frame');
    }

    if (item.referenceImageUrls && item.referenceImageUrls.length > 0) {
      const dual =
        modelHasFirstLastFrameVideoTag(row) && item.referenceImageUrls.length >= 2;
      setRefImages(refAssetsFromUrls(item.referenceImageUrls, dual));
    } else {
      setRefImages([]);
    }

    if (item.duration) {
      pendingReEditDurationRef.current = item.duration;
    }
    setModel(item.model);

    setTimeout(() => {
      fileInputRef.current?.focus();
    }, 100);
  }, [modelRows]);

  const handleRegenerate = useCallback((item: GenRecord) => {
    const row = modelRows.find((m) => m.modelId === item.model);
    const dual =
      modelHasFirstLastFrameVideoTag(row) && (item.referenceImageUrls?.length ?? 0) >= 2;
    const refImageAssets =
      item.referenceImageUrls && item.referenceImageUrls.length > 0
        ? refAssetsFromUrls(item.referenceImageUrls, dual)
        : [];

    setPrompt(item.prompt);
    if (dual) setFrameMode('first-last-frame');
    if (item.aspect) setAspect(item.aspect);
    if (item.resolution) setResolution(item.resolution);
    if (item.duration) {
      pendingReEditDurationRef.current = item.duration;
    }
    setRefImages(refImageAssets);
    setModel(item.model);

    const useDuration =
      normalizeDurationForSchema(
        item.duration,
        readSchemaInputEnum(row, 'duration')
      ) ?? duration;

    queueMicrotask(() => {
      setTimeout(() => {
        void handleGenerate(
          item.prompt,
          refImageAssets,
          item.aspect,
          item.resolution,
          item.model,
          useDuration,
          dual ? 'first-last-frame' : undefined
        );
      }, 50);
    });
  }, [handleGenerate, duration, modelRows]);

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
      if (!item.videoUrl || downloadingItemId) return;

      clearItemMenuCloseTimer();
      setItemMenuOpenId(null);
      setDownloadingItemId(item.id);

      try {
        await downloadRemoteFile(item.videoUrl, `video-${item.id}.mp4`);
        toast.success(t('videoGen.action.downloadSuccess'));
      } catch (err) {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : t('videoGen.action.downloadFailed')
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
        await deleteVideoMessage(item.id);
        toast.success(t('videoGen.action.deleteSuccess'));
        return true;
      } catch (err) {
        setItems(snapshot);
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : t('videoGen.action.deleteFailed')
        );
        return false;
      } finally {
        setDeletingItemId(null);
      }
    },
    [deletingItemId, items, t]
  );

  const firstFrameAsset = getFrameSlotAsset(refImages, 'first');
  const lastFrameAsset = getFrameSlotAsset(refImages, 'last');

  const renderUploadSlot = ({
    inputId,
    inputRef,
    asset,
    disabled,
    caption,
    onFileChange,
    onDrop,
    onRemove,
  }: {
    inputId: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    asset?: RefImageAsset;
    disabled?: boolean;
    caption?: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (e: React.DragEvent) => void;
    onRemove?: () => void;
  }) => (
    <div className="flex flex-col items-center gap-1.5">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!asset && maxRefImages > 1}
        disabled={disabled}
        className="sr-only"
        onChange={onFileChange}
      />
      <div className="group/preview relative">
        {asset ? (
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
        ) : (
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={onDrop}
            className={cn(
              studioUploadEmptyLabel,
              disabled && 'pointer-events-none cursor-not-allowed opacity-50'
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
        )}
        {asset && onRemove ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
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
        ) : null}
      </div>
      {caption ? <span className={studioUploadSlotCaption}>{caption}</span> : null}
    </div>
  );

  const renderListReferenceImages = (item: GenRecord) => {
    const urls = item.referenceImageUrls;
    if (!urls?.length) return null;

    const renderThumb = (url: string, key: string | number) => (
      <div key={key} className={listRefThumbClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="size-full object-cover" />
      </div>
    );

    const useFramePairLayout =
      item.referenceImageLayout === 'first-last-frame' ||
      ((!item.referenceImageLayout || item.referenceImageLayout === 'default') &&
        urls.length >= 2 &&
        modelHasFirstLastFrameVideoTag(
          modelRows.find((m) => m.modelId === item.model)
        ));

    if (useFramePairLayout) {
      const first = urls[0]!;
      const last = urls[1];
      return (
        <div className="flex shrink-0 items-center gap-1">
          {renderThumb(first, 'first')}
          {last ? renderThumb(last, 'last') : null}
        </div>
      );
    }

    return (
      <div className="flex -space-x-1.5">
        {urls.slice(0, 3).map((url, idx) => renderThumb(url, idx))}
        {urls.length > 3 ? (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-gray-200 text-[11px] font-medium text-gray-600 dark:border-gray-900 dark:bg-gray-700 dark:text-gray-300">
            +{urls.length - 3}
          </div>
        ) : null}
      </div>
    );
  };

  const renderFrameSlot = (slot: FrameSlot, inputId: string) => {
    const asset = slot === 'first' ? firstFrameAsset : lastFrameAsset;
    const caption =
      slot === 'first' ? t('videoGen.frameSlot.first') : t('videoGen.frameSlot.last');
    return (
      <div key={slot}>
        {renderUploadSlot({
          inputId,
          asset,
          caption,
          onFileChange: handleFrameSlotFileChange(slot),
          onDrop: handleFrameSlotDrop(slot),
          onRemove: asset ? () => removeRefImage(asset.localId) : undefined,
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col bg-gray-50 dark:bg-gray-900">
      <div
        ref={listScrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-6 sm:px-6 md:px-10"
      >
        <div className="mx-auto max-w-4xl space-y-10">
          {historyInitialLoading ? (
            <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
              {t('videoGen.history.loading')}
            </p>
          ) : (
            <>
              {historyLoadingMore ? (
                <p className="py-2 text-center text-xs text-gray-400 dark:text-gray-500">
                  {t('videoGen.history.loadingMore')}
                </p>
              ) : null}
              {items.length === 0 && !generating ? (
                <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  {t('videoGen.promptPlaceholder')}
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
                    {renderListReferenceImages(item)}
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
                  {item.videoUrl ? (
                    <div className="mt-4 w-full max-w-md">
                      <VideoPlayer src={item.videoUrl} />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'mt-4 aspect-video w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br shadow-inner ring-1 ring-black/5 dark:ring-white/10',
                        item.previewClass ?? PLACEHOLDER_PREVIEW
                      )}
                    />
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleReEdit(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-primary dark:text-gray-200 dark:hover:bg-white/5"
                    >
                      {t('videoGen.action.reEdit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegenerate(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-primary dark:text-gray-200 dark:hover:bg-white/5"
                    >
                      {t('videoGen.action.regenerate')}
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
                        aria-label={t('videoGen.action.more')}
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
                                !item.videoUrl ||
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
                              {t('videoGen.action.download')}
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
                              {t('videoGen.action.delete')}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('videoGen.generating')}</p>
                <div
                  className={cn(
                    'mt-4 aspect-video w-full max-w-md animate-pulse overflow-hidden rounded-2xl bg-gradient-to-br',
                    PLACEHOLDER_PREVIEW
                  )}
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
              {isFirstLastFrameMode ? (
                <div className="flex shrink-0 items-center gap-2 self-start">
                  {renderFrameSlot('first', firstFrameInputId)}
                  <span
                    className="mb-5 flex shrink-0 items-center justify-center text-gray-300 dark:text-gray-600"
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="M8 7h12l-3-3" />
                      <path d="M16 17H4l3 3" />
                    </svg>
                  </span>
                  {renderFrameSlot('last', lastFrameInputId)}
                </div>
              ) : (
                <div className="shrink-0">
                  {renderUploadSlot({
                    inputId: fileInputId,
                    inputRef: fileInputRef,
                    asset: singleSlotAsset,
                    disabled: refImagesAtMax && !singleSlotAsset,
                    onFileChange: handleRefImagesFileChange,
                    onDrop: handleRefImagesDrop,
                    onRemove: singleSlotAsset
                      ? () => removeRefImage(singleSlotAsset.localId)
                      : undefined,
                  })}
                </div>
              )}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onPaste={handleRefImagesPaste}
                rows={3}
                placeholder={t('videoGen.promptPlaceholder')}
                className="min-h-[72px] w-full resize-none rounded-xl border-0 bg-transparent text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-white/90 dark:placeholder:text-gray-500"
              />
            </div>
            {!isFirstLastFrameMode ? (
              <p
                className={cn(
                  'mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500',
                  formContentIndent
                )}
              >
                {uploadHintText}
              </p>
            ) : null}
            {!isFirstLastFrameMode && maxRefImages > 1 && refImages.length > 0 ? (
              <ul className={cn('mt-2 flex flex-wrap gap-2', formContentIndent)}>
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
              <p
                className={cn(
                  'mt-1 text-[11px] text-red-600 dark:text-red-400',
                  formContentIndent
                )}
                role="alert"
              >
                {wsError}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <SelectMenu
                  ariaLabel={t('videoGen.label.model')}
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
                {showFrameMode ? (
                  <SelectMenu
                    ariaLabel={t('videoGen.label.frameMode')}
                    value={frameMode}
                    onChange={(v) => setFrameMode(v as VideoFrameUploadMode)}
                    options={frameModeOptions}
                    menuPlacement="above"
                    className="w-auto"
                    buttonClassName={cn(studioPillSelectButton, 'min-w-[5.25rem]')}
                    menuClassName="min-w-[8.5rem] max-w-[14rem]"
                  />
                ) : null}
                {showAspectRatio && aspectOptions ? (
                  <SelectMenu
                    ariaLabel={t('videoGen.label.aspect')}
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
                    ariaLabel={t('videoGen.label.quality')}
                    value={resolution}
                    onChange={setResolution}
                    options={resolutionOptions}
                    menuPlacement="above"
                    className="w-auto"
                    buttonClassName={cn(studioPillSelectButton, 'min-w-[5.25rem]')}
                    menuClassName="min-w-[8.5rem] max-w-[12rem]"
                  />
                ) : null}
                {showDuration && durationOptions ? (
                  <SelectMenu
                    ariaLabel={t('videoGen.label.duration')}
                    value={duration}
                    onChange={setDuration}
                    options={durationOptions}
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
                {generating ? t('videoGen.generating') : t('videoGen.generate')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('videoGen.action.deleteConfirm.title')}
        description={t('videoGen.action.deleteConfirm.description')}
        confirmText={t('videoGen.action.delete')}
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