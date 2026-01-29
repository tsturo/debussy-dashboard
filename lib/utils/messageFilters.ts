import { Message, AgentType } from '@/lib/types';

export interface FilterState {
  agents: AgentType[];
  priorities: number[];
  search: string;
  sort: 'date' | 'priority' | 'agent';
  order: 'asc' | 'desc';
}

export function filterMessages(messages: Message[], filters: FilterState): Message[] {
  let filtered = [...messages];

  if (filters.agents.length > 0) {
    filtered = filtered.filter(
      (msg) => filters.agents.includes(msg.sender) || filters.agents.includes(msg.recipient)
    );
  }

  if (filters.priorities.length > 0) {
    filtered = filtered.filter((msg) => filters.priorities.includes(msg.priority));
  }

  if (filters.search.trim()) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (msg) =>
        msg.subject.toLowerCase().includes(searchLower) ||
        msg.body.toLowerCase().includes(searchLower) ||
        msg.sender.toLowerCase().includes(searchLower) ||
        msg.recipient.toLowerCase().includes(searchLower)
    );
  }

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (filters.sort) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'priority':
        comparison = a.priority - b.priority;
        break;
      case 'agent':
        comparison = a.sender.localeCompare(b.sender);
        break;
    }

    return filters.order === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

export function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}
