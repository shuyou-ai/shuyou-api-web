export function FilterSkeleton() {
  return (
    <aside className="w-full shrink-0 lg:w-[280px]">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-dark-secondary"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 flex-1 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
            </div>
            {index === 0 && (
              <div className="mt-3 space-y-2">
                {Array.from({ length: 4 }).map((__, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="h-8 animate-pulse rounded-lg bg-gray-100 dark:bg-white/5"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
