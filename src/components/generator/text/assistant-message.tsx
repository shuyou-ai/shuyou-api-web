'use client';

import { useI18n } from '../../../lib/studio-text';
import { useRevealText } from '../../../hooks/use-reveal-text';
import { useState } from 'react';
import AiResponse from './ai-response';
import { MarkdownContent, markdownProseReasoningClassName } from './markdown-content';

export type AssistantMessageProps = {
  messageId: string;
  reasoning: string;
  answer: string;
  modelLabel?: string;
  modelAuthorIcon?: string | null;
  animateAnswer?: boolean;
  onRevealComplete?: () => void;
  onRevealProgress?: () => void;
};

/** 去掉开头的 Thinking 耗时前缀，保留正文 */
export function stripThinkingDuration(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const withoutDuration = trimmed.replace(
    /^\s*Thinking(?:\s+Deeply)?\s+\d+(?:\.\d+)?s\s*/i,
    ''
  );
  const withoutLabel = withoutDuration.replace(/^\s*Thinking(?:\s+Deeply)?\s*/i, '');
  return withoutLabel.trim();
}

export function AssistantMessage({
  reasoning,
  answer,
  modelLabel,
  modelAuthorIcon,
  animateAnswer = false,
  onRevealComplete,
  onRevealProgress,
}: AssistantMessageProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const displayAnswer = useRevealText(answer, {
    enabled: animateAnswer,
    mode: 'paragraph',
    paragraphStepMs: 140,
    progressThrottleMs: 300,
    onProgress: expanded ? undefined : onRevealProgress,
    onComplete: () => {
      requestAnimationFrame(() => onRevealComplete?.());
    },
  });
  const hasAnswer = Boolean(displayAnswer?.trim() || answer?.trim());
  const cleanedReasoning = stripThinkingDuration(reasoning);
  const hasReasoning = Boolean(cleanedReasoning);

  const modelFallback = t('generator.message.modelFallback');
  const iconFallback = modelLabel
    ? modelLabel.slice(0, 1).toUpperCase()
    : modelFallback.slice(0, 1).toUpperCase();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
          {modelAuthorIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={modelAuthorIcon}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span>{iconFallback}</span>
          )}
        </div>
        <div className="min-w-0 truncate text-sm font-medium text-gray-900 dark:text-white/90">
          {modelLabel || modelFallback}
        </div>
      </div>

      {hasReasoning ? (
        <div className="mb-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="inline-flex items-center gap-2 rounded-md px-1 py-0.5 text-sm text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-expanded={expanded}
          >
            <span className="text-sm leading-none">☼</span>
            <span className="font-medium">{t('generator.message.thinkingTitle')}</span>
            <svg
              className={`size-4 shrink-0 transition ${expanded ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>

          {expanded ? (
            <div className="mt-2 border-l-2 border-gray-200 pl-3 dark:border-gray-700">
              <MarkdownContent
                source={cleanedReasoning}
                proseClassName={markdownProseReasoningClassName()}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {hasAnswer ? (
        <AiResponse response={displayAnswer} copyText={answer} />
      ) : null}
    </div>
  );
}
