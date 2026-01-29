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
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <AgentBadge agent={message.sender} />
          <span className="text-gray-400">→</span>
          <AgentBadge agent={message.recipient} />
        </div>
        <div className="flex items-center space-x-2">
          <PriorityBadge priority={message.priority} />
          <span className="text-xs text-gray-500">
            {getRelativeTime(message.created_at)}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {message.subject}
      </h3>

      <div
        className="text-gray-700 text-sm mb-3 cursor-pointer"
        onClick={onToggle}
      >
        <p className="whitespace-pre-wrap">{bodyPreview}</p>
        {message.body.length > previewLength && (
          <button className="text-blue-600 hover:text-blue-800 text-xs mt-1">
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {message.bead_id && (
          <Link
            href={`/task/${message.bead_id}`}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded border border-blue-200 transition-colors"
          >
            View Bead: {message.bead_id}
          </Link>
        )}
        <button
          onClick={() => navigator.clipboard.writeText(message.id)}
          className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded border border-gray-200 transition-colors"
        >
          Copy ID
        </button>
      </div>
    </div>
  );
}
