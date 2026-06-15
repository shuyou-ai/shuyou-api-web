/**
 * POST 模型调用日志分页
 * 路径：`MODEL_LOG_PAGE_PATH`（默认 `/ai/model/log/page`，相对 NEXT_PUBLIC_API_BASE_URL）
 * @see 后端分页请求体
 */

/** 相对 API Base 的日志分页路径 */
export const MODEL_LOG_PAGE_PATH = '/ai/model/log/page';

export type ModelLogPageQuery = {
  apiKey: string;
  author: string;
  endDate: string;
  model: string;
  startDate: string;
};

export type ModelLogPageRequest = {
  order: string;
  pageNum: number;
  pageSize: number;
  query: ModelLogPageQuery;
  sort: string;
};

export const MODEL_LOG_PAGE_DEFAULT_SIZE = 20;

export function buildModelLogPageRequest(params: {
  rangeFrom: string;
  rangeTo: string;
  apiKey: string;
  model: string;
  provider: string;
  pageNum: number;
  pageSize?: number;
}): ModelLogPageRequest {
  let start = params.rangeFrom.trim();
  let end = params.rangeTo.trim();
  if (!start && !end) {
    const d = new Date();
    end = d.toISOString().slice(0, 10);
    const a = new Date(d);
    a.setDate(a.getDate() - 7);
    start = a.toISOString().slice(0, 10);
  } else if (!start) start = end;
  else if (!end) end = start;
  if (start > end) {
    const t = start;
    start = end;
    end = t;
  }

  const query: ModelLogPageQuery = {
    apiKey: params.apiKey.trim(),
    author: params.provider.trim(),
    model: params.model.trim(),
    startDate: `${start} 00:00:00`,
    endDate: `${end} 23:59:59`,
  };

  return {
    order: 'desc',
    pageNum: params.pageNum,
    pageSize: params.pageSize ?? MODEL_LOG_PAGE_DEFAULT_SIZE,
    sort: 'createTime',
    query,
  };
}

export function extractModelLogList(data: unknown): {
  list: Record<string, unknown>[];
  total: number;
} {
  if (!data || typeof data !== 'object')
    return { list: [], total: 0 };
  const d = data as Record<string, unknown>;
  const total = Number(d.total ?? d.totalRow ?? d.totalCount ?? 0) || 0;
  const raw = d.rows ?? d.records ?? d.list ?? d.data;
  const list = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  return { list, total };
}
