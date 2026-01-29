export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
      <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-700/50 overflow-hidden p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border-l-4 border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-800/50 p-4 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-dark-700 rounded" />
                    <div className="h-4 w-16 bg-gray-200 dark:bg-dark-700 rounded-full" />
                  </div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-dark-700 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-dark-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
