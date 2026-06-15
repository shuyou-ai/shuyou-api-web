'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ModelItem } from '../types';
import { getModelDiscount, getModelDisplayPricing } from './model-pricing';
import { ModelCardPricing, ModelCardTagIcons, ModelDiscountBadge } from './model-card-pricing';
import { ModelIdCopyButton } from './model-id-copy-button';
import { ModalityIconsRow } from './modality-icons-row';

type ModelCardProps = {
  model: ModelItem;
  copied: boolean;
  onCopyModelId: () => void;
};

export function ModelCard({ model, copied, onCopyModelId }: ModelCardProps) {
  const router = useRouter();
  const displayPricing = getModelDisplayPricing(model);
  const discount = getModelDiscount(model);
  const title = `${model.authorName ? `${model.authorName}: ` : ''}${model.name || '-'}`;
  const releaseDate = model.releaseDate?.split(' ')[0];
  const detailHref = model.id
    ? `/models/detail/${encodeURIComponent(model.id)}`
    : null;

  return (
    <li
      className="flex cursor-pointer flex-col border-b border-r border-[#F5F5F5] bg-white p-6 transition-colors hover:bg-gray-50/90 dark:border-gray-700 dark:bg-dark-primary dark:hover:bg-white/[0.03]"
      role={detailHref ? 'link' : undefined}
      tabIndex={detailHref ? 0 : undefined}
      onClick={(e) => {
        if (!detailHref) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest('button,a,input,textarea,select,summary')) return;
        router.push(detailHref);
      }}
      onKeyDown={(e) => {
        if (!detailHref) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        router.push(detailHref);
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-white/10 dark:text-white/80">
            {model.authorIcon ? (
              <Image
                src={model.authorIcon}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span aria-hidden>
                {(model.authorName || model.author || model.name || '?')
                  .trim()
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="min-w-0 truncate text-base font-semibold text-gray-900 dark:text-white">
                {title}
              </p>
              {model.displayTags?.includes('popular') ? (
                <Image
                  src="/images/model/hot.svg"
                  alt="popular"
                  width={20}
                  height={20}
                  className="size-5 shrink-0"
                />
              ) : null}
              {model.displayTags?.includes('newest') ? (
                <span className="shrink-0 rounded-sm bg-[#FF6164] px-1 py-1 text-[10px] leading-none text-white">
                  New
                </span>
              ) : null}
              {discount != null ? (
                <ModelDiscountBadge discount={discount} />
              ) : null}
            </div>

            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="mr-1 min-w-0 truncate">
                {model.modelId || model.authorName || model.author || '-'}
              </span>
              {model.modelId ? (
                <ModelIdCopyButton
                  modelId={model.modelId}
                  copied={copied}
                  onCopied={onCopyModelId}
                />
              ) : null}
            </p>
          </div>
        </div>
      </div>

      {displayPricing ? (
        <ModelCardPricing pricing={displayPricing} />
      ) : null}

      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-[#7D7D84] dark:text-gray-400">
        {model.description || '-'}
      </p>

      <div className="mt-auto rounded-xl text-xs text-gray-600 dark:text-gray-300">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 whitespace-nowrap font-medium text-gray-700 dark:text-gray-200">
              Input type:
            </span>
            <ModalityIconsRow
              active={new Set((model.inputModalities ?? []).map(String))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 whitespace-nowrap font-medium text-gray-700 dark:text-gray-200">
              Output Type:
            </span>
            <ModalityIconsRow
              active={new Set((model.outputModalities ?? []).map(String))}
            />
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Context:
            </span>
            <span className="text-gray-700 dark:text-gray-200">
              {model.displayContextLength || model.contextLength || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Max Output:
            </span>
            <span className="text-gray-700 dark:text-gray-200">
              {model.displayMaxCompletionTokens || '-'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-2 pt-2.5 sm:mt-3">
          <ModelCardTagIcons tags={model.displayTags ?? []} />
          <span className="flex h-[22px] items-center text-[11px] text-gray-400 dark:text-gray-500">
            {`by ${model.author || '-'}`}
            {releaseDate ? ` | ${releaseDate}` : ''}
          </span>
        </div>
      </div>
    </li>
  );
}
