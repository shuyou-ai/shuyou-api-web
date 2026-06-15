'use client';

import { useCallback, useEffect, useState } from 'react';

import { PencilIcon, PlusIcon, TrashIcon } from '../../icons/icons';
import { apiFetch } from '../../lib/api/client';
import CreateApiKeyModal from './create-api-key-modal';
import NewApiKeyModal from './new-api-key-modal';
import { toast } from 'sonner';
import EditApiKeyModal, {
  type EditApiKeyInitialValues,
} from './edit-api-key-modal';
import { ConfirmDialog } from '../ui/confirm-dialog';
import Link from 'next/link';

/** POST /user/api-key/page */
export type UserApiKeyPageQuery = {
  name: string;
};

export type UserApiKeyPageRequest = {
  order: string;
  pageNum: number;
  pageSize: number;
  query: UserApiKeyPageQuery;
  sort: string;
};

type ApiKeyRow = {
  id: string;
  name: string;
  /** e.g. email / userName to show under key */
  ownerLabel: string;
  /** 完整密钥，用于复制（若接口不返回则为空） */
  secret: string;
  /** 表格中展示的脱敏/截断文案 */
  displayKey: string;
  lastUsedText: string | null;
  usageLabel: string;
  group: string;
};

function pickStr(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return '';
}

function formatExpiresOrLastUsed(raw: unknown): string | null {
  if (raw == null || raw === '' || raw === false) return null;
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s || s === '0' || /^never$/i.test(s) || s === '-' || s === '永久')
      return null;
    const n = Number(s);
    if (Number.isFinite(n)) {
      if (n === 0) return null;
      const ms = n < 1e12 ? n * 1000 : n;
      return new Date(ms).toLocaleString();
    }
    return s;
  }
  if (typeof raw === 'number') {
    if (raw === 0) return null;
    const ms = raw < 1e12 ? raw * 1000 : raw;
    return new Date(ms).toLocaleString();
  }
  return String(raw);
}

function mapRecordToRow(item: Record<string, unknown>): ApiKeyRow {
  const id =
    pickStr(item, ['id', 'apiKeyId', 'keyId']) ||
    `row-${Math.random().toString(36).slice(2)}`;
  const name = pickStr(item, ['name', 'keyName', 'title']);
  const ownerLabel = pickStr(item, [
    'email',
    'userEmail',
    'user_name',
    'userName',
    'username',
    'owner',
    'ownerName',
  ]);
  const secret = pickStr(item, [
    'apiKey',
    'secretKey',
    'secret',
    'token',
    'apiSecret',
    'keyValue',
  ]);
  const masked = pickStr(item, [
    'maskedKey',
    'apiKeyMask',
    'maskKey',
    'displayKey',
    'maskedApiKey',
  ]);
  let displayKey = masked;
  if (!displayKey && secret.length > 12) {
    displayKey = `${secret.slice(0, 10)}...${secret.slice(-4)}`;
  } else if (!displayKey) {
    displayKey = secret || '—';
  }

  const lastUsedText = formatExpiresOrLastUsed(item.lastUsedTime);
  const usageLabel = pickStr(item, ['usage', 'usageLabel', 'usageDesc']);
  const group = pickStr(item, ['group']);

  return {
    id,
    name,
    ownerLabel,
    secret,
    displayKey,
    lastUsedText,
    usageLabel,
    group,
  };
}

function extractListAndTotal(data: unknown): {
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

function CopyKeyButton({ value }: { value: string }) {
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const disabled = !value;

  return (
    <button
      type="button"
      disabled={disabled}
      className="relative inline-flex items-center justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
      aria-label={copied ? 'Copied' : 'Copy'}
      onClick={async () => {
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          // ignore
        }
      }}
    >
      {copied ? (
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
          <rect x="8" y="8" width="12" height="12" rx="2" />
        </svg>
      )}
      {copied ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[11px] font-medium text-white">
          {'Copied'}
        </span>
      ) : null}
    </button>
  );
}

const DEFAULT_PAGE_SIZE = 20;

export default function ApiKeysPanel() {
  
  const [nameInput, setNameInput] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [rows, setRows] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [newKey, setNewKey] = useState<string>('');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<EditApiKeyInitialValues | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<ApiKeyRow | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedName(nameInput.trim()), 300);
    return () => window.clearTimeout(id);
  }, [nameInput]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body: UserApiKeyPageRequest = {
        order: 'desc',
        pageNum: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        sort: 'createTime',
        query: { name: debouncedName },
      };
      const res = await apiFetch('/user/api-key/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        code: number;
        msg?: string;
        data?: unknown;
      };
      if (json.code !== 0) throw new Error(json.msg || `code ${json.code}`);
      const { list } = extractListAndTotal(json.data);
      setRows(list.map((item) => mapRecordToRow(item)));
    } catch (e) {
      setError((e as Error).message || String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedName]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const empty = !loading && rows.length === 0;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
            {'API Keys'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {'Create and manage your API keys.'}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>{'Manage your keys to access all models'}</span>
          <span className="group relative inline-flex">
            <button
              type="button"
              aria-label={'Create, rotate, and revoke keys for your workspace.'}
              className="inline-flex size-4 items-center justify-center rounded-full border border-gray-200 text-[11px] text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
            >
              i
            </button>
            <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-[320px] rounded-xl border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-700 shadow-theme-lg group-hover:block group-focus-within:block dark:border-gray-700 dark:bg-dark-secondary dark:text-gray-200">
              <p>
                {'Apps can'}{' '}
                <span className="text-[#475CFF]">
                  {'create keys for you'}
                </span>
                {', or you can create them yourself.'}
              </p>
              <p className="mt-2">{'"Limit" tells you how many credits the key is allowed to use.'}</p>
              <p className="mt-2">
                {'To add credits to your account, go to the'}{' '}
                <Link
                  href="/account/billing"
                  className="pointer-events-auto text-[#475CFF] underline underline-offset-2"
                >
                  {'credits page'}
                </Link>
                {'.'}
              </p>
            </div>
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={'Filter by name…'}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#475CFF] dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90 sm:w-[220px]"
          />
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-lg bg-[#475CFF] px-5 text-sm font-medium text-white shadow-theme-xs hover:bg-[#3d50ea]"
          >
            <span className="inline-flex size-5 items-center justify-center [&_svg]:size-4">
              <PlusIcon/>
            </span>
            <span>{'Create'}</span>
          </button>
        </div>
      </div>

      <CreateApiKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async (apiKey) => {
          await fetchList();
          setNewKey(apiKey);
          setNewKeyOpen(true);
        }}
      />
      <EditApiKeyModal
        open={editOpen}
        initialValues={editing}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onUpdated={fetchList}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={'Delete API key'}
        description={
          deleteCandidate
            ? `${'Are you sure you want to delete “'}${
                deleteCandidate.name || deleteCandidate.displayKey
              }${'”? This action cannot be undone.'}`
            : 'This action cannot be undone.'
        }
        confirmText={'Delete'}
        cancelText={'Cancel'}
        variant="danger"
        loading={!!deletingId}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteCandidate(null);
        }}
        onConfirm={async () => {
          if (!deleteCandidate) return;
          if (deletingId) return;
          try {
            setDeletingId(deleteCandidate.id);
            const res = await apiFetch('/user/api-key/delete', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify([deleteCandidate.id]),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as {
              code: number;
              msg?: string;
            };
            if (json.code !== 0)
              throw new Error(json.msg || `code ${json.code}`);
            toast.success('Deleted');
            await fetchList();
            setDeleteConfirmOpen(false);
            setDeleteCandidate(null);
          } catch (e) {
            toast.error(`Delete failed: ${(e as Error).message || String(e)}`);
          } finally {
            setDeletingId(null);
          }
        }}
      />
      <NewApiKeyModal
        open={newKeyOpen}
        apiKey={newKey}
        onClose={() => {
          setNewKeyOpen(false);
          setNewKey('');
        }}
      />

      {error ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {'Failed to load API keys'}: {error}
        </p>
      ) : null}

      {loading ? (
        <div className="text-center rounded-xl bg-white p-8 text-sm text-gray-500 dark:border-gray-800 dark:bg-dark-secondary dark:text-gray-400">
          {'Loading…'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-dark-secondary">
        <table className="min-w-[800px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F9FAFB] text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-dark-secondary dark:text-gray-400">
              <th className="px-4 py-4">{'Name'}</th>
              <th className="px-4 py-4">{'API Key'}</th>
              <th className="px-4 py-4">{'Last Used'}</th>
              <th className="px-4 py-4">{'Usage'}</th>
              <th className="px-4 py-4">{'Group'}</th>
              <th className="w-10 px-4 py-3 text-right" aria-label={'Actions'} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {empty ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {'No API keys yet.'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="text-gray-800 dark:text-gray-200"
                >
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <span className="truncate font-medium text-gray-900 dark:text-white/90">
                        {row.name || '—'}
                      </span>
                      {row.ownerLabel ? (
                        <div className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                          {row.ownerLabel}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-900 dark:text-gray-400">
                      <span className="font-mono">{row.displayKey}</span>
                      <CopyKeyButton value={row.secret} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {row.lastUsedText == null
                      ? '-'
                      : row.lastUsedText}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {row.usageLabel || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {row.group || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/10 dark:hover:text-white/90"
                        aria-label="Edit"
                        title="Edit"
                        onClick={() => {
                          setEditing({
                            id: row.id,
                            name: row.name,
                            group: row.group,
                          });
                          setEditOpen(true);
                        }}
                      >
                        <PencilIcon className="size-5" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-white/10 dark:hover:text-red-400"
                        aria-label="Delete"
                        title="Delete"
                        disabled={deletingId === row.id}
                        onClick={async () => {
                          if (deletingId) return;
                          setDeleteCandidate(row);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <TrashIcon className="size-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      )}

    </div>
  );
}
