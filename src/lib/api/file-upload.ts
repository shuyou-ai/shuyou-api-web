import { apiFetch, getApiBaseUrl } from './client';

export type UploadImageFileResult = {
  id: string;
  /** 可写入 `image_urls` 的访问地址 */
  url: string;
};

function resolveUploadedFileUri(candidate: string): string {
  const s = candidate.trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) return `${getApiBaseUrl().replace(/\/+$/, '')}${s}`;
  return s;
}

/**
 * `POST /sys/file/upload`
 * 成功条件：`data.id` 存在；否则视为失败并抛出错误（由调用方 toast）。
 */
export async function uploadImageFile(file: File): Promise<UploadImageFileResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiFetch('/sys/file/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    code?: number;
    data?: {
      id?: string;
      url?: string;
      uri?: string;
      fileUrl?: string;
      file_url?: string;
    };
    msg?: string;
  };

  if (json?.code !== undefined && json.code !== 0) {
    throw new Error(json?.msg || 'upload failed');
  }

  const d = json?.data;
  const id = typeof d?.id === 'string' ? d.id.trim() : '';
  if (!id) {
    throw new Error(json?.msg || 'upload failed');
  }

  const fileUrl =
    (typeof d?.fileUrl === 'string' && d.fileUrl.trim()) ||
    (typeof d?.file_url === 'string' && d.file_url.trim()) ||
    '';
  if (fileUrl) {
    return { id, url: resolveUploadedFileUri(fileUrl) };
  }

  const fromApi =
    (typeof d?.url === 'string' && d.url.trim()) ||
    (typeof d?.uri === 'string' && d.uri.trim()) ||
    '';
  if (fromApi) {
    return { id, url: resolveUploadedFileUri(fromApi) };
  }

  if (/^https?:\/\//i.test(id)) {
    return { id, url: id };
  }

  const base = getApiBaseUrl().replace(/\/+$/, '');
  return { id, url: `${base}/sys/file/${encodeURIComponent(id)}` };
}
