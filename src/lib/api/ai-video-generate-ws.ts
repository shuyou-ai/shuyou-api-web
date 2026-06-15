import { getApiBaseUrl } from './client';
import { getAccessTokenClient, isLoggedInClient } from '../auth/client';
import { formatUsdCost } from '../format-usd-cost';

/** 与后端约定的生视频 WebSocket 消息 */
export type AiGenerateVideoWsMessage = {
  type: 'ai_generate';
  model: string;
  function: 'video';
  params: {
    prompt: string;
    aspect_ratio?: string;
    resolution?: string;
    duration?: string;
    image_urls?: string[];
    first_frame_url?: string;
    last_frame_url?: string;
  };
};

/** 首尾帧上传模式（由模型 tags 决定可选项） */
export type VideoFrameUploadMode = 'first-frame' | 'first-last-frame';

function httpBaseToWsBase(httpUrl: string): string {
  return httpUrl.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:');
}

function appendSatokenQuery(url: string): string {
  if (typeof window === 'undefined' || !isLoggedInClient()) return url;
  const token = getAccessTokenClient();
  if (!token) return url;
  const u = new URL(url);
  u.searchParams.set('satoken', token);
  return u.toString();
}

/**
 * WebSocket 上游根地址。
 * 开发：`.env.local` 的 `API_BASE_URL` 经 next.config `env` 注入为 `NEXT_PUBLIC_WS_UPSTREAM`；
 * 生产：回退 `NEXT_PUBLIC_API_BASE_URL`。
 * 注意：浏览器 WS 不能依赖 Next `/websocket` rewrite（升级请求无法稳定代理）。
 */
function getWebSocketUpstreamBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_UPSTREAM?.replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  return getApiBaseUrl().replace(/\/+$/, '');
}

/**
 * 生视频 WebSocket 地址：`{upstream}/websocket`，登录时附带 `satoken` 查询参数。
 */
export function getAiVideoGenerateWebSocketUrl(): string {
  const wsBase = httpBaseToWsBase(getWebSocketUpstreamBase());
  return appendSatokenQuery(`${wsBase}/websocket`);
}

/** 长任务等待期间的心跳间隔（应小于网关/服务端空闲断开时间） */
export const AI_GENERATE_WS_HEARTBEAT_INTERVAL_MS = 25_000;

export function buildAiGenerateWsHeartbeatPayload(): string {
  return JSON.stringify({ type: 'ping' });
}

/** 识别服务端或网关心跳回包，避免当作业务消息解析 */
export function isAiGenerateWsHeartbeatPayload(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  if (lower === 'ping' || lower === 'pong' || lower === 'heartbeat') return true;
  try {
    const data = JSON.parse(trimmed) as { type?: unknown };
    if (typeof data.type !== 'string') return false;
    const type = data.type.trim().toLowerCase();
    return type === 'ping' || type === 'pong' || type === 'heartbeat';
  } catch {
    return false;
  }
}

export type AiGenerateWebSocketHeartbeat = {
  stop: () => void;
  /** 收到任意下行后调用，重置心跳发送节奏 */
  touch: () => void;
};

/**
 * WebSocket 已 OPEN 后启动周期性 ping，保持长连接直至任务结束。
 * 不设「无业务响应」超时，仅依赖连接 close / error 结束等待。
 */
export function createAiGenerateWebSocketHeartbeat(
  ws: WebSocket,
  intervalMs: number = AI_GENERATE_WS_HEARTBEAT_INTERVAL_MS
): AiGenerateWebSocketHeartbeat {
  let timer: ReturnType<typeof setInterval> | undefined;

  const sendPing = () => {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(buildAiGenerateWsHeartbeatPayload());
    } catch {
      /* ignore */
    }
  };

  const schedule = () => {
    if (timer) clearInterval(timer);
    sendPing();
    timer = setInterval(sendPing, intervalMs);
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  schedule();

  return { stop, touch: schedule };
}

export function buildAiVideoGenerateMessage(args: {
  model: string;
  prompt: string;
  aspectRatio?: string;
  resolution?: string;
  duration?: string;
  imageUrls: string[];
  frameMode?: VideoFrameUploadMode;
}): AiGenerateVideoWsMessage {
  const params: AiGenerateVideoWsMessage['params'] = {
    prompt: args.prompt,
  };
  if (args.frameMode === 'first-frame') {
    const first = args.imageUrls[0]?.trim();
    if (first) params.first_frame_url = first;
  } else if (args.frameMode === 'first-last-frame') {
    const first = args.imageUrls[0]?.trim();
    const last = args.imageUrls[1]?.trim();
    if (first) params.first_frame_url = first;
    if (last) params.last_frame_url = last;
  } else {
    params.image_urls = args.imageUrls;
  }
  if (args.aspectRatio) params.aspect_ratio = args.aspectRatio;
  if (args.resolution) params.resolution = args.resolution;
  if (args.duration) params.duration = args.duration;
  return {
    type: 'ai_generate',
    model: args.model,
    function: 'video',
    params,
  };
}

export type AiGenerateWsDataItem = {
  fileUrl?: string;
};

export type AiGenerateWsOutputItem = {
  type?: string;
  video?: string;
  url?: string;
  fileUrl?: string;
};

/** 下行 data 可能为旧版 dataList 或新版 task + output */
export type AiGenerateWsPayload = {
  id?: string;
  task_id?: string;
  task_status?: string;
  cost?: number | string;
  dataList?: AiGenerateWsDataItem[];
  output?: AiGenerateWsOutputItem[];
};

/** 标准 WebSocket 响应：`{ code, data, msg }` */
export type AiGenerateWsResponse = {
  code?: number;
  data?: AiGenerateWsPayload;
  cost?: number | string;
  msg?: string;
  message?: string;
};

export type AiGenerateWsHandleResult =
  | { kind: 'session'; sessionId: string }
  | { kind: 'success'; sessionId?: string; videoUrls: string[]; costUsd?: string }
  | { kind: 'error'; message: string; code?: number }
  | { kind: 'ignore' };

function isInsufficientBalanceError(data: AiGenerateWsResponse): boolean {
  const text = `${data.msg ?? ''} ${data.message ?? ''}`.toLowerCase();
  return (
    data.code === 500 &&
    (text.includes('insufficient balance') || text.includes('余额不足') || text.includes('please recharge'))
  );
}

export function parseAiGenerateWebSocketMessage(raw: string): AiGenerateWsResponse | null {
  try {
    const data = JSON.parse(raw) as AiGenerateWsResponse;
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

function readCostUsdFromWs(
  data: AiGenerateWsResponse,
  payload: AiGenerateWsPayload
): string | undefined {
  return formatUsdCost(data.cost) ?? formatUsdCost(payload.cost);
}

function readSessionId(payload: AiGenerateWsPayload): string | undefined {
  const id =
    (typeof payload.task_id === 'string' && payload.task_id.trim()) ||
    (typeof payload.id === 'string' && payload.id.trim()) ||
    '';
  return id || undefined;
}

function readVideoUrlsFromPayload(payload: AiGenerateWsPayload): string[] {
  const urls: string[] = [];

  if (Array.isArray(payload.dataList)) {
    for (const item of payload.dataList) {
      const u = typeof item?.fileUrl === 'string' ? item.fileUrl.trim() : '';
      if (u) urls.push(u);
    }
  }

  if (Array.isArray(payload.output)) {
    for (const item of payload.output) {
      const u =
        (typeof item?.video === 'string' && item.video.trim()) ||
        (typeof item?.url === 'string' && item.url.trim()) ||
        (typeof item?.fileUrl === 'string' && item.fileUrl.trim()) ||
        '';
      if (u) urls.push(u);
    }
  }

  return urls;
}

function normalizeTaskStatus(status: unknown): string {
  return typeof status === 'string' ? status.trim().toLowerCase() : '';
}

function isTaskTerminalFailure(status: string): boolean {
  return (
    status === 'failed' ||
    status === 'failure' ||
    status === 'error' ||
    status === 'cancelled' ||
    status === 'canceled'
  );
}

function isTaskInProgress(status: string): boolean {
  if (!status) return false;
  if (status === 'success' || status === 'succeeded' || status === 'completed') {
    return false;
  }
  if (isTaskTerminalFailure(status)) return false;
  return (
    status === 'pending' ||
    status === 'running' ||
    status === 'processing' ||
    status === 'queued' ||
    status === 'in_progress' ||
    status === 'submitted'
  );
}

/**
 * 解析生视频 WebSocket 下行消息。
 * 兼容旧版 `dataList[].fileUrl` 与新版 `task_status` + `output[].video`。
 */
export function handleAiGenerateWebSocketMessage(
  data: AiGenerateWsResponse,
  messages: {
    emptyDataList: string;
    noResultUrl: string;
    server500: string;
    insufficientBalance: string;
    generateFailed: string;
  }
): AiGenerateWsHandleResult {
  if (data.code === undefined) return { kind: 'ignore' };

  if (data.code !== 0) {
    if (isInsufficientBalanceError(data)) {
      return {
        kind: 'error',
        code: 500,
        message: messages.insufficientBalance,
      };
    }
    if (data.code === 500) {
      return {
        kind: 'error',
        code: 500,
        message: messages.server500,
      };
    }
    return {
      kind: 'error',
      code: data.code,
      message: data.msg || data.message || messages.generateFailed,
    };
  }

  if (!data.data || typeof data.data !== 'object') {
    return { kind: 'ignore' };
  }

  const payload = data.data;
  const sessionId = readSessionId(payload);
  const costUsd = readCostUsdFromWs(data, payload);
  const taskStatus = normalizeTaskStatus(payload.task_status);
  const videoUrls = readVideoUrlsFromPayload(payload);

  if (isTaskTerminalFailure(taskStatus)) {
    return {
      kind: 'error',
      message: data.msg || data.message || messages.generateFailed,
    };
  }

  const isSuccessStatus =
    taskStatus === 'success' ||
    taskStatus === 'succeeded' ||
    taskStatus === 'completed' ||
    taskStatus === 'done';

  if (isSuccessStatus || videoUrls.length > 0) {
    if (videoUrls.length === 0) {
      return { kind: 'error', message: messages.noResultUrl };
    }
    return { kind: 'success', sessionId, videoUrls, costUsd };
  }

  if (isTaskInProgress(taskStatus)) {
    return sessionId ? { kind: 'session', sessionId } : { kind: 'ignore' };
  }

  // 旧版：仅有 dataList
  if (Array.isArray(payload.dataList)) {
    if (payload.dataList.length === 0) {
      return { kind: 'error', message: messages.emptyDataList };
    }
    if (videoUrls.length === 0) {
      return { kind: 'error', message: messages.noResultUrl };
    }
    return { kind: 'success', sessionId, videoUrls, costUsd };
  }

  // 仅有 task_id、尚无结果
  if (sessionId) {
    return { kind: 'session', sessionId };
  }

  return { kind: 'ignore' };
}