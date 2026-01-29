import { LogEntry, LogFilters, LogLevel } from '../types';

export function filterLogs(logs: LogEntry[], filters: LogFilters): LogEntry[] {
  let filtered = logs;

  if (filters.level) {
    const levels = Array.isArray(filters.level) ? filters.level : [filters.level];
    filtered = filtered.filter((log) => levels.includes(log.level));
  }

  if (filters.category) {
    const categories = Array.isArray(filters.category)
      ? filters.category
      : [filters.category];
    filtered = filtered.filter((log) => categories.includes(log.category));
  }

  if (filters.from) {
    const fromDate = new Date(filters.from);
    filtered = filtered.filter((log) => new Date(log.timestamp) >= fromDate);
  }

  if (filters.to) {
    const toDate = new Date(filters.to);
    filtered = filtered.filter((log) => new Date(log.timestamp) <= toDate);
  }

  if (filters.search) {
    filtered = searchLogs(filtered, filters.search);
  }

  return filtered;
}

export function searchLogs(logs: LogEntry[], query: string): LogEntry[] {
  const lowerQuery = query.toLowerCase();
  return logs.filter((log) => {
    const messageMatch = log.message.toLowerCase().includes(lowerQuery);
    const agentMatch = log.agent.toLowerCase().includes(lowerQuery);
    const contextMatch =
      log.context &&
      Object.values(log.context).some(
        (value) =>
          typeof value === 'string' && value.toLowerCase().includes(lowerQuery)
      );
    return messageMatch || agentMatch || contextMatch;
  });
}

export function sortLogs(logs: LogEntry[], order: 'asc' | 'desc'): LogEntry[] {
  return [...logs].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return order === 'asc' ? aTime - bTime : bTime - aTime;
  });
}

export function formatLogTimestamp(
  timestamp: string,
  format: 'relative' | 'absolute' | 'full'
): string {
  const date = new Date(timestamp);

  if (format === 'absolute') {
    return date.toLocaleString();
  }

  if (format === 'full') {
    return date.toISOString();
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }
  if (diffDay < 30) {
    return `${diffDay}d ago`;
  }
  return date.toLocaleDateString();
}

export function getLogLevelColor(level: LogLevel): string {
  switch (level) {
    case 'debug':
      return 'text-gray-500 dark:text-gray-400';
    case 'info':
      return 'text-blue-600 dark:text-blue-400';
    case 'warn':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

function escapeCSVCell(cell: string): string {
  const escapedQuotes = cell.replace(/"/g, '""');

  if (escapedQuotes.length > 0 &&
      (escapedQuotes[0] === '=' ||
       escapedQuotes[0] === '+' ||
       escapedQuotes[0] === '-' ||
       escapedQuotes[0] === '@')) {
    return "'" + escapedQuotes;
  }

  return escapedQuotes;
}

export function exportLogsToCSV(logs: LogEntry[]): string {
  const headers = ['ID', 'Timestamp', 'Agent', 'Level', 'Category', 'Message'];
  const rows = logs.map((log) => [
    escapeCSVCell(log.id),
    escapeCSVCell(log.timestamp),
    escapeCSVCell(log.agent),
    escapeCSVCell(log.level),
    escapeCSVCell(log.category),
    escapeCSVCell(log.message),
  ]);

  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(',')
    ),
  ];

  return csvRows.join('\n');
}

export function exportLogsToJSON(logs: LogEntry[]): string {
  return JSON.stringify(logs, null, 2);
}
