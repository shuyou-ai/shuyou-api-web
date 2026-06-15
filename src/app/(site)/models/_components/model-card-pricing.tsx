import Image from 'next/image';
import type { ModelDisplayPricing } from '../types';
import { formatModelListPrice } from './model-pricing';

function PricingItem({
  price,
  suffix,
}: {
  price: number;
  suffix: string;
}) {
  return (
    <span className="text-gray-700 dark:text-gray-300">
      <span className="font-semibold text-[#475CFF] dark:text-[#8B97FF]">
        {formatModelListPrice(price)}
      </span>
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
        {suffix}
      </span>
    </span>
  );
}

export function ModelDiscountBadge({ discount }: { discount: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-sm bg-[#2CCD82] px-1.5 py-1 text-[10px] font-semibold leading-none text-white dark:bg-emerald-600"
      title={`${discount}% off`}
    >
      {discount}% off
    </span>
  );
}

export function ModelCardPricing({ pricing }: { pricing: ModelDisplayPricing }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      {pricing.prompt != null && pricing.prompt > 0 ? (
        <PricingItem price={pricing.prompt} suffix="/M input tokens" />
      ) : null}
      {pricing.inputText != null && pricing.inputText > 0 ? (
        <PricingItem price={pricing.inputText} suffix="/M input text tokens" />
      ) : null}
      {pricing.completion != null && pricing.completion > 0 ? (
        <PricingItem price={pricing.completion} suffix="/M output tokens" />
      ) : null}
      {pricing.outputImage != null && pricing.outputImage > 0 ? (
        <PricingItem
          price={pricing.outputImage}
          suffix="/M output image tokens"
        />
      ) : null}
      {pricing.image != null && pricing.image > 0 ? (
        <PricingItem price={pricing.image} suffix="per image" />
      ) : null}
      {pricing.second != null && pricing.second > 0 ? (
        <PricingItem price={pricing.second} suffix="per second" />
      ) : null}
      {pricing.search != null && pricing.search > 0 ? (
        <PricingItem price={pricing.search} suffix="per search" />
      ) : null}
      {pricing.character != null && pricing.character > 0 ? (
        <PricingItem price={pricing.character} suffix="per character" />
      ) : null}
      {pricing.request != null && pricing.request > 0 ? (
        <PricingItem price={pricing.request} suffix="per request" />
      ) : null}
      {pricing.videoTiers?.map((tier, index) =>
        tier.price > 0 ? (
          <PricingItem
            key={`video-${index}-${tier.suffix}`}
            price={tier.price}
            suffix={tier.suffix}
          />
        ) : null
      )}
    </div>
  );
}

function getDisplayTagIcon(tag: string) {
  switch (tag) {
    case 'text':
      return '/images/model/text.svg';
    case 'image':
    case 'img':
      return '/images/model/img.svg';
    case 'video':
      return '/images/model/video.svg';
    case 'audio':
      return '/images/model/audio.svg';
    case 'embedding':
    case 'embeddings':
      return '/images/model/embeddings.svg';
    default:
      return null;
  }
}

export function ModelCardTagIcons({ tags }: { tags: string[] }) {
  const uniqueTags = Array.from(
    new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {uniqueTags.map((tag) => {
        const iconSrc = getDisplayTagIcon(tag);
        if (!iconSrc) return null;

        return (
          <Image
            key={tag}
            src={iconSrc}
            alt={tag}
            width={20}
            height={20}
            className="size-5 shrink-0"
          />
        );
      })}
    </div>
  );
}
