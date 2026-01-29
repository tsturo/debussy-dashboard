'use client';

import { Message } from '@/lib/types';

interface RecentActivityProps {
  messages: Message[];
}

export default function RecentActivity({ messages }: RecentActivityProps) {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      0: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      1: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      2: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      3: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      4: 'bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-dark-300',
    };
    const labels = {
      0: 'P0',
      1: 'P1',
      2: 'P2',
      3: 'P3',
      4: 'P4',
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          colors[priority as keyof typeof colors] || colors[4]
        }`}
      >
        {labels[priority as keyof typeof labels] || 'P4'}
      </span>
    );
  };

  const sortedMessages = [...messages]
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    })
    .slice(0, 10);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-dark-100 mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {sortedMessages.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-400 text-center py-4">No recent messages</p>
        ) : (
          sortedMessages.map((message) => (
            <div
              key={message.id}
              className="border-l-4 border-blue-500 dark:border-primary-500 pl-4 py-2 bg-gray-50 dark:bg-dark-900 rounded-r"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase">
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-dark-500">→</span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase">
                      {message.recipient}
                    </span>
                    {getPriorityBadge(message.priority)}
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-dark-100 truncate">
                    {message.subject}
                  </p>
                  {message.bead_id && (
                    <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                      Bead: {message.bead_id}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-dark-400 ml-2 whitespace-nowrap">
                  {formatTime(message.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
