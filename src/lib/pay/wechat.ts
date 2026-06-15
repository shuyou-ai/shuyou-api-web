import { apiFetch } from '../api/client';

export const WECHAT_JSAPI_SCENE = 'weixin-native';

export function amountToPrepayString(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '0';
  if (Number.isInteger(amount)) return String(amount);
  return String(Math.round(amount * 100) / 100);
}

type ApiEnvelope = { code: number; data?: unknown; msg?: string };

function readJson(res: Response): Promise<ApiEnvelope> {
  return res.json() as Promise<ApiEnvelope>;
}

/** 从 /pay/prepay 的 data 中取商户订单号 */
export function pickOutTradeNo(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const raw =
    o.outTradeNo ?? o.out_trade_no ?? o.mchOrderNo ?? o.orderNo;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return null;
}

/** Native 等场景：微信扫码链接 */
export function pickCodeUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const v = o.codeUrl ?? o.code_url;
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

/** 调起微信内 JSAPI 支付（需在公众号/小程序 WebView 等已注入 WeixinJSBridge 的环境） */
export function invokeWechatBrandWCPayRequest(
  params: Record<string, string>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const run = () => {
      const bridge = (
        window as unknown as { WeixinJSBridge?: { invoke: Function } }
      ).WeixinJSBridge;
      if (!bridge?.invoke) {
        reject(new Error('WeixinJSBridge unavailable'));
        return;
      }
      bridge.invoke(
        'getBrandWCPayRequest',
        params,
        (res: { err_msg?: string }) => {
          const msg = res?.err_msg || '';
          if (msg === 'get_brand_wcpay_request:ok') resolve();
          else if (msg === 'get_brand_wcpay_request:cancel')
            reject(new Error('cancel'));
          else reject(new Error(msg || 'wechat_pay_fail'));
        }
      );
    };

    if (
      typeof window !== 'undefined' &&
      (window as unknown as { WeixinJSBridge?: unknown }).WeixinJSBridge
    ) {
      run();
      return;
    }
    if (typeof document === 'undefined') {
      reject(new Error('WeixinJSBridge unavailable'));
      return;
    }
    document.addEventListener('WeixinJSBridgeReady', run, { once: true });
    setTimeout(() => {
      if (!(window as unknown as { WeixinJSBridge?: unknown }).WeixinJSBridge) {
        document.removeEventListener('WeixinJSBridgeReady', run);
        reject(new Error('WeixinJSBridge timeout'));
      }
    }, 4000);
  });
}

/** 从预下单 data 拼 JSAPI 参数（字段名兼容常见后端命名） */
export function buildJsapiPayParamsFromPrepayData(
  data: Record<string, unknown>
): Record<string, string> | null {
  const appId = data.appId ?? data.appid;
  const timeStamp = data.timeStamp ?? data.timestamp;
  const nonceStr = data.nonceStr ?? data.noncestr;
  const pkg = data.package ?? data.prepayId;
  const signType = data.signType ?? data.sign_type ?? 'RSA';
  const paySign = data.paySign ?? data.pay_sign;
  if (
    typeof appId !== 'string' ||
    !timeStamp ||
    typeof nonceStr !== 'string' ||
    typeof pkg !== 'string' ||
    typeof paySign !== 'string'
  ) {
    return null;
  }
  const packageStr = pkg.startsWith('prepay_id=')
    ? pkg
    : pkg.startsWith('wx')
      ? `prepay_id=${pkg}`
      : String(pkg);
  return {
    appId,
    timeStamp: String(timeStamp),
    nonceStr,
    package: packageStr,
    signType: String(signType),
    paySign,
  };
}

export type WechatOrderStatus = 'pending' | 'success' | 'failed';

/**
 * 解析 /pay/query-order 的支付状态。
 * 与微信支付查单一致：以 data.trade_state（或 tradeState）为准，例如 NOTPAY、SUCCESS。
 */
export function parseWechatQueryOrderStatus(data: unknown): WechatOrderStatus {
  if (!data || typeof data !== 'object') return 'pending';
  const o = data as Record<string, unknown>;
  const stateRaw = o.trade_state ?? o.tradeState;
  if (typeof stateRaw === 'string' && stateRaw.trim()) {
    const s = stateRaw.trim().toUpperCase();
    if (s === 'SUCCESS') return 'success';
    if (
      s === 'CLOSED' ||
      s === 'REVOKED' ||
      s === 'PAYERROR' ||
      s === 'REFUND' ||
      s === 'ABNORMAL'
    ) {
      return 'failed';
    }
    // NOTPAY、USERPAYING 等均为未终态，继续轮询
    return 'pending';
  }

  // 兼容非微信字段命名
  const legacy =
    o.status ?? o.orderStatus ?? o.order_status ?? o.payStatus ?? o.pay_status;
  if (typeof legacy === 'string') {
    const u = legacy.trim().toUpperCase();
    if (['SUCCESS', 'PAID'].includes(u)) return 'success';
    if (['CLOSED', 'FAIL', 'CANCEL'].some((k) => u.includes(k))) return 'failed';
  }
  if (o.paySuccess === true || o.paid === true) return 'success';
  return 'pending';
}

export async function wechatPrepay(amount: string): Promise<{
  outTradeNo: string;
  data: unknown;
}> {
  const res = await apiFetch('/pay/prepay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sceneCode: WECHAT_JSAPI_SCENE,
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

export async function wechatQueryOrder(outTradeNo: string): Promise<{
  status: WechatOrderStatus;
  raw: unknown;
}> {
  const res = await apiFetch('/pay/query-order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sceneCode: WECHAT_JSAPI_SCENE,
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
    status: parseWechatQueryOrderStatus(json.data),
    raw: json.data,
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
