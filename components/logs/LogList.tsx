'use client';

import { LogEntry as LogEntryType } from '@/lib/types';
import { exportLogsToCSV, exportLogsToJSON } from '@/lib/utils/logFilters';
import LogEntry from './LogEntry';

interface LogListProps {
  logs: LogEntryType[];
  isLoading: boolean;
  expandedLogs: Set<string>;
  onToggleExpand: (logId: string) => void;
}

export default function LogList({
  logs,
  isLoading,
  expandedLogs,
  onToggleExpand,
}: LogListProps) {
  const handleExport = (format: 'csv' | 'json') => {
    const data = format === 'csv' ? exportLogsToCSV(logs) : exportLogsToJSON(logs);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-gray-200 dark:border-dark-700 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-dark-700 text-center">
        <p className="text-gray-500 dark:text-dark-300 text-lg">No logs found</p>
        <p className="text-gray-400 dark:text-dark-400 text-sm mt-2">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-dark-300">
          Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('csv')}
            className="text-xs bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-200 px-3 py-1.5 rounded border border-gray-300 dark:border-dark-600 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="text-xs bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-200 px-3 py-1.5 rounded border border-gray-300 dark:border-dark-600 transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <LogEntry
            key={log.id}
            log={log}
            isExpanded={expandedLogs.has(log.id)}
            onToggle={() => onToggleExpand(log.id)}
          />
        ))}
      </div>
    </div>
  );
}
