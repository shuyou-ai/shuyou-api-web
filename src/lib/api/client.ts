import { getAccessTokenClient, isLoggedInClient } from '../auth/client';
import {
  handleSessionExpiredClient,
  handleUnauthorizedApiPayload,
  type ApiEnvelopeLike,
} from '../auth/session';

export function getApiBaseUrl() {
  // 与 next.config.ts 中 API_BASE_URL 默认上游一致（含 /backend 前缀）
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://coder.shuyou.ai/backend';
}

function normalizeApiPath(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${p}`;
}

async function interceptUnauthorizedResponse(res: Response): Promise<void> {
  if (typeof window === 'undefined') return;

  if (res.status === 401) {
    handleSessionExpiredClient();
    return;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return;

  try {
    const json = (await res.clone().json()) as ApiEnvelopeLike;
    handleUnauthorizedApiPayload(json);
  } catch {
    // 非 JSON 或解析失败则忽略
  }
}

export async function apiFetch(path: string, init?: RequestInit) {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const p = normalizeApiPath(path);
  const headers = new Headers(init?.headers);
  // 仅在客户端自动加 token
  if (typeof window !== 'undefined' && isLoggedInClient()) {
    const token = getAccessTokenClient();
    if (token && !headers.has('satoken')) {
      headers.set('satoken', `${token}`);
    }
  }
  const res = await fetch(`${base}${p}`, { ...init, headers });
  await interceptUnauthorizedResponse(res);
  return res;
}
