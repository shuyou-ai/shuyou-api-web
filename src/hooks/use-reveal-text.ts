'use client';

import { useEffect, useRef, useState } from 'react';

export type RevealTextMode = 'char' | 'line' | 'paragraph';

type UseRevealTextOptions = {
  enabled: boolean;
  mode?: RevealTextMode;
  charsPerStep?: number;
  stepMs?: number;
  lineStepMs?: number;
  /** 段落模式：每段间隔（毫秒） */
  paragraphStepMs?: number;
  /** 进度回调最小间隔，避免滚底过于频繁 */
  progressThrottleMs?: number;
  onProgress?: () => void;
  onComplete?: () => void;
};

function splitDisplayLines(text: string): string[] {
  if (!text) return [];
  const parts = text.split('\n');
  return parts.map((line, index) =>
    index < parts.length - 1 ? `${line}\n` : line
  );
}

function splitParagraphs(text: string): string[] {
  if (!text.trim()) return [];
  const parts = text.split(/\n{2,}/);
  const chunks: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i] ?? '';
    chunks.push(chunk);
    if (i < parts.length - 1) chunks.push('\n\n');
  }
  return chunks;
}

function resolveCharRevealSpeed(length: number) {
  if (length <= 200) return { charsPerStep: 3, stepMs: 32 };
  if (length <= 800) return { charsPerStep: 6, stepMs: 28 };
  if (length <= 2500) return { charsPerStep: 12, stepMs: 24 };
  return { charsPerStep: 24, stepMs: 20 };
}

function emitProgressThrottled(
  onProgress: (() => void) | undefined,
  lastEmitAtRef: { current: number },
  throttleMs: number
) {
  if (!onProgress) return;
  const now = Date.now();
  if (now - lastEmitAtRef.current < throttleMs) return;
  lastEmitAtRef.current = now;
  onProgress();
}

/**
 * 渐进展示文本。默认按段落推进，减少 Markdown 频繁重排导致的闪烁。
 * 展示阶段建议用纯文本渲染，完成后再切换为 Markdown（见 AiResponse）。
 */
export function useRevealText(
  fullText: string,
  {
    enabled,
    mode = 'paragraph',
    charsPerStep,
    stepMs,
    lineStepMs = 100,
    paragraphStepMs = 140,
    progressThrottleMs = 280,
    onProgress,
    onComplete,
  }: UseRevealTextOptions
): string {
  const [revealed, setRevealed] = useState(enabled ? '' : fullText);
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);
  const lastProgressEmitRef = useRef(0);
  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled) {
      setRevealed(fullText);
      return;
    }

    setRevealed('');
    lastProgressEmitRef.current = 0;
    if (!fullText) {
      onCompleteRef.current?.();
      return;
    }

    const emitProgress = () =>
      emitProgressThrottled(onProgressRef.current, lastProgressEmitRef, progressThrottleMs);

    if (mode === 'paragraph') {
      const chunks = splitParagraphs(fullText);
      if (chunks.length <= 1) {
        setRevealed(fullText);
        emitProgress();
        requestAnimationFrame(() => onCompleteRef.current?.());
        return;
      }
      let index = 0;
      const timer = window.setInterval(() => {
        index += 1;
        setRevealed(chunks.slice(0, index).join(''));
        emitProgress();
        if (index >= chunks.length) {
          window.clearInterval(timer);
          requestAnimationFrame(() => onCompleteRef.current?.());
        }
      }, paragraphStepMs);
      return () => window.clearInterval(timer);
    }

    if (mode === 'line') {
      const lines = splitDisplayLines(fullText);
      let lineIndex = 0;
      const timer = window.setInterval(() => {
        lineIndex += 1;
        setRevealed(lines.slice(0, lineIndex).join(''));
        emitProgress();
        if (lineIndex >= lines.length) {
          window.clearInterval(timer);
          requestAnimationFrame(() => onCompleteRef.current?.());
        }
      }, lineStepMs);
      return () => window.clearInterval(timer);
    }

    const speed = resolveCharRevealSpeed(fullText.length);
    const step = charsPerStep ?? speed.charsPerStep;
    const interval = stepMs ?? speed.stepMs;
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(fullText.length, index + step);
      setRevealed(fullText.slice(0, index));
      emitProgress();
      if (index >= fullText.length) {
        window.clearInterval(timer);
        requestAnimationFrame(() => onCompleteRef.current?.());
      }
    }, interval);

    return () => window.clearInterval(timer);
  }, [
    fullText,
    enabled,
    mode,
    charsPerStep,
    stepMs,
    lineStepMs,
    paragraphStepMs,
    progressThrottleMs,
  ]);

  return enabled ? revealed : fullText;
}
