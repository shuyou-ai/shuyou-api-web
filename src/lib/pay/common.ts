/** 从 /pay/prepay 的 data 中取商户订单号 */
export function pickOutTradeNo(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const raw =
    o.outTradeNo ?? o.out_trade_no ?? o.mchOrderNo ?? o.orderNo;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return null;
}

export function amountToPrepayString(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '0';
  if (Number.isInteger(amount)) return String(amount);
  return String(Math.round(amount * 100) / 100);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
