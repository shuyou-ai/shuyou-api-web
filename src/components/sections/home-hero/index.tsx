import Link from 'next/link';
import { ApiEndpointBar } from './api-endpoint-bar';
import { CodeWatermarks } from './code-watermark';

const TRUST_ITEMS = [
  'No credit card',
  'Pay as you go',
  'Cancel anytime',
  '99.9% uptime',
] as const;

function CheckIcon() {
  return (
    <svg
      className="size-3.5 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        className="stroke-emerald-500/60"
        strokeWidth="1"
      />
      <path
        d="M5 8l2 2 4-4"
        className="stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CodeBracketIcon() {
  return (
    <svg
      className="size-4 shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 5L3 10l4 5M13 5l4 5-4 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 10h12m0 0l-4-4m4 4l-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomeHero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-[#f9f9f9] px-5 py-16 dark:bg-[#101828] sm:px-7">
      <CodeWatermarks />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <p className="mb-6 inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#737373] dark:text-emerald-400 sm:text-xs">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          One API. Every model. Production ready.
        </p>

        <h1 className="text-[3rem] font-bold font-mono leading-[1.15] tracking-tight text-gray-900 dark:text-white/95 sm:text-5xl sm:leading-[1.12] md:text-[4rem]">
          AI Model API Platform
          <br />
          for Production
        </h1>

        <p className="mx-auto mt-5 max-w-4xl text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:text-[17px]">
          Access leading LLM, image, and video models through one unified API.
          Compare pricing, read docs, and start building for production apps,
          agents, and workflows.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            href="/models"
            className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-600 px-6 text-md font-semibold text-white shadow-sm transition hover:brightness-105 sm:w-auto"
          >
            <CodeBracketIcon />
            Explore Models
            <ArrowIcon />
          </Link>
          <Link
            href="https://docs.shuyou.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-13 w-full items-center justify-center rounded-xl border border-[#4b5563]-900/15 bg-white px-6 text-md font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-white/20 dark:bg-transparent dark:text-white/90 dark:hover:bg-white/5 sm:w-auto"
          >
            Read Docs
          </Link>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 font-mono text-xs text-[#737373] dark:text-emerald-400/90"
            >
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>

        <ApiEndpointBar />
      </div>
    </section>
  );
}
