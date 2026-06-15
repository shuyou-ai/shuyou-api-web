'use client';

/**
 * 基于 react-day-picker v9 的区间日历面板（不含触发器与弹层定位）。
 * @see https://daypicker.dev
 */

import { DayPicker } from 'react-day-picker';
import type { DateRange, DayPickerLocale } from 'react-day-picker';
import 'react-day-picker/style.css';
import './day-picker-range-panel.css';
import type { CSSProperties } from 'react';
import { cn } from '../../../lib/utils';

const ACCENT_STYLE = {
  '--rdp-accent-color': '#475CFF',
  '--rdp-accent-background-color': '#475CFF',
} as CSSProperties & Record<string, string>;

export type DayPickerRangePanelProps = {
  /** 当前选中的区间 */
  selected?: DateRange;
  /** 选择变化（含清空） */
  onSelect?: (range: DateRange | undefined) => void;
  /** 与 date-fns 兼容的 DayPicker locale */
  locale?: Partial<DayPickerLocale>;
  /** 初始展示的月份（未传则用选中起点或今天） */
  defaultMonth?: Date;
  /** 并排展示的月数，日志等场景常用 2 */
  numberOfMonths?: number;
  /** 一周起始日，默认周一 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
};

export function DayPickerRangePanel({
  selected,
  onSelect,
  locale,
  defaultMonth,
  numberOfMonths = 2,
  weekStartsOn = 1,
  className,
}: DayPickerRangePanelProps) {
  const month =
    defaultMonth ?? selected?.from ?? selected?.to ?? new Date();

  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      defaultMonth={month}
      numberOfMonths={numberOfMonths}
      weekStartsOn={weekStartsOn}
      locale={locale}
      className={cn('day-picker-range-panel m-0', className)}
      style={ACCENT_STYLE}
    />
  );
}
