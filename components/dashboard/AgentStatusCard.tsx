'use client';

import { AgentType } from '@/lib/types';

interface AgentStatusCardProps {
  agent: AgentType;
  inbox_count: number;
  current_task?: string;
  status: 'idle' | 'running' | 'stopped';
}

export default function AgentStatusCard({
  agent,
  inbox_count,
  current_task,
  status,
}: AgentStatusCardProps) {
  const statusColors = {
    idle: 'bg-gray-400',
    running: 'bg-green-500',
    stopped: 'bg-red-500',
  };

  const statusLabels = {
    idle: 'Idle',
    running: 'Running',
    stopped: 'Stopped',
  };

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg shadow-md p-4 border border-gray-200 dark:border-dark-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 capitalize">
          {agent}
        </h3>
        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${statusColors[status]}`}
            title={statusLabels[status]}
          />
          <span className="text-sm text-gray-600 dark:text-dark-300">{statusLabels[status]}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-dark-300">Inbox</span>
          <span
            className={`text-lg font-bold ${
              inbox_count > 0 ? 'text-blue-600 dark:text-primary-400' : 'text-gray-400 dark:text-dark-500'
            }`}
          >
            {inbox_count}
          </span>
        </div>

        {current_task && (
          <div className="pt-2 border-t border-gray-200 dark:border-dark-700">
            <span className="text-xs text-gray-500 dark:text-dark-400 block mb-1">
              Current Task
            </span>
            <span className="text-sm text-gray-700 dark:text-dark-200 line-clamp-2">
              {current_task}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
