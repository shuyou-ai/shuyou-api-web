'use client';

import { cn } from '../../lib/utils';

type PropsType = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const MAX_PAGES_SHOWN = 6;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PropsType) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="text-[#344054] font-medium"
    >
      <ul className="flex items-center justify-center flex-wrap gap-2 dark:text-[#98A2B3]">
        <li>
          <button
            disabled={currentPage === 1}
            aria-label="Previous page"
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3.5 py-2 rounded-lg shadow-xs border border-[#D0D5DD] hover:bg-gray-200/50 dark:bg-[#1D2939] dark:hover:bg-[#1D2939]/50 dark:border-[#344054] disabled:opacity-50 disabled:pointer-events-none"
          >
            Previous
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, index) => {
          const isActive = currentPage === index + 1;

          if (totalPages > MAX_PAGES_SHOWN) {
            if (currentPage > 3) {
              if (index + 1 < currentPage) {
                return null;
              }

              if (index + 1 === currentPage + 3) {
                return (
                  <li key={index}>
                    <PaginationEllipsis />
                  </li>
                );
              }

              if (index + 1 < currentPage + 3 || index + 1 > totalPages - 2) {
                return (
                  <li key={index}>
                    <PaginationButton
                      page={index + 1}
                      isActive={isActive}
                      onPageChange={onPageChange}
                    />
                  </li>
                );
              }
            }

            if (index === 3) {
              return (
                <li key={index}>
                  <PaginationEllipsis />
                </li>
              );
            }

            /**
             * This logic ensures pagination buttons from 1-3 and the last 2 pages are visible
             * and the rest in the middle are hidden and replaced with and ellipsis.
             */
            if (index > 2 && index < totalPages - 2) {
              return null;
            }
          }

          return (
            <li key={index}>
              <PaginationButton
                page={index + 1}
                isActive={isActive}
                onPageChange={onPageChange}
              />
            </li>
          );
        })}

        <li>
          <button
            disabled={currentPage === totalPages}
            aria-label="Next page"
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3.5 py-2 rounded-lg shadow-xs border border-[#D0D5DD] hover:bg-gray-200/50 dark:bg-[#1D2939] dark:hover:bg-[#1D2939]/50 dark:border-[#344054] disabled:opacity-50 disabled:pointer-events-none"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

function PaginationButton({
  page,
  isActive,
  onPageChange,
}: {
  page: number;
  isActive: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <button
      aria-label={`Go to page ${page}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'size-10 rounded-lg shrink-0',
        isActive
          ? 'bg-primary-500 text-white'
          : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/80'
      )}
      onClick={() => onPageChange(page)}
    >
      {page}
    </button>
  );
}

function PaginationEllipsis() {
  return (
    <button className="size-10 rounded-lg shrink-0 hover:bg-gray-200/50 dark:hover:bg-gray-800/80 cursor-default">
      ...
    </button>
  );
}
