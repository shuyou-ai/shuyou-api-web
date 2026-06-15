import { cn } from '../../../lib/utils';

type ContactChannel = 'email' | 'wechat' | 'qq';

const CHANNEL_STYLES: Record<
  ContactChannel,
  { wrap: string; icon: string }
> = {
  email: {
    wrap: 'bg-blue-500/10 ring-blue-500/15 dark:bg-blue-500/15 dark:ring-blue-400/20',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  wechat: {
    wrap: 'bg-[#07C160]/10 ring-[#07C160]/20 dark:bg-[#07C160]/15 dark:ring-[#07C160]/25',
    icon: 'text-[#07C160] dark:text-[#34D399]',
  },
  qq: {
    wrap: 'bg-sky-500/10 ring-sky-500/15 dark:bg-sky-500/15 dark:ring-sky-400/20',
    icon: 'text-sky-500 dark:text-sky-400',
  },
};

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m5 8 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.2 5.5c-3 0-5.4 2-5.4 4.5 0 1.4.8 2.7 2.1 3.5l-.5 2.2 2.4-1.2c.7.2 1.4.3 2.1.3.3 0 .6 0 .9-.1-.3-.8-.4-1.6-.4-2.5 0-3.2 3-5.8 6.7-5.8.4 0 .8 0 1.1.1C16.8 4.8 12.7 5.5 8.2 5.5Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M11.8 10.8c0 3.2 3 5.8 6.7 5.8.7 0 1.4-.1 2.1-.3l2.4 1.2-.5-2.2c1.3-.8 2.1-2.1 2.1-3.5 0-3.2-3.1-5.8-6.8-5.8s-6.7 2.6-6.7 5.8Z"
        fill="currentColor"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="9.2" cy="9.8" r="0.75" fill="currentColor" />
      <circle cx="12.1" cy="9.8" r="0.75" fill="currentColor" />
      <circle cx="14.8" cy="14.8" r="0.75" fill="currentColor" />
      <circle cx="17.7" cy="14.8" r="0.75" fill="currentColor" />
      <circle cx="20.6" cy="14.8" r="0.75" fill="currentColor" />
    </svg>
  );
}

function QqIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse
        cx="12"
        cy="13.5"
        rx="7.5"
        ry="6.5"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="9.5" r="4.2" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9.2 9.1c.4-.9 1.4-1.4 2.8-1.4s2.4.5 2.8 1.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="10.4" cy="9.8" r="0.85" fill="currentColor" />
      <circle cx="13.6" cy="9.8" r="0.85" fill="currentColor" />
      <path
        d="M11.1 11.4c.6.35 1.2.35 1.8 0"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M8.2 18.2 7 21M15.8 18.2 17 21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS = {
  email: EmailIcon,
  wechat: WeChatIcon,
  qq: QqIcon,
} as const;

export function ContactChannelIcon({ channel }: { channel: ContactChannel }) {
  const Icon = ICONS[channel];
  const styles = CHANNEL_STYLES[channel];

  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl ring-1',
        styles.wrap
      )}
    >
      <Icon className={cn('size-[18px]', styles.icon)} />
    </span>
  );
}
