'use client';


import { cn } from '../../lib/utils';
import Image from 'next/image';
import QRCode from 'react-qr-code';

const CHANNEL_LOGOS = {
  wechat: '/assets/center/wechat.svg',
  alipay: '/assets/center/alipay.svg',
  stripe: '/assets/center/s.svg',
} as const;

export type WechatPayQrModalProps = {
  open: boolean;
  codeUrl: string;
  /** 展示的充值金额文案，例如「$100」 */
  amountLabel: string;
  onClose: () => void;
  /** 标题前展示的支付方式图标，默认微信 */
  channel?: keyof typeof CHANNEL_LOGOS;
};

export function WechatPayQrModal({
  open,
  codeUrl,
  amountLabel,
  onClose,
  channel = 'wechat',
}: WechatPayQrModalProps) {
  

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wechat-pay-qr-title"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className={cn(
          'relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-lg',
          'dark:border-gray-700 dark:bg-dark-secondary'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
          aria-label={'Close'}
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 pr-10">
          <Image
            src={CHANNEL_LOGOS[channel]}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 object-contain"
            aria-hidden
          />
          <h2
            id="wechat-pay-qr-title"
            className="text-lg font-semibold text-gray-900 dark:text-white/90"
          >
            {'WeChat Pay'}
          </h2>
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {'Top-up amount'}{' '}
          <span className="font-semibold text-gray-900 dark:text-white/90">
            {amountLabel}
          </span>
        </p>

        <div className="mt-6 flex justify-center rounded-xl bg-white p-3 dark:border-gray-700 dark:bg-white">
          <QRCode value={codeUrl} size={168} viewBox="0 0 256 256" />
        </div>

        <p className="mt-4 mb-4 text-center text-xs text-gray-500 dark:text-gray-400">
          {'Scan with WeChat to complete payment.'}
        </p>
      </div>
    </div>
  );
}
