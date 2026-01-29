'use client';

import { Message } from '@/lib/types';
import { getRelativeTime } from '@/lib/utils/messageFilters';
import PriorityBadge from './PriorityBadge';
import AgentBadge from './AgentBadge';
import Link from 'next/link';

interface MessageCardProps {
  message: Message;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function MessageCard({ message, isExpanded, onToggle }: MessageCardProps) {
  const previewLength = 100;
  const bodyPreview = message.body.length > previewLength && !isExpanded
    ? message.body.substring(0, previewLength) + '...'
    : message.body;

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-dark-700 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <AgentBadge agent={message.sender} />
          <span className="text-gray-400 dark:text-dark-500 transition-transform duration-300 hover:scale-110">→</span>
          <AgentBadge agent={message.recipient} />
        </div>
        <div className="flex items-center space-x-2">
          <PriorityBadge priority={message.priority} />
          <span className="text-xs text-gray-500 dark:text-dark-400">
            {getRelativeTime(message.created_at)}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-2">
        {message.subject}
      </h3>

      <div
        className="text-gray-700 dark:text-dark-200 text-sm mb-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px]' : 'max-h-[100px]'}`}>
          <p className="whitespace-pre-wrap">{bodyPreview}</p>
        </div>
        {message.body.length > previewLength && (
          <button className="text-blue-600 dark:text-primary-400 hover:text-blue-800 dark:hover:text-primary-300 text-xs mt-1 flex items-center gap-1 transition-all duration-200 hover:gap-2">
            {isExpanded ? (
              <>
                <span>Show less</span>
                <span className="transform transition-transform duration-200">↑</span>
              </>
            ) : (
              <>
                <span>Show more</span>
                <span className="transform transition-transform duration-200">↓</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {message.bead_id && (
          <Link
            href={`/task/${message.bead_id}`}
            className="text-xs bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded border border-blue-200 dark:border-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            View Bead: {message.bead_id}
          </Link>
        )}
        <button
          onClick={() => navigator.clipboard.writeText(message.id)}
          className="text-xs bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-200 px-3 py-1.5 rounded border border-gray-200 dark:border-dark-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
        >
          Copy ID
        </button>
      </div>
    </div>
  );
}
