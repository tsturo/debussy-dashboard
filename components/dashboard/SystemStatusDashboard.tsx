'use client';

import { useMailbox } from '@/lib/hooks/useMailbox';
import { useStats } from '@/lib/hooks/useStats';
import AgentGrid from './AgentGrid';
import SystemHealthPanel from './SystemHealthPanel';
import RecentActivity from './RecentActivity';

export default function SystemStatusDashboard() {
  const {
    data: mailboxData,
    isLoading: mailboxLoading,
    error: mailboxError,
  } = useMailbox(3000);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useStats(5000);

  if (mailboxLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (mailboxError || statsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-xl mb-2">⚠️</div>
          <p className="text-gray-800 dark:text-dark-100 font-semibold">Failed to load dashboard</p>
          <p className="text-gray-600 dark:text-dark-300 text-sm mt-2">
            {mailboxError?.message || statsError?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!mailboxData || !statsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-dark-300">No data available</p>
      </div>
    );
  }

  const allMessages = mailboxData.agents.flatMap((agent) => agent.messages);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-100">System Status</h1>
        <div className="text-sm text-gray-500 dark:text-dark-400">
          Last updated: {new Date(mailboxData.updated_at).toLocaleTimeString()}
        </div>
      </div>

      <SystemHealthPanel systemState={statsData.system_state} />

      <AgentGrid agents={mailboxData.agents} />

      <RecentActivity messages={allMessages} />
    </div>
  );
}
