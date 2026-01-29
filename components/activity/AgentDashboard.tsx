'use client';

import { AgentStatus } from '@/lib/types';
import { AgentStatusCard } from './AgentStatusCard';

interface AgentDashboardProps {
  agents: AgentStatus[];
}

export function AgentDashboard({ agents }: AgentDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-100">
          Agent Status
        </h2>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-dark-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>{agents.filter(a => a.status === 'running').length} active</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span>{agents.filter(a => a.status === 'idle').length} idle</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {agents.map((agent) => (
          <AgentStatusCard key={agent.agent} {...agent} />
        ))}
      </div>
    </div>
  );
}
