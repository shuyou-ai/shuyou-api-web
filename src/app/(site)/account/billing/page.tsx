'use client';


import { apiFetch } from '../../../../lib/api/client';
import { cn } from '../../../../lib/utils';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

/** /pay/wallet/get 的 data.balance（账户余额） */
function parseWalletBalance(data: unknown): number {
  if (!data || typeof data !== 'object') return 0;
  const v = (data as Record<string, unknown>).balance;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

const PAY_METHOD_ICONS = [
  { id: 'stripe' as const, src: '/assets/center/s.svg' },
];

const REDEEM_CODE_PURCHASE_URL = 'https://pay.ldxp.cn/shop/U5HQ2DXH';

type ExchangeCardRow = {
  id: string;
  quotaTime: string;
  cardNo: string;
  amountDisplay: string;
};

type ExchangeCardPageRequest = {
  order: string;
  pageNum: number;
  pageSize: number;
  query: { name: string };
  sort: string;
};

function toRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.list)) return o.list;
    if (Array.isArray(o.records)) return o.records;
    if (Array.isArray(o.rows)) return o.rows;
  }
  return [];
}

function pickStringCell(
  row: Record<string, unknown>,
  keys: string[],
  fallback = '—'
): string {
  for (const key of keys) {
    const v = row[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return fallback;
}

function toFiniteNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return null;
}

function RedeemGiftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 7h10v4H12V7zM2 7h8v4H2V7z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v11M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2M7 21h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 5c0 1.657 1.343 3 3 3s3-1.343 3-3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatQuotaAmount(quotaValue: unknown, quotaUnit: unknown): string {
  const value = toFiniteNumber(quotaValue);
  if (value === null) return '—';
  const unit = typeof quotaUnit === 'string' && quotaUnit.trim() ? quotaUnit.trim() : 'USD';
  if (unit === 'USD') return `$${value.toFixed(2)}`;
  return `${value} ${unit}`;
}

function normalizeExchangeCardRows(data: unknown): ExchangeCardRow[] {
  return toRows(data).map((row, idx) => {
    const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
    return {
      id: pickStringCell(r, ['id'], String(idx + 1)),
      quotaTime: pickStringCell(r, ['quotaTime']),
      cardNo: pickStringCell(r, ['cardNo']),
      amountDisplay: formatQuotaAmount(r.quotaValue, r.quotaUnit),
    };
  });
}

function parsePageTotal(data: unknown): number {
  if (!data || typeof data !== 'object') return 0;
  return toFiniteNumber((data as Record<string, unknown>).total) ?? 0;
}

const TRANSACTIONS_PAGE_SIZE = 10;

/**
 * 开发环境 React StrictMode 会触发双 mount，导致首屏请求可能重复发送。
 * 这里用模块级 in-flight promise 去重并发请求。
 */
let walletInFlightPromise: Promise<number> | null = null;

type BillingTab = 'recharge' | 'redeem';

const BILLING_TABS: { id: BillingTab; label: string }[] = [
  { id: 'recharge', label: 'Online Recharge' },
  { id: 'redeem', label: 'Redeem code' },
];

export default function AccountBillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>('redeem');

  const presets = useMemo(
    () =>
      [
        { amount: 10, credits: 1_000 },
        { amount: 50, credits: 5_000 },
        { amount: 100, credits: 10_000 },
        { amount: 150, credits: 15_000 },
        { amount: 300, credits: 30_000 },
      ] as const,
    []
  );

  const [selectedPreset, setSelectedPreset] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);
  const [payMethod, setPayMethod] = useState<'stripe'>('stripe');

  /** 自定义金额：仅正整数美元；$1 = 100 credits（与套餐一致） */
  const topUpAmount = useMemo(() => {
    if (!useCustom) return selectedPreset;
    if (!customAmount.trim()) return 0;
    const n = parseInt(customAmount, 10);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return n;
  }, [customAmount, selectedPreset, useCustom]);

  // 赠送规则：充值金额 > $1000 时奖励 5%；≤ $1000 无奖励
  const bonusAmount = useMemo(() => {
    if (topUpAmount > 1000) return Math.round(topUpAmount * 0.05 * 100) / 100;
    return 0;
  }, [topUpAmount]);

  const totalReceived = useMemo(
    () => Math.round((topUpAmount + bonusAmount) * 100) / 100,
    [bonusAmount, topUpAmount]
  );

  const canPay = topUpAmount > 0;

  const [walletLoading, setWalletLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(false);
  const [transactions, setTransactions] = useState<ExchangeCardRow[]>([]);
  const [transactionsPageNum, setTransactionsPageNum] = useState(1);
  const [transactionsTotal, setTransactionsTotal] = useState(0);

  const transactionsTotalPages = Math.max(
    1,
    Math.ceil(transactionsTotal / TRANSACTIONS_PAGE_SIZE)
  );

  const [redeemCode, setRedeemCode] = useState('');
  const [redeemBusy, setRedeemBusy] = useState(false);

  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      if (!walletInFlightPromise) {
        walletInFlightPromise = (async () => {
          const res = await apiFetch('/pay/wallet/get', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({}),
            cache: 'no-store',
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = (await res.json()) as {
            code: number;
            data?: unknown;
            msg?: string;
          };
          if (json.code !== 0) throw new Error(json.msg || 'API error');
          return parseWalletBalance(json.data);
        })().finally(() => {
          walletInFlightPromise = null;
        });
      }
      const balance = await walletInFlightPromise;
      setCurrentBalance(balance);
    } catch {
      setCurrentBalance(0);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (pageNum: number) => {
    setTransactionsLoading(true);
    setTransactionsError(false);
    try {
      const payload: ExchangeCardPageRequest = {
        pageNum,
        pageSize: TRANSACTIONS_PAGE_SIZE,
        sort: 'quotaTime',
        order: 'desc',
        query: { name: '' },
      };
      const res = await apiFetch('/pay/exchange-card/page', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        code: number;
        data?: unknown;
        msg?: string;
      };
      if (json.code !== 0) throw new Error(json.msg || 'API error');
      setTransactions(normalizeExchangeCardRows(json.data));
      setTransactionsTotal(parsePageTotal(json.data));
    } catch {
      setTransactions([]);
      setTransactionsTotal(0);
      setTransactionsError(true);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    void loadTransactions(transactionsPageNum);
  }, [loadTransactions, transactionsPageNum]);

  const handlePayClick = () => {
    if (!canPay) return;
    toast.info('Online payment is not available yet.');
  };

  const handlePurchaseRedeemCode = () => {
    window.open(REDEEM_CODE_PURCHASE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleRedeemSubmit = async () => {
    const cardNo = redeemCode.trim();
    if (!cardNo) {
      toast.error('Please enter a redemption code.');
      return;
    }
    if (redeemBusy) return;
    setRedeemBusy(true);
    try {
      const res = await apiFetch('/pay/exchange/quota', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cardNo }),
        cache: 'no-store',
      });
      const json = (await res.json()) as {
        code: number;
        msg?: string;
      };
      if (!res.ok) {
        throw new Error(json.msg || `HTTP ${res.status}`);
      }
      if (json.code !== 0) {
        throw new Error(json.msg || 'Redeem failed.');
      }
      toast.success('Redeemed successfully.');
      setRedeemCode('');
      await loadWallet();
      if (transactionsPageNum === 1) {
        await loadTransactions(1);
      } else {
        setTransactionsPageNum(1);
      }
    } catch (e) {
      toast.error((e as Error).message || 'Redeem failed.');
    } finally {
      setRedeemBusy(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
            {'Billing'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {'Manage payment details'}
          </p>
        </div>
      </div>

      <div
        className="mb-6 inline-flex w-full max-w-md gap-1 rounded-xl bg-[#F5F5F5] p-1 dark:bg-white/[0.08]"
        role="tablist"
        aria-label="Billing options"
      >
        {BILLING_TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
                selected
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-dark-secondary dark:text-white/90'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'recharge' ? (
      <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
        <div className="lg:col-span-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-dark-secondary">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
                {'Online Recharge'}
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {presets.map((p) => {
              const active = !useCustom && selectedPreset === p.amount;
              return (
                <button
                  key={p.amount}
                  type="button"
                  onClick={() => {
                    setUseCustom(false);
                    setSelectedPreset(p.amount);
                  }}
                  className={cn(
                    'group rounded-2xl border py-10 px-14 text-left transition-colors sm:px-10',
                    active
                      ? 'border-[#475CFF] bg-[#E7F3FF] shadow-[0_1px_0_0_rgba(71,92,255,0.06)] dark:border-primary-400/75 dark:bg-primary-500/[0.14] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                      : 'border-[#F9FAFC] bg-[#F9FAFC] hover:bg-gray-50 dark:border-gray-800 dark:bg-white/5 dark:hover:bg-white/[0.08]',
                  )}
                >
                  <div className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white/90">
                    ${p.amount}
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setUseCustom(true);
                setSelectedPreset(0);
              }}
              className={cn(
                'rounded-2xl border p-5 text-left transition-colors',
                useCustom
                  ? 'border-[#475CFF] bg-[#E7F3FF] shadow-[0_1px_0_0_rgba(71,92,255,0.06)] dark:border-primary-400/80 dark:bg-primary-500/[0.16] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]'
                  : 'border-[#F9FAFC] bg-[#F9FAFC] hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.05] dark:hover:bg-white/[0.09]',
              )}
            >
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white/90">
                  {'Custom Amount'}
                </div>

                <div className="mt-4">
                  <div className="relative">
                    <span
                      className={cn(
                        'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold transition-colors',
                        useCustom
                          ? 'text-[#475CFF]/90 dark:text-primary-300/95'
                          : 'text-gray-300 dark:text-gray-600',
                      )}
                    >
                      $
                    </span>
                    <input
                      value={customAmount}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setCustomAmount(digits);
                      }}
                      onFocus={() => setUseCustom(true)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder={'5000'}
                      className={cn(
                        'h-14 w-full rounded-2xl border pl-12 pr-4 text-2xl font-bold outline-none transition-[border-color,box-shadow,background-color]',
                        'border-gray-200 bg-white text-gray-900 placeholder:text-gray-300',
                        'focus:border-[#475CFF] focus:ring-2 focus:ring-[#475CFF]/20',
                        'dark:text-white/90 dark:placeholder:text-gray-500',
                        'dark:focus:border-primary-400 dark:focus:ring-primary-500/25',
                        useCustom
                          ? 'border-[#475CFF]/45 bg-white dark:border-primary-400/55 dark:bg-dark-secondary dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]'
                          : 'dark:border-gray-700 dark:bg-white/[0.06]',
                      )}
                    />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>
        </div>

        {/* 右侧：支付摘要 */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-dark-secondary lg:h-full">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[20px] font-extrabold text-gray-700 dark:text-gray-400">
              <span>{'Current Balance'}</span>
              <span className="font-semibold text-gray-900 dark:text-white/90 tabular-nums">
                {walletLoading ? (
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                ) : (
                  <>${(Math.round(currentBalance * 100) / 100).toFixed(2)}</>
                )}
              </span>
            </div>
            <div className="h-px bg-gray-100 dark:bg-gray-800 mt-5 mb-7" />
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{'Top-up Amount'}</span>
              <span className="font-semibold text-gray-900 dark:text-white/90">
                ${topUpAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-7 text-sm text-gray-500 dark:text-gray-400">
              <span>{'Bonus Amount'}</span>
              <span className="font-semibold text-red-500">
                ${bonusAmount.toFixed(2)}
              </span>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 mb-7" />

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white/90">
                {'Total Received'}
              </span>
              <span className="font-semibold text-red-500">
                ${totalReceived.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 max-lg:hidden" aria-hidden />

          <p className="mt-7 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            {'Online payment is not available yet.'}
          </p>

          <div className="mt-7 grid shrink-0 grid-cols-1 gap-2">
            {PAY_METHOD_ICONS.map((m) => {
              const active = payMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-xl border px-2 transition-colors',
                    active
                      ? 'border-[#475CFF] bg-[#475CFF]/10'
                      : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/5 dark:hover:bg-white/10',
                  )}
                  aria-pressed={active}
                  aria-label="Stripe"
                >
                  <Image
                    src={m.src}
                    alt=""
                    width={24}
                    height={24}
                    className={cn(
                      'h-6 w-auto max-w-full object-contain',
                      !active && 'opacity-75 dark:opacity-80',
                    )}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canPay}
            onClick={handlePayClick}
            className="mt-6 inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-[#475CFF] text-sm font-semibold text-white shadow-theme-xs hover:bg-[#3d50ea] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {`${'Pay'} $${topUpAmount.toFixed(2)}`}
          </button>

          <p className="mt-2 shrink-0 text-right text-sm text-gray-400 dark:text-gray-500">
            {'By proceeding you agree to our Terms of Service.'}
          </p>

          <button
            type="button"
            className="mt-3 inline-flex h-10 w-full shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-secondary dark:text-gray-200 dark:hover:bg-white/5"
          >
            {'Auto top up'}
          </button>
        </section>
      </div>
      ) : (
      <div className="max-w-2xl">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-dark-secondary">
          <div className="flex items-center justify-between text-[20px] font-extrabold text-gray-700 dark:text-gray-400">
            <span>{'Current Balance'}</span>
            <span className="font-semibold text-gray-900 dark:text-white/90 tabular-nums">
              {walletLoading ? (
                <span className="text-gray-400 dark:text-gray-500">—</span>
              ) : (
                <>${(Math.round(currentBalance * 100) / 100).toFixed(2)}</>
              )}
            </span>
          </div>

          <div className="mt-5 border-t border-gray-100 dark:border-gray-800" />

          <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
                {'Redeem code'}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {'Enter your redemption code to add credits to your account.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePurchaseRedeemCode}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-[#475CFF] bg-white px-4 text-sm font-semibold text-[#475CFF] transition-colors hover:bg-[#475CFF]/5 dark:border-primary-400/75 dark:bg-dark-secondary dark:text-primary-300 dark:hover:bg-primary-500/10"
            >
              {'Buy redemption code'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {'After purchase, return to this page and enter your code below.'}
          </p>

          <div className="mt-5">
            <div className="flex min-h-[52px] items-stretch gap-0 overflow-hidden rounded-full bg-[#F5F5F5] p-1.5 pl-3 dark:bg-white/[0.08]">
              <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
                <RedeemGiftIcon className="shrink-0 text-gray-400 dark:text-gray-500" />
                <input
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleRedeemSubmit();
                  }}
                  placeholder={'Enter redemption code'}
                  disabled={redeemBusy}
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60 dark:text-white/90 dark:placeholder:text-gray-500"
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                disabled={redeemBusy}
                onClick={() => void handleRedeemSubmit()}
                className="shrink-0 rounded-full bg-[#475CFF] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#3d50ea] disabled:cursor-not-allowed disabled:opacity-50 sm:px-7"
              >
                {redeemBusy
                  ? 'Redeeming…'
                  : 'Redeem credit'}
              </button>
            </div>
          </div>
        </section>
      </div>
      )}

      <div className="mt-10">
        <section className="rounded-2xl bg-white dark:border-gray-800 dark:bg-dark-secondary">
          <h2 className="text-base font-bold text-gray-900 dark:text-white/90">
            {'Recent Transactions'}
          </h2>

          {/*
            圆角处断线原因：overflow-hidden + 单元格四边 border 在直角处与圆角裁剪冲突。
            做法：外层画一整圈圆角边框；内层只画内线（右、下），最后一列去掉右边线、最后一行去掉底边，避免与外层双线。
          */}
          <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-secondary">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-separate border-spacing-0 text-sm [&_tbody_tr:last-child_td]:border-b-0">
                <thead>
                  <tr className="bg-gray-50 text-left dark:bg-white/[0.06]">
                    <th className="border-b border-r border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 last:border-r-0 dark:border-gray-700 dark:text-white/90">
                      {'Redemption Time'}
                    </th>
                    <th className="border-b border-r border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 last:border-r-0 dark:border-gray-700 dark:text-white/90">
                      {'Card No'}
                    </th>
                    <th className="border-b border-r border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 last:border-r-0 dark:border-gray-700 dark:text-white/90">
                      {'Amount'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsLoading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border-0 bg-white px-4 py-10 text-center text-gray-500 dark:bg-dark-secondary dark:text-gray-400"
                      >
                        {'Loading transactions…'}
                      </td>
                    </tr>
                  ) : transactionsError ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border-0 bg-white px-4 py-10 text-center text-red-500 dark:bg-dark-secondary dark:text-red-400"
                      >
                        {'Failed to load transactions.'}
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border-0 bg-white px-4 py-10 text-center text-gray-500 dark:bg-dark-secondary dark:text-gray-400"
                      >
                        {'No transactions yet.'}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((row) => (
                      <tr
                        key={row.id}
                        className="bg-white dark:bg-dark-secondary"
                      >
                        <td className="border-b border-r border-gray-200 px-4 py-3 text-gray-800 last:border-r-0 dark:border-gray-700 dark:text-gray-200">
                          {row.quotaTime}
                        </td>
                        <td className="border-b border-r border-gray-200 px-4 py-3 font-mono text-xs text-gray-800 last:border-r-0 dark:border-gray-700 dark:text-gray-200">
                          {row.cardNo}
                        </td>
                        <td className="border-b border-r border-gray-200 px-4 py-3 text-gray-800 last:border-r-0 dark:border-gray-700 dark:text-gray-200">
                          {row.amountDisplay}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!transactionsLoading && !transactionsError && transactionsTotal > 0 ? (
              <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {`${transactionsTotal} records · page ${transactionsPageNum} of ${transactionsTotalPages}`}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={transactionsPageNum <= 1}
                    onClick={() => setTransactionsPageNum((p) => p - 1)}
                    className={cn(
                      'h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:enabled:hover:bg-white/5'
                    )}
                  >
                    {'Previous'}
                  </button>
                  <button
                    type="button"
                    disabled={transactionsPageNum >= transactionsTotalPages}
                    onClick={() => setTransactionsPageNum((p) => p + 1)}
                    className={cn(
                      'h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:enabled:hover:bg-white/5'
                    )}
                  >
                    {'Next'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
