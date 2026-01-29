'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLogs } from '@/lib/hooks/useLogs';
import { AgentType, LogLevel, LogCategory, LogFilters } from '@/lib/types';
import { filterLogs, sortLogs } from '@/lib/utils/logFilters';
import LogFilterControls from './LogFilterControls';
import LogList from './LogList';
import LogStats from './LogStats';

interface FilterState {
  agents: AgentType[];
  levels: LogLevel[];
  categories: LogCategory[];
  search: string;
  dateFrom: string;
  dateTo: string;
}

export default function LogViewerPage() {
  const [filters, setFilters] = useState<FilterState>({
    agents: [],
    levels: [],
    categories: [],
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const apiFilters: LogFilters = useMemo(() => {
    const result: LogFilters = {};

    if (filters.levels.length > 0) {
      result.level = filters.levels;
    }

    if (filters.categories.length > 0) {
      result.category = filters.categories;
    }

    if (filters.search) {
      result.search = filters.search;
    }

    if (filters.dateFrom) {
      result.from = new Date(filters.dateFrom).toISOString();
    }

    if (filters.dateTo) {
      result.to = new Date(filters.dateTo).toISOString();
    }

    result.limit = 1000;

    return result;
  }, [filters]);

  const { data, isLoading, error } = useLogs(apiFilters, 5000);

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];

    let logs = data.logs;

    if (filters.agents.length > 0) {
      logs = logs.filter((log) => filters.agents.includes(log.agent));
    }

    return sortLogs(logs, 'desc');
  }, [data?.logs, filters.agents]);

  useEffect(() => {
    setExpandedLogs(new Set());
  }, [filteredLogs]);

  const availableAgents = useMemo(() => {
    if (!data?.agents) return [];
    return data.agents;
  }, [data?.agents]);

  const handleToggleExpand = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">Error loading logs: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100">Agent Logs</h1>
        <p className="text-gray-600 dark:text-dark-300 mt-2">
          View and filter logs from all agents
        </p>
      </div>

      <LogStats logs={filteredLogs} />

      <LogFilterControls
        filters={filters}
        onFilterChange={setFilters}
        availableAgents={availableAgents}
      />

      <LogList
        logs={filteredLogs}
        isLoading={isLoading}
        expandedLogs={expandedLogs}
        onToggleExpand={handleToggleExpand}
      />
    </div>
  );
}
