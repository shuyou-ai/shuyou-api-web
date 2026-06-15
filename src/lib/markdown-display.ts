const FENCE_LINE = /^(\s*)(`{3,}|~{3,})(.*)$/;

function isFenceLine(line: string): boolean {
  return FENCE_LINE.test(line);
}

/**
 * 渲染前去掉末尾未闭合的围栏代码块。
 */
export function stripIncompleteMarkdownFences(markdown: string): string {
  if (!markdown) return markdown;

  const lines = markdown.split('\n');
  let inFence = false;
  let fenceStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (!isFenceLine(line)) continue;
    if (!inFence) {
      inFence = true;
      fenceStart = i;
    } else {
      inFence = false;
      fenceStart = -1;
    }
  }

  if (!inFence || fenceStart < 0) return markdown;
  return lines.slice(0, fenceStart).join('\n').replace(/\n+$/, '');
}

/** 去掉正文中「已闭合但内容为空」的围栏块，避免渲染出深色空盒子 */
export function stripEmptyFencedCodeBlocks(markdown: string): string {
  if (!markdown) return markdown;

  const lines = markdown.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (!isFenceLine(line)) {
      out.push(line);
      i += 1;
      continue;
    }

    const openIndex = i;
    i += 1;
    const body: string[] = [];
    let closed = false;

    while (i < lines.length) {
      if (isFenceLine(lines[i] ?? '')) {
        closed = true;
        i += 1;
        break;
      }
      body.push(lines[i] ?? '');
      i += 1;
    }

    if (!closed) {
      out.push(...lines.slice(openIndex));
      break;
    }

    if (body.join('\n').trim()) {
      out.push(lines[openIndex] ?? '');
      out.push(...body);
      out.push(lines[i - 1] ?? '');
    }
  }

  return out.join('\n');
}

/** 助手回复 Markdown 渲染前的统一预处理 */
export function prepareMarkdownForDisplay(markdown: string): string {
  return stripEmptyFencedCodeBlocks(stripIncompleteMarkdownFences(markdown));
}
