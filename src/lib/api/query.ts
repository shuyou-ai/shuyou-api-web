import { apiFetch } from './client';

export type QueryDataEnvelope<T> = {
  code: number;
  data?: T;
  msg?: string;
  message?: string;
};

export async function fetchQueryData<T>(
  type: string,
  body?: Record<string, unknown>
): Promise<T | null> {
  try {
    const res = await apiFetch(`/api/query/data/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? { type }),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as QueryDataEnvelope<T>;
    if (json.code !== 0 || json.data === undefined || json.data === null) {
      return null;
    }

    return json.data;
  } catch {
    return null;
  }
}
