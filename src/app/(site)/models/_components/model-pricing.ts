import type {
  ModelDisplayPricing,
  ModelItem,
  ModelPricingItem,
  ModelPricingTier,
} from '../types';

export function formatModelListPrice(usd: number): string {
  return (
    '$' +
    usd.toLocaleString('en-US', {
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    })
  );
}

function hasDisplayPricing(pricing: ModelDisplayPricing): boolean {
  if (pricing.videoTiers?.some((tier) => tier.price > 0)) return true;
  return Object.values(pricing).some(
    (value) => typeof value === 'number' && value > 0
  );
}

function buildVideoTierSuffix(tier: ModelPricingTier): string {
  const unitLabel =
    tier.unit_label?.trim() ||
    (tier.unit === 'perVideo' ? 'per video' : tier.unit?.trim()) ||
    'per video';
  const resolution = tier.items?.[0]?.trim();
  if (resolution) return `${resolution} · ${unitLabel}`;
  const label = tier.sku_label?.trim();
  if (label) return `${label} · ${unitLabel}`;
  return unitLabel;
}

function deriveDisplayPricingFromRaw(
  pricing?: ModelPricingItem
): ModelDisplayPricing | null {
  if (!pricing) return null;

  const derived: ModelDisplayPricing = {};

  if (pricing.prompt?.price) derived.prompt = pricing.prompt.price;
  if (pricing.completion?.price) derived.completion = pricing.completion.price;
  if (pricing.request_price?.price) derived.request = pricing.request_price.price;
  if (pricing.per_image?.price) derived.image = pricing.per_image.price;
  else if (pricing.per_image?.tiers?.[0]?.price) {
    derived.image = pricing.per_image.tiers[0].price;
  }
  if (pricing.per_second?.tiers?.[0]?.price) {
    derived.second = pricing.per_second.tiers[0].price;
  }

  const videoTiers = (pricing.per_video?.tiers ?? [])
    .filter((tier) => typeof tier.price === 'number' && tier.price > 0)
    .map((tier) => ({
      price: tier.price as number,
      suffix: buildVideoTierSuffix(tier),
    }));
  if (videoTiers.length > 0) {
    derived.videoTiers = videoTiers;
  } else if (
    typeof pricing.per_video?.price === 'number' &&
    pricing.per_video.price > 0
  ) {
    derived.videoTiers = [
      {
        price: pricing.per_video.price,
        suffix:
          pricing.per_video.unit_label?.trim() ||
          (pricing.per_video.unit === 'perVideo'
            ? 'per video'
            : pricing.per_video.unit?.trim()) ||
          'per video',
      },
    ];
  }

  return hasDisplayPricing(derived) ? derived : null;
}

export function getModelDisplayPricing(
  model: ModelItem
): ModelDisplayPricing | null {
  const fromDisplay = model.displayPricing?.[0];
  const fromRaw = deriveDisplayPricingFromRaw(model.pricing?.[0]);

  const merged: ModelDisplayPricing = {
    ...(fromRaw ?? {}),
    ...(fromDisplay ?? {}),
    request: fromDisplay?.request ?? fromRaw?.request,
    videoTiers: fromDisplay?.videoTiers?.length
      ? fromDisplay.videoTiers
      : fromRaw?.videoTiers,
  };

  return hasDisplayPricing(merged) ? merged : null;
}

export function formatDiscountOffPercent(discount: number): number | null {
  if (!Number.isFinite(discount) || discount === 0) return null;

  const payRatio = discount <= 1 ? discount : discount / 100;
  if (payRatio <= 0 || payRatio >= 1) return null;

  return Math.round((1 - payRatio) * 100);
}

export function getModelDiscount(model: ModelItem): number | null {
  const raw =
    model.pricing?.[0]?.discount != null
      ? model.pricing[0].discount
      : model.discount;
  if (raw == null || raw === 0) return null;

  return formatDiscountOffPercent(Number(raw));
}
