import { markLoggedOutClient } from './client';

/** 业务 JSON 中的未授权码（HTTP 可能仍为 200） */
export function isUnauthorizedApiCode(code: unknown): boolean {
  return code === 401 || code === '401';
}

export type ApiEnvelopeLike = {
  code?: unknown;
  msg?: string;
  message?: string;
};

let sessionExpiryHandling = false;

/**
 * Token 失效：清理本地登录态并跳转登录页（带 redirect 回跳）。
 * 多次并发 401 只处理一次。
 */
export function handleSessionExpiredClient(redirectPath?: string): void {
  if (typeof window === 'undefined') return;
  if (sessionExpiryHandling) return;
  sessionExpiryHandling = true;

  markLoggedOutClient();

  const path =
    redirectPath ??
    `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const signin = `/signin?redirect=${encodeURIComponent(path)}`;
  window.location.replace(signin);
}

/** 从已解析的接口 JSON 判断是否需要登出 */
export function handleUnauthorizedApiPayload(
  payload: ApiEnvelopeLike | null | undefined,
  redirectPath?: string
): boolean {
  if (!payload || !isUnauthorizedApiCode(payload.code)) return false;
  handleSessionExpiredClient(redirectPath);
  return true;
}
