export function AgentStatusSkeleton() {
  return (
    <div className="relative overflow-hidden bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-700/50 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-dark-700 rounded-full" />
          <div>
            <div className="h-5 w-24 bg-gray-200 dark:bg-dark-700 rounded mb-2" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-dark-700 rounded" />
          </div>
        </div>
        <div className="w-10 h-7 bg-gray-200 dark:bg-dark-700 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-px bg-gray-200 dark:bg-dark-700" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-dark-700 rounded" />
        <div className="h-10 bg-gray-200 dark:bg-dark-700 rounded" />
      </div>
    </div>
  );
}
