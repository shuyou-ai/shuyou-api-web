import { apiFetch } from '../api/client';
import { amountToPrepayString, pickOutTradeNo, sleep } from './common';

export { amountToPrepayString, sleep };

export const STRIPE_SCENE = 'stripe';

type ApiEnvelope = { code: number; data?: unknown; msg?: string };

function readJson(res: Response): Promise<ApiEnvelope> {
  return res.json() as Promise<ApiEnvelope>;
}

export type StripeOrderStatus = 'pending' | 'success' | 'failed';

/** 从 /pay/prepay 的 data 中取 Stripe Checkout 跳转链接 */
export function pickCheckoutUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const v =
    o.checkoutUrl ??
    o.checkout_url ??
    o.url ??
    o.redirectUrl ??
    o.redirect_url ??
    o.payUrl ??
    o.pay_url ??
    o.sessionUrl ??
    o.session_url;
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

export function parseStripeQueryOrderStatus(data: unknown): StripeOrderStatus {
  if (!data || typeof data !== 'object') return 'pending';
  const o = data as Record<string, unknown>;
  const stateRaw = o.trade_state ?? o.tradeState ?? o.status ?? o.orderStatus;
  if (typeof stateRaw === 'string' && stateRaw.trim()) {
    const s = stateRaw.trim().toUpperCase();
    if (s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETE' || s === 'COMPLETED') {
      return 'success';
    }
    if (
      s === 'CLOSED' ||
      s === 'REVOKED' ||
      s === 'PAYERROR' ||
      s === 'REFUND' ||
      s === 'ABNORMAL' ||
      s === 'CANCELED' ||
      s === 'CANCELLED' ||
      s === 'FAILED' ||
      s === 'FAIL'
    ) {
      return 'failed';
    }
    return 'pending';
  }
  if (o.paySuccess === true || o.paid === true) return 'success';
  return 'pending';
}

export async function stripePrepay(amount: string): Promise<{
  outTradeNo: string;
  data: unknown;
}> {
  const res = await apiFetch('/pay/prepay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sceneCode: STRIPE_SCENE,
      amount,
    }),
  });
  const json = await readJson(res);
  if (!res.ok) {
    throw new Error(json.msg || `HTTP ${res.status}`);
  }
  if (json.code !== 0) {
    throw new Error(json.msg || `code ${json.code}`);
  }
  const out = pickOutTradeNo(json.data);
  if (!out) {
    throw new Error('missing outTradeNo');
  }
  return { outTradeNo: out, data: json.data };
}

export async function stripeQueryOrder(outTradeNo: string): Promise<{
  status: StripeOrderStatus;
  raw: unknown;
}> {
  const res = await apiFetch('/pay/query-order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sceneCode: STRIPE_SCENE,
      outTradeNo,
    }),
  });
  const json = await readJson(res);
  if (!res.ok) {
    throw new Error(json.msg || `HTTP ${res.status}`);
  }
  if (json.code !== 0) {
    throw new Error(json.msg || `code ${json.code}`);
  }
  return {
    status: parseStripeQueryOrderStatus(json.data),
    raw: json.data,
  };
}
