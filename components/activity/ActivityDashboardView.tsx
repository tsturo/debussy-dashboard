'use client';

import { AgentStatus } from '@/lib/types';
import { AgentDashboard } from './AgentDashboard';
import { ActivityFeed, ActivityEvent } from './ActivityFeed';

interface ActivityDashboardViewProps {
  agents: AgentStatus[];
  events: ActivityEvent[];
}

export function ActivityDashboardView({ agents, events }: ActivityDashboardViewProps) {
  return (
    <div className="space-y-8 p-6 max-w-[1920px] mx-auto">
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-dark-50 dark:via-dark-100 dark:to-dark-50 bg-clip-text text-transparent">
            Activity Dashboard
          </h1>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
        </div>
        <p className="text-gray-600 dark:text-dark-300 text-lg">
          Real-time monitoring of agent status and system activity
        </p>
      </div>

      <div className="space-y-6">
        <AgentDashboard agents={agents} />
        <ActivityFeed events={events} autoScroll />
      </div>
    </div>
  );
}
