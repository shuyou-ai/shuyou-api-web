'use client';

import { useEffect, type RefObject } from 'react';

/** 在 `open` 为 true 时，点击 `rootRef` 外部触发 `onOutside` */
export function useClickOutside(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onOutside: () => void
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node | null;
      if (target && root.contains(target)) return;
      onOutside();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onOutside, rootRef]);
}
