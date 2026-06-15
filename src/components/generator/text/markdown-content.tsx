'use client';

import { prepareMarkdownForDisplay } from '../../../lib/markdown-display';
import { cn } from '../../../lib/utils';
import type { ComponentPropsWithoutRef } from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 模型常输出 `###标题`（`#` 与正文之间无空格）。CommonMark 要求 ATX 标题在 `#` 后必须有空格，
 * 否则整段会当普通文本显示。仅在「非围栏代码块」内、且行首缩进 ≤3 格时修复（与 CM 标题规则一致，减少误伤缩进代码块）。
 */
function normalizeLooseAtxHeadings(markdown: string): string {
  const lines = markdown.split('\n');
  const fenceStart = /^(\s*)(`{3,}|~{3,})/;
  let inFence = false;
  const atxFix = /^(\s{0,3})(#{1,6})(?=[^\s#])/;

  return lines
    .map((line) => {
      if (fenceStart.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(atxFix, '$1$2 ');
    })
    .join('\n');
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
  const langLabel = (language || 'text').toUpperCase();

  if (!code.trim()) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl bg-[#0b1220] p-2 dark:bg-[#0a1120]">
      <div className="overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-2.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-gray-300">
            {langLabel}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <pre className="m-0 overflow-x-hidden rounded-none bg-[#0f172a] p-4 text-[13px] leading-7 text-gray-100 whitespace-pre-wrap break-words">
          <code className="bg-transparent">{code}</code>
        </pre>
      </div>
    </div>
  );
}

const MARKDOWN_PROSE_SHARED =
  'prose prose-sm max-w-none prose-pre:my-0 prose-pre:rounded-none prose-pre:border-0 prose-pre:bg-transparent prose-pre:p-0 prose-code:font-mono prose-code:text-[13px] prose-code:before:content-[\'\'] prose-code:after:content-[\'\'] prose-table:block prose-table:w-full prose-table:overflow-x-auto prose-th:bg-gray-100 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold dark:prose-th:bg-white/10 prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-gray-200 dark:prose-td:border-white/10';

export function markdownProseAssistantClassName() {
  return cn(
    MARKDOWN_PROSE_SHARED,
    'text-gray-800 dark:prose-invert dark:text-white/90'
  );
}

export function markdownProseReasoningClassName() {
  return cn(
    MARKDOWN_PROSE_SHARED,
    'text-gray-600 dark:prose-invert dark:text-white/75'
  );
}

function buildMarkdownComponents(showCodeBlocks: boolean) {
  return {
    /** 避免外层 pre + 内层 CodeBlock 双层深色容器；CodeBlock 为 null 时不留空 pre */
    pre({ children }: ComponentPropsWithoutRef<'pre'>) {
      return <>{children}</>;
    },
    code({
      className,
      children,
      ...props
    }: ComponentPropsWithoutRef<'code'> & { className?: string }) {
      const text = String(children ?? '');
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="rounded bg-gray-100 px-1.5 py-0.5 text-[13px] text-gray-800 dark:bg-white/10 dark:text-gray-100"
            {...props}
          >
            {text}
          </code>
        );
      }
      if (!showCodeBlocks) {
        return (
          <code
            className="block whitespace-pre-wrap break-words font-sans text-[15px] leading-7 text-gray-800 dark:text-white/90"
            {...props}
          >
            {text.replace(/\n$/, '')}
          </code>
        );
      }
      const lang = className?.replace('language-', '').trim();
      return <CodeBlock code={text.replace(/\n$/, '')} language={lang} />;
    },
  };
}

type MarkdownContentProps = {
  source: string;
  proseClassName?: string;
  showCodeBlocks?: boolean;
};

export function MarkdownContent({
  source,
  proseClassName = markdownProseAssistantClassName(),
  showCodeBlocks = true,
}: MarkdownContentProps) {
  const normalized = normalizeLooseAtxHeadings(prepareMarkdownForDisplay(source));
  const components = buildMarkdownComponents(showCodeBlocks);
  return (
    <div className={proseClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
