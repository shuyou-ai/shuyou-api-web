function resolveFilenameFromUrl(url: string, fallback: string): string {
  try {
    const base = new URL(url).pathname.split('/').pop();
    if (base && base.includes('.')) return base;
  } catch {
    // ignore invalid URL
  }
  return fallback;
}

function triggerAnchorDownload(href: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** 从远程 URL 下载文件到本地（优先 blob，失败时回退直链） */
export async function downloadRemoteFile(
  url: string,
  fallbackFilename: string
): Promise<void> {
  const filename = resolveFilenameFromUrl(url, fallbackFilename);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      triggerAnchorDownload(objectUrl, filename);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
    return;
  } catch {
    triggerAnchorDownload(url, filename);
  }
}
