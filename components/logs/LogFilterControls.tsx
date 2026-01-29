'use client';

import { AgentType, LogLevel, LogCategory } from '@/lib/types';
import { useState, useEffect } from 'react';

interface FilterState {
  agents: AgentType[];
  levels: LogLevel[];
  categories: LogCategory[];
  search: string;
  dateFrom: string;
  dateTo: string;
}

interface LogFilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableAgents: AgentType[];
}

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const LOG_CATEGORIES: LogCategory[] = ['system', 'task', 'communication', 'error', 'performance'];

export default function LogFilterControls({
  filters,
  onFilterChange,
  availableAgents,
}: LogFilterControlsProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filters, search: searchInput });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters, onFilterChange]);

  const handleAgentToggle = (agent: AgentType) => {
    const newAgents = filters.agents.includes(agent)
      ? filters.agents.filter((a) => a !== agent)
      : [...filters.agents, agent];
    onFilterChange({ ...filters, agents: newAgents });
  };

  const handleLevelToggle = (level: LogLevel) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    onFilterChange({ ...filters, levels: newLevels });
  };

  const handleCategoryToggle = (category: LogCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange({
      agents: [],
      levels: [],
      categories: [],
      search: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters =
    filters.agents.length > 0 ||
    filters.levels.length > 0 ||
    filters.categories.length > 0 ||
    filters.search.trim() !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-dark-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Agents
          </label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {availableAgents.map((agent) => (
              <label key={agent} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.agents.includes(agent)}
                  onChange={() => handleAgentToggle(agent)}
                  className="rounded border-gray-300 dark:border-dark-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-dark-200">{agent}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Level
          </label>
          <div className="space-y-1">
            {LOG_LEVELS.map((level) => (
              <label key={level} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.levels.includes(level)}
                  onChange={() => handleLevelToggle(level)}
                  className="rounded border-gray-300 dark:border-dark-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-dark-200 capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Category
          </label>
          <div className="space-y-1">
            {LOG_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="rounded border-gray-300 dark:border-dark-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-dark-200 capitalize">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Search
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search logs..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            From Date
          </label>
          <input
            type="datetime-local"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            To Date
          </label>
          <input
            type="datetime-local"
            value={filters.dateTo}
            onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-200 rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
