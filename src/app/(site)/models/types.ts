export type FilterOption = {
  id: string;
  label: string;
  count: number;
};

export type FilterCategory = {
  id: string;
  title: string;
  defaultExpanded?: boolean;
  options: FilterOption[];
};

export type FilterCategoryId =
  | 'model-type'
  | 'provider'
  | 'token-group'
  | 'billing-type'
  | 'endpoint-type';

export type FilterSelections = Record<FilterCategoryId, string>;

export type ModelQueryConditionItem = {
  code: string;
  count: number;
  id: string;
  label: string;
  sort: number;
  value: string;
  parentId: string;
};

export type ModelQueryConditionsData = {
  model_groups: ModelQueryConditionItem[];
  model_provider: ModelQueryConditionItem[];
  model_type: ModelQueryConditionItem[];
  model_charge_type: ModelQueryConditionItem[];
  model_endpoints: ModelQueryConditionItem[];
};

export type ModelPageQuery = {
  /** 模型供应商 */
  author: string;
  /** 计费类型 */
  chargeType: string;
  /** 模型端点 */
  endpoint: string;
  /** 模型分组 */
  group: string;
  /** 模型名称 */
  name: string;
  /** 模型类型 */
  tag: string;
};

export type ModelPageRequest = {
  order: string;
  pageNum: number;
  pageSize: number;
  query: ModelPageQuery;
  sort: string;
};

export type ModelInputKind = 'text' | 'image' | 'file' | 'audio' | 'video';

export type ModelDisplayPricing = {
  prompt?: number;
  completion?: number;
  inputText?: number;
  outputImage?: number;
  image?: number;
  second?: number;
  search?: number;
  character?: number;
  request?: number;
  videoTiers?: Array<{ price: number; suffix: string }>;
};

export type ModelPricingSku = {
  sku_label?: string;
  price?: number;
  unit?: string;
  unitLabel?: string;
  unit_label?: string;
};

export type ModelPricingTier = {
  sku_label?: string;
  price?: number;
  unit?: string;
  unit_label?: string;
  criteria?: string;
  items?: string[];
  item?: string;
};

export type ModelPricingItem = {
  group?: string;
  discount?: number;
  prompt?: ModelPricingSku;
  completion?: ModelPricingSku;
  cache_read_input?: ModelPricingSku;
  input_cache_read?: ModelPricingSku;
  input_cache_write?: ModelPricingSku;
  per_image?: {
    price?: number;
    unit?: string;
    unit_label?: string;
    tiers?: ModelPricingTier[];
  };
  per_second?: {
    tiers?: ModelPricingTier[];
  };
  request_price?: ModelPricingSku;
  per_video?: {
    price?: number;
    unit?: string;
    unit_label?: string;
    tiers?: ModelPricingTier[];
  };
};

export type ModelProviderItem = {
  model: string;
  order: number;
  provider: string;
};

export type ModelItem = {
  id: string;
  modelId: string;
  name: string;
  slug: string;
  alias: string[];
  author: string;
  authorIcon: string;
  authorName: string;
  capabilities: string[];
  chargeTypes: string[];
  contextLength: string;
  coverUrl: string;
  description: string;
  discount: number;
  displayContextLength: string;
  displayMaxCompletionTokens: string;
  displayPricing: ModelDisplayPricing[];
  displaySupportedParameters: Record<string, unknown>;
  displayTags: string[];
  endpoints: string[];
  groups: string[];
  inputModalities: string[];
  maxCompletionTokens: string;
  outputModalities: string[];
  pricing: ModelPricingItem[];
  providers: ModelProviderItem[];
  releaseDate: string;
  runCount: number;
  schema: Record<string, unknown>;
  tags: string[];
};

export type ModelPageData = {
  rows: ModelItem[];
  total: string | number;
  pageNum?: number;
  pageSize?: number;
};

export const DEFAULT_FILTER_SELECTIONS: FilterSelections = {
  'model-type': 'all',
  provider: '',
  'token-group': '',
  'billing-type': '',
  'endpoint-type': '',
};

export const DEFAULT_MODEL_PAGE_REQUEST: Omit<ModelPageRequest, 'query'> = {
  order: '',
  pageNum: 1,
  pageSize: 20,
  sort: '',
};
