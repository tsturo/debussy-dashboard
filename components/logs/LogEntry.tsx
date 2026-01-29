'use client';

import { LogEntry as LogEntryType } from '@/lib/types';
import { formatLogTimestamp, getLogLevelColor } from '@/lib/utils/logFilters';
import Link from 'next/link';

interface LogEntryProps {
  log: LogEntryType;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function LogEntry({ log, isExpanded, onToggle }: LogEntryProps) {
  const levelColor = getLogLevelColor(log.level);
  const levelBgColor = {
    debug: 'bg-gray-100 dark:bg-gray-800',
    info: 'bg-blue-100 dark:bg-blue-900/30',
    warn: 'bg-yellow-100 dark:bg-yellow-900/30',
    error: 'bg-red-100 dark:bg-red-900/30',
  }[log.level];

  const hasContext = log.context && Object.keys(log.context).length > 0;
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <div className={`rounded-lg p-3 border ${levelBgColor} border-gray-200 dark:border-dark-700 transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <span className={`text-xs font-bold uppercase ${levelColor}`}>
            {log.level}
          </span>
          <span className="text-xs text-gray-600 dark:text-dark-300">
            {log.agent}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-200">
            {log.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-dark-400">
            {formatLogTimestamp(log.timestamp, 'relative')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigator.clipboard.writeText(log.id)}
            className="text-xs text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200"
            title="Copy log ID"
          >
            Copy
          </button>
          {(hasContext || hasMetadata) && (
            <button
              onClick={onToggle}
              className="text-xs text-blue-600 dark:text-primary-400 hover:text-blue-800 dark:hover:text-primary-300"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-800 dark:text-dark-100">{log.message}</p>
      </div>

      {isExpanded && (hasContext || hasMetadata) && (
        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-dark-600 space-y-2">
          {hasContext && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-dark-300 mb-1">Context:</h4>
              <div className="text-xs bg-white dark:bg-dark-900 rounded p-2 space-y-1">
                {log.context?.bead_id && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-dark-400">Bead:</span>
                    <Link
                      href={`/task/${log.context.bead_id}`}
                      className="text-blue-600 dark:text-primary-400 hover:underline"
                    >
                      {log.context.bead_id}
                    </Link>
                  </div>
                )}
                {log.context?.message_id && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-dark-400">Message:</span>
                    <span className="text-gray-800 dark:text-dark-100">{log.context.message_id}</span>
                  </div>
                )}
                {log.context?.file_path && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-dark-400">File:</span>
                    <span className="text-gray-800 dark:text-dark-100 font-mono text-xs">
                      {log.context.file_path}
                      {log.context.line_number && `:${log.context.line_number}`}
                    </span>
                  </div>
                )}
                {log.context?.duration_ms && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-dark-400">Duration:</span>
                    <span className="text-gray-800 dark:text-dark-100">{log.context.duration_ms}ms</span>
                  </div>
                )}
                {Object.entries(log.context || {})
                  .filter(([key]) => !['bead_id', 'message_id', 'file_path', 'line_number', 'duration_ms'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-start space-x-2">
                      <span className="text-gray-600 dark:text-dark-400">{key}:</span>
                      <span className="text-gray-800 dark:text-dark-100 break-all">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {hasMetadata && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-dark-300 mb-1">Metadata:</h4>
              <div className="text-xs bg-white dark:bg-dark-900 rounded p-2 space-y-1">
                {log.metadata?.session_id && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-dark-400">Session:</span>
                    <span className="text-gray-800 dark:text-dark-100">{log.metadata.session_id}</span>
                  </div>
                )}
                {log.metadata?.correlation_id && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-dark-400">Correlation:</span>
                    <span className="text-gray-800 dark:text-dark-100">{log.metadata.correlation_id}</span>
                  </div>
                )}
                {log.metadata?.tags && log.metadata.tags.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-600 dark:text-dark-400">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {log.metadata.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-200 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
