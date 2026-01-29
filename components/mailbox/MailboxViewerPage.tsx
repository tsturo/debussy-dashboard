'use client';

import { useState, useMemo } from 'react';
import { useMailbox } from '@/lib/hooks/useMailbox';
import { Message, AgentType } from '@/lib/types';
import { filterMessages, FilterState } from '@/lib/utils/messageFilters';
import MailboxHeader from './MailboxHeader';
import FilterControls from './FilterControls';
import MessageList from './MessageList';

export default function MailboxViewerPage() {
  const { data, isLoading, error } = useMailbox(5000);

  const [filters, setFilters] = useState<FilterState>({
    agents: [],
    priorities: [],
    search: '',
    sort: 'date',
    order: 'desc',
  });

  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const allMessages = useMemo(() => {
    if (!data?.agents) return [];
    return data.agents.flatMap((agent) => agent.messages);
  }, [data]);

  const filteredMessages = useMemo(() => {
    return filterMessages(allMessages, filters);
  }, [allMessages, filters]);

  const availableAgents = useMemo(() => {
    if (!data?.agents) return [];
    return data.agents.map((agent) => agent.agent);
  }, [data]);

  const handleToggleExpand = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading mailbox: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <MailboxHeader
        totalMessages={allMessages.length}
        filteredMessages={filteredMessages.length}
        lastUpdated={data?.updated_at || new Date().toISOString()}
      />

      <FilterControls
        filters={filters}
        onFilterChange={setFilters}
        availableAgents={availableAgents}
      />

      <MessageList
        messages={filteredMessages}
        isLoading={isLoading}
        expandedMessages={expandedMessages}
        onToggleExpand={handleToggleExpand}
      />
    </div>
  );
}
