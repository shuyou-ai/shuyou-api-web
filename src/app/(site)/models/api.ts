import { apiFetch } from '../../../lib/api/client';
import { fetchQueryData } from '../../../lib/api/query';
import type {
  FilterCategory,
  FilterOption,
  FilterSelections,
  ModelPageData,
  ModelPageQuery,
  ModelPageRequest,
  ModelQueryConditionItem,
  ModelQueryConditionsData,
} from './types';
import { DEFAULT_MODEL_PAGE_REQUEST } from './types';

export const MODEL_QUERY_CONDITIONS_TYPE = 'model_query_conditions';

const CATEGORY_DEFINITIONS = [
  {
    id: 'model-type',
    title: 'Model Type',
    dataKey: 'model_type',
    defaultExpanded: true,
    withAllOption: true,
  },
  {
    id: 'provider',
    title: 'Provider',
    dataKey: 'model_provider',
  },
  {
    id: 'token-group',
    title: 'Token Group',
    dataKey: 'model_groups',
  },
  {
    id: 'billing-type',
    title: 'Billing Type',
    dataKey: 'model_charge_type',
  },
  {
    id: 'endpoint-type',
    title: 'Endpoint Type',
    dataKey: 'model_endpoints',
  },
] as const;

function normalizeOptions(items: ModelQueryConditionItem[]): FilterOption[] {
  return [...items]
    .sort((a, b) => a.sort - b.sort)
    .map((item) => ({
      id: item.value,
      label: item.label,
      count: item.count,
    }));
}

function getAllModelsCount(items: ModelQueryConditionItem[]): number {
  return items.reduce((sum, item) => sum + item.count, 0);
}

export function normalizeModelQueryConditions(
  data: ModelQueryConditionsData | null | undefined
): FilterCategory[] {
  if (!data) {
    return CATEGORY_DEFINITIONS.map((definition) => ({
      id: definition.id,
      title: definition.title,
      defaultExpanded: definition.defaultExpanded,
      options: [],
    }));
  }

  return CATEGORY_DEFINITIONS.map((definition) => {
    const items = data[definition.dataKey] ?? [];
    const options = normalizeOptions(items);

    if (definition.withAllOption) {
      options.unshift({
        id: 'all',
        label: 'All Models',
        count: getAllModelsCount(items),
      });
    }

    return {
      id: definition.id,
      title: definition.title,
      defaultExpanded: definition.defaultExpanded,
      options,
    };
  });
}

export async function fetchModelQueryConditions(): Promise<FilterCategory[]> {
  const data = await fetchQueryData<ModelQueryConditionsData>(
    MODEL_QUERY_CONDITIONS_TYPE,
    { type: MODEL_QUERY_CONDITIONS_TYPE }
  );

  return normalizeModelQueryConditions(data);
}

export function buildModelPageQuery(
  selections: FilterSelections,
  name = ''
): ModelPageQuery {
  const modelType = selections['model-type'];

  return {
    tag: !modelType || modelType === 'all' ? '' : modelType,
    author: selections.provider || '',
    group: selections['token-group'] || '',
    chargeType: selections['billing-type'] || '',
    endpoint: selections['endpoint-type'] || '',
    name: name.trim(),
  };
}

export function buildModelPageRequest(
  selections: FilterSelections,
  overrides?: Partial<ModelPageRequest>
): ModelPageRequest {
  const { query: queryOverrides, ...restOverrides } = overrides ?? {};

  return {
    ...DEFAULT_MODEL_PAGE_REQUEST,
    ...restOverrides,
    query: {
      ...buildModelPageQuery(selections, queryOverrides?.name ?? ''),
      ...queryOverrides,
    },
  };
}

export async function fetchModelPage(
  request: ModelPageRequest
): Promise<ModelPageData | null> {
  try {
    const res = await apiFetch('/api/model/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      code: number;
      data?: ModelPageData;
    };

    if (json.code !== 0 || !json.data) return null;

    return json.data;
  } catch {
    return null;
  }
}

export function getModelPageRecords(data: ModelPageData | null | undefined) {
  if (!data) return [];
  return data.rows ?? [];
}

export function getModelPageTotal(data: ModelPageData | null | undefined) {
  if (!data?.total) return 0;
  return Number(data.total) || 0;
}
