'use client';

import { AgentType } from '@/lib/types';
import { FilterState } from '@/lib/utils/messageFilters';
import { useState, useEffect } from 'react';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableAgents: AgentType[];
}

export default function FilterControls({
  filters,
  onFilterChange,
  availableAgents,
}: FilterControlsProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filters, search: searchInput });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, onFilterChange, filters]);

  const handleAgentToggle = (agent: AgentType) => {
    const newAgents = filters.agents.includes(agent)
      ? filters.agents.filter((a) => a !== agent)
      : [...filters.agents, agent];
    onFilterChange({ ...filters, agents: newAgents });
  };

  const handlePriorityToggle = (priority: number) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onFilterChange({ ...filters, priorities: newPriorities });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange({
      agents: [],
      priorities: [],
      search: '',
      sort: 'date',
      order: 'desc',
    });
  };

  const hasActiveFilters = filters.agents.length > 0 || filters.priorities.length > 0 || filters.search.trim() !== '';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agents
          </label>
          <div className="space-y-1">
            {availableAgents.map((agent) => (
              <label key={agent} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.agents.includes(agent)}
                  onChange={() => handleAgentToggle(agent)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{agent}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((priority) => (
              <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.priorities.includes(priority)}
                  onChange={() => handlePriorityToggle(priority)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">P{priority}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <select
            value={`${filters.sort}-${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-') as [FilterState['sort'], FilterState['order']];
              onFilterChange({ ...filters, sort, order });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="date-desc">Date (newest first)</option>
            <option value="date-asc">Date (oldest first)</option>
            <option value="priority-asc">Priority (highest first)</option>
            <option value="priority-desc">Priority (lowest first)</option>
            <option value="agent-asc">Agent (A-Z)</option>
            <option value="agent-desc">Agent (Z-A)</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
