import { apiFetch } from '../api/client';
import type { AuthProfile } from './client';
import { setAuthProfileClient } from './client';

let inFlight: Promise<AuthProfile | null> | null = null;

export async function fetchAndCacheAuthProfileOnce(): Promise<AuthProfile | null> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await apiFetch('/auth/profile/get', { method: 'POST' });
      if (!res.ok) return null;
      const json = (await res.json()) as { code: number; data?: unknown };
      if (json.code !== 0 || !json.data) return null;
      const profile = json.data as AuthProfile;
      setAuthProfileClient(profile);
      return profile;
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

