'use client';

import { Message } from '@/lib/types';
import MessageCard from './MessageCard';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  expandedMessages: Set<string>;
  onToggleExpand: (messageId: string) => void;
}

export default function MessageList({
  messages,
  isLoading,
  expandedMessages,
  onToggleExpand,
}: MessageListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-dark-700 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-dark-700 text-center">
        <p className="text-gray-500 dark:text-dark-300 text-lg">No messages found</p>
        <p className="text-gray-400 dark:text-dark-400 text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          isExpanded={expandedMessages.has(message.id)}
          onToggle={() => onToggleExpand(message.id)}
        />
      ))}
    </div>
  );
}
