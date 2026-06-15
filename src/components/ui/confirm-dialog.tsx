'use client';

import { Modal } from './modal/modal';


export type ConfirmDialogVariant = 'default' | 'danger';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  loadingText,
  variant = 'default',
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  
  const finalConfirmText = confirmText ?? 'Confirm';
  const finalCancelText = cancelText ?? 'Cancel';
  const finalLoadingText = loadingText ?? 'Processing…';

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/20'
      : 'bg-[#475CFF] hover:bg-[#3d50ea] focus:ring-primary-500/20';

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (loading) return;
        onClose();
      }}
      title={title}
      description={description}
      className={{ modal: 'sm:w-[520px] p-5 sm:p-8' }}
    >
      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            if (loading) return;
            onClose();
          }}
          className="h-10 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-dark-secondary dark:text-gray-200 dark:hover:bg-white/5"
          disabled={loading}
        >
          {finalCancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            if (loading) return;
            void onConfirm();
          }}
          className={`h-10 rounded-xl px-6 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${confirmBtnClass}`}
          disabled={loading}
        >
          {loading ? finalLoadingText : finalConfirmText}
        </button>
      </div>
    </Modal>
  );
}

