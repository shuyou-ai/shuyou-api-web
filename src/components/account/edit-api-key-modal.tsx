'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/modal/modal';

import { apiFetch } from '../../lib/api/client';
import { toast } from 'sonner';
import { SelectMenu, type SelectMenuOption } from '../ui/select-menu';
import { InfoIcon } from '../../icons/icons';

type DictItem = {
  id: string;
  label: string;
  value: string;
  sort?: number;
};

export type EditApiKeyInitialValues = {
  id: string;
  name: string;
  group: string;
};

type UpdateApiKeyRequest = {
  id: string;
  name: string;
  group?: string;
};

function FieldHelp({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="relative inline-flex items-center">
      <span className="group relative inline-flex">
        <button
          type="button"
          aria-label={label}
          className="ml-1 inline-flex size-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:hover:bg-white/10 dark:hover:text-gray-200"
        >
          <InfoIcon className="size-4" />
        </button>
        <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-[320px] rounded-xl border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-700 shadow-theme-lg group-hover:block group-focus-within:block dark:border-gray-700 dark:bg-dark-secondary dark:text-gray-200">
          {children}
        </div>
      </span>
    </span>
  );
}

export default function EditApiKeyModal({
  open,
  onClose,
  initialValues,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  initialValues: EditApiKeyInitialValues | null;
  onUpdated: () => void | Promise<void>;
}) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [groupOptions, setGroupOptions] = useState<DictItem[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSubmitting(false);
    setName(initialValues?.name ?? '');
    setGroup(initialValues?.group ?? '');
  }, [initialValues, open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setGroupLoading(true);
    setGroupError(null);
    (async () => {
      try {
        const res = await apiFetch('/api/query/data/model_groups', {
          method: 'POST',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          code: number;
          msg?: string;
          data?: Array<{
            id: string;
            label: string;
            value: string;
            sort?: number;
          }>;
        };
        if (json.code !== 0) throw new Error(json.msg || `code ${json.code}`);
        const list = (json.data ?? [])
          .map((x) => ({
            id: String(x.id),
            label: String(x.label ?? ''),
            value: String(x.value ?? ''),
            sort: typeof x.sort === 'number' ? x.sort : Number(x.sort),
          }))
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
        setGroupOptions(list);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setGroupError((e as Error).message || String(e));
        setGroupOptions([]);
      } finally {
        setGroupLoading(false);
      }
    })();

    return () => controller.abort();
  }, [open]);

  const canSubmit =
    (initialValues?.id ?? '').trim().length > 0 &&
    name.trim().length > 0 &&
    !submitting;

  const groupSelectOptions: SelectMenuOption[] = useMemo(() => {
    const none: SelectMenuOption = { value: '', label: 'None' };
    if (groupLoading || groupError) return [none];
    return [
      none,
      ...groupOptions.map((x) => ({
        value: x.value,
        label: x.label,
      })),
    ];
  }, [groupError, groupLoading, groupOptions]);

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (submitting) return;
        onClose();
      }}
      title={'Edit API key'}
      description={''}
      className={{
        modal: 'sm:w-[560px] p-5 sm:p-8 overflow-visible',
      }}
    >
      <form
        className="mt-6 grid gap-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSubmit || !initialValues) return;
          setSubmitting(true);
          try {
            const body: UpdateApiKeyRequest = {
              id: initialValues.id,
              name: name.trim(),
            };
            const groupValue = group.trim();
            if (groupValue) body.group = groupValue;

            const res = await apiFetch('/user/api-key/update', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as { code: number; msg?: string };
            if (json.code !== 0) throw new Error(json.msg || `code ${json.code}`);
            toast.success('Saved');
            await onUpdated();
            onClose();
          } catch (err) {
            toast.error(
              `Save failed: ${(err as Error).message || String(err)}`
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="grid gap-2">
          <label className="flex items-center text-sm font-medium text-gray-900 dark:text-white/90">
            {'Name'}
            <FieldHelp label={'Name help'}>
              {'Choose a clear and descriptive name.'}
            </FieldHelp>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={'e.g. "Chatbot Key"'}
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-100/60 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#475CFF] dark:border-gray-700 dark:bg-white/5 dark:text-white/90"
          />
        </div>

        <div className="grid gap-2">
          <label className="flex items-center text-sm font-medium text-gray-900 dark:text-white/90">
            {'Group'}
            <FieldHelp label={'Group help'}>
              {'Optionally restrict this API key to a model group. Leave as None for no restriction.'}
            </FieldHelp>
          </label>
          <SelectMenu
            value={group}
            options={groupSelectOptions}
            onChange={setGroup}
            menuPlacement="above"
            placeholder={
              groupLoading
                ? 'Loading…'
                : groupError
                  ? 'Failed to load options'
                  : 'Select a group (optional)'
            }
            ariaLabel={'Group'}
            buttonClassName="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90 dark:hover:bg-white/5"
            menuClassName="rounded-xl dark:bg-dark-secondary"
          />
          {groupError ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {'Failed to load options'}: {groupError}
            </p>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (submitting) return;
              onClose();
            }}
            className="h-10 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-secondary dark:text-gray-200 dark:hover:bg-white/5"
          >
            {'Cancel'}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-10 rounded-xl bg-[#475CFF] px-6 text-sm font-medium text-white hover:bg-[#3d50ea] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? 'Saving…'
              : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
