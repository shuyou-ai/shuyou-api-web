import Link from 'next/link';
import type { ReactNode } from 'react';
import { ContactChannelIcon } from './contact-channel-icons';
import { AboutBaseUrlCopy } from './about-base-url-copy';

const HIGHLIGHTS = [
  {
    title: 'Built for Indie Devs',
    desc: 'Designed for solo developers and small teams. Get started quickly without heavy ops or infrastructure work.',
    accent: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    icon: (
      <path
        d="M12 3 4 7v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7l-8-4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Claude & Codex Ready',
    desc: 'Works with Claude Code, Codex, and other AI coding tools. Point your Base URL here and start building.',
    accent: 'from-[#475CFF]/15 to-[#475CFF]/0 text-[#475CFF] dark:text-[#8B97FF]',
    iconBg: 'bg-[#475CFF]/10 text-[#475CFF] dark:bg-[#475CFF]/15 dark:text-[#8B97FF]',
    icon: (
      <path
        d="M8 6h8M8 12h8M8 18h5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: 'Reliable Channels',
    desc: 'Capacity sourced from reverse proxy pools and third-party platforms, balancing uptime and cost.',
    accent: 'from-cyan-500/15 to-cyan-500/0 text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
    icon: (
      <path
        d="M4 12h4l2-3 4 6 2-3h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
] as const;

const ENDPOINTS = [
  '/v1/chat/completions',
  '/v1/responses',
  '/v1/messages',
  '/v1/embeddings',
  '/v1/predictions',
] as const;

const RECHARGE_SHOP_URL = 'https://pay.ldxp.cn/shop/U5HQ2DXH';

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
      {children}
    </p>
  );
}

function HighlightIcon({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex size-11 items-center justify-center rounded-2xl ${className}`}
    >
      <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
        {children}
      </svg>
    </span>
  );
}

export function AboutPage() {
  return (
    <main className="bg-[#f9f9f9] pb-24 dark:bg-[#101828]">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 sm:space-y-8 sm:py-12">
        <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-secondary sm:p-8">
          <SectionLabel>Integration</SectionLabel>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Base URL
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Set this as your API Base URL in Claude Code, Codex, or your own client.
          </p>
          <div className="mt-5">
            <AboutBaseUrlCopy />
          </div>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Supported endpoints
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ENDPOINTS.map((path) => (
                <span
                  key={path}
                  className="rounded-full border border-[#475CFF]/15 bg-[#475CFF]/[0.06] px-3 py-1.5 font-mono text-xs text-[#475CFF] dark:border-[#475CFF]/20 dark:bg-[#475CFF]/10 dark:text-[#8B97FF]"
                >
                  {path}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-secondary sm:p-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Contact
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Reach out if you need help getting set up or run into any issues.
            </p>
            <ul className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
              <li className="flex items-center gap-3 px-3 py-2.5">
                <ContactChannelIcon channel="email" />
                <span className="w-20 shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500">
                  Email
                </span>
                <a
                  href="mailto:support@shuyou.ai"
                  className="min-w-0 flex-1 text-sm font-semibold text-gray-900 transition hover:text-[#475CFF] dark:text-white dark:hover:text-[#8B97FF]"
                >
                  support@shuyou.ai
                </a>
              </li>
              <li className="flex items-center gap-3 px-3 py-2.5">
                <ContactChannelIcon channel="wechat" />
                <span className="w-20 shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500">
                  WeChat
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-white">
                  dm18626260603
                </span>
              </li>
              <li className="flex items-center gap-3 px-3 py-2.5">
                <ContactChannelIcon channel="qq" />
                <span className="w-20 shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500">
                  QQ
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-white">
                  1219191915
                </span>
              </li>
            </ul>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-cyan-50/50 p-6 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/[0.08] dark:via-dark-secondary dark:to-cyan-500/[0.06] sm:p-8">
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-emerald-400/20 blur-2xl dark:bg-emerald-500/10" />
            <div className="relative">
              <SectionLabel>Billing</SectionLabel>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Recharge Store
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Purchase redemption codes or top up your account at our official store.
                After payment, redeem your code on the Billing page in the console.
              </p>
              <Link
                href={RECHARGE_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                Visit Recharge Store
                <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M4 10h12m0 0-4-4m4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <p className="mt-4 break-all rounded-lg bg-white/60 px-3 py-2 font-mono text-xs text-gray-500 ring-1 ring-emerald-200/60 dark:bg-black/20 dark:text-gray-400 dark:ring-emerald-500/15">
                {RECHARGE_SHOP_URL}
              </p>
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-dark-secondary dark:shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-[#475CFF]" />
          <div className="p-6 sm:p-8">
            <SectionLabel>Overview</SectionLabel>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              One platform for every AI API call
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <p className="leading-7 text-gray-600 dark:text-gray-300">
                This platform is an API aggregation service built for developers,
                especially individual builders and side projects. It integrates
                with Claude Code, Codex, and other AI coding tools — just set your
                Base URL to this platform to get started.
              </p>
              <p className="leading-7 text-gray-600 dark:text-gray-300">
                Capacity is sourced through reverse proxy pools and third-party
                platforms, balancing reliability and cost to deliver a practical,
                easy-to-use AI API experience for everyday development.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-dark-secondary dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${item.accent}`}
              />
              <div className="relative">
                <HighlightIcon className={item.iconBg}>{item.icon}</HighlightIcon>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
