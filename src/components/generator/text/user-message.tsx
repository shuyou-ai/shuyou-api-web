'use client';

import { AutoGrowingTextArea } from '../../ui/inputs/textarea';
import { PencilIcon } from '../../../icons/icons';
import { cn } from '../../../lib/utils';
import { useState } from 'react';

type PropsType = {
  message: string;
  showActions?: boolean;
  onEdit: (
    newMessage: string,
    options?: { isSubmitting: boolean }
  ) => Promise<void>;
};

export default function UserMessage({
  message,
  showActions,
  onEdit,
}: PropsType) {
  const [showEditInput, setShowEditInput] = useState(false);
  const [value, setValue] = useState(message);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCancel() {
    setShowEditInput(false);
    setValue(message);
  }

  async function handleEdit() {
    setIsSubmitting(true);

    try {
      await onEdit(value, { isSubmitting });
    } catch (error) {
      console.error('Error while editing message:', error);
    } finally {
      setIsSubmitting(false);
      setShowEditInput(false);
    }
  }

  return (
    <div>
      <div
        className={cn(
          'shadow-theme-xs bg-primary-100 dark:bg-white/10 rounded-3xl rounded-tr-lg py-4 px-5 max-w-md ml-auto w-fit',
          showEditInput && 'max-w-none w-full'
        )}
      >
        {!showEditInput ? (
          message
        ) : (
          <AutoGrowingTextArea
            onChange={(value) => setValue(value)}
            value={value}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            autoFocus
          />
        )}
      </div>

      {showActions && !showEditInput && (
        <div className="mt-2 ml-auto max-w-fit">
          <button
            title="Edit message"
            onClick={() => setShowEditInput(true)}
            className="flex gap-1 items-center text-gray-400 hover:text-gray-800 dark:hover:text-white/90 dark:text-gray-400 dark:border-white/5 bg-white dark:bg-white/3 h-8 rounded-full px-3 py-1.5 border font-medium border-gray-100 text-xs"
          >
            <PencilIcon className="size-4.5" />

            <span className="sr-only">Edit message</span>
          </button>
        </div>
      )}

      {showEditInput && (
        <div className="flex justify-end gap-2 mt-3">
          <button
            className="hover:opacity-90 dark:text-gray-400 dark:border-[#344054] bg-white dark:bg-[#1D2939] rounded-full px-4.5 py-2 border font-medium text-[#344054] border-[#D0D5DD] text-sm disabled:pointer-events-none disabled:opacity-80 shadow-xs"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleEdit}
            className="bg-primary-500 rounded-full px-4.5 py-2 font-medium text-white hover:opacity-90 text-sm disabled:pointer-events-none disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}
