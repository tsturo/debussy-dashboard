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
      0: 'bg-red-100 text-red-800',
      1: 'bg-orange-100 text-orange-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-gray-100 text-gray-800',
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
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {sortedMessages.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent messages</p>
        ) : (
          sortedMessages.map((message) => (
            <div
              key={message.id}
              className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      {message.recipient}
                    </span>
                    {getPriorityBadge(message.priority)}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {message.subject}
                  </p>
                  {message.bead_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Bead: {message.bead_id}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
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
