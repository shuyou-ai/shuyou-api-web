export const AUTH_TOKEN_KEY = 'auth.token';
export const AUTH_TOKEN_EXPIRES_AT_KEY = 'auth.token.expiresAtMs';
export const AUTH_USER_ID_KEY = 'auth.userId';
export const AUTH_PROFILE_KEY = 'auth.profile';

export const AUTH_CHANGED_EVENT = 'auth:changed';

function emitAuthChanged() {
  try {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  } catch {
    // ignore
  }
}

function base64UrlDecode(input: string): string {
  const pad = '='.repeat((4 - (input.length % 4)) % 4);
  const b64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/');
  // atob 仅在浏览器可用；本文件只在 client-side 调用
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(b64), (c: string) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );
}

export function getUserNameFromAccessTokenClient(): string | null {
  try {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = JSON.parse(base64UrlDecode(payload)) as Record<string, unknown>;
    const name =
      (json.user_name as string | undefined) ||
      (json.userName as string | undefined) ||
      (json.name as string | undefined);
    return name || null;
  } catch {
    return null;
  }
}

export function getAccessTokenClient(): string | null {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessTokenClient(token: string, expireTimeSeconds?: number | string) {
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (expireTimeSeconds != null) {
      const s = Number(expireTimeSeconds);
      if (Number.isFinite(s) && s > 0) {
        const expiresAt = Date.now() + s * 1000;
        window.localStorage.setItem(AUTH_TOKEN_EXPIRES_AT_KEY, String(expiresAt));
      }
    }
  } catch {
    // ignore
  }
  emitAuthChanged();
}

export function setUserIdClient(userId?: string) {
  if (!userId) return;
  try {
    window.localStorage.setItem(AUTH_USER_ID_KEY, userId);
  } catch {
    // ignore
  }
  emitAuthChanged();
}

export function isLoggedInClient(): boolean {
  try {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;

    const expiresAtRaw = window.localStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY);
    if (!expiresAtRaw) return true; // 没有过期信息则按“已登录”处理

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt)) return true;

    if (Date.now() >= expiresAt) {
      // 过期自动清理
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_TOKEN_EXPIRES_AT_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function markLoggedOutClient() {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_EXPIRES_AT_KEY);
    window.localStorage.removeItem(AUTH_USER_ID_KEY);
    window.localStorage.removeItem(AUTH_PROFILE_KEY);
  } catch {
    // ignore
  }
  emitAuthChanged();
}

export function markLoggedInClient() {
  emitAuthChanged();
}

export type AuthProfile = {
  userName?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  userId?: string;
};

export function setAuthProfileClient(profile: AuthProfile) {
  try {
    window.localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
  emitAuthChanged();
}

export function getAuthProfileClient(): AuthProfile | null {
  try {
    const raw = window.localStorage.getItem(AUTH_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthProfile;
  } catch {
    return null;
  }
}

