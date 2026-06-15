/** 解析接口 `cost` 等字段为数字（美元） */
export function parseCostValue(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim().replace(/^\$/, '');
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** 格式化为美元展示，如 `$0.01` */
export function formatUsdCost(raw: unknown): string | undefined {
  const amount = parseCostValue(raw);
  if (amount === undefined) return undefined;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: amount < 0.01 ? 6 : 4,
  }).format(amount);
}

/** 从分页/历史记录行读取花费（美元） */
export function readCostUsdFromRecord(
  item: Record<string, unknown>
): string | undefined {
  return (
    formatUsdCost(item.cost) ??
    formatUsdCost(item.costUsd) ??
    formatUsdCost(item.totalCostUsd)
  );
}
