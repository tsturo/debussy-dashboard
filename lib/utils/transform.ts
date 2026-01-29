import { Bead, BeadStage, Message } from '../types';

export function getBeadStage(bead: Bead): BeadStage {
  if (bead.status === 'closed') {
    return 'completed';
  }

  if (bead.labels?.includes('changes-requested') || bead.labels?.includes('failed')) {
    return 'review';
  }

  if (bead.labels?.includes('approved') || bead.labels?.includes('passed')) {
    return 'integration';
  }

  switch (bead.type) {
    case 'task':
    case 'feature':
    case 'bug':
    case 'refactor':
      return bead.status === 'in_progress' ? 'development' : 'planning';
    case 'test':
      return bead.status === 'in_progress' ? 'testing' : 'planning';
    case 'review':
      return 'review';
    case 'integration':
      return 'integration';
    default:
      return 'planning';
  }
}

export function sortMessagesByPriority(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function sortBeadsByPriority(beads: Bead[]): Bead[] {
  return [...beads].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function groupBeadsByStage(beads: Bead[]): Record<BeadStage, Bead[]> {
  const grouped: Record<BeadStage, Bead[]> = {
    planning: [],
    development: [],
    testing: [],
    review: [],
    integration: [],
    completed: [],
  };

  beads.forEach(bead => {
    const stage = getBeadStage(bead);
    grouped[stage].push(bead);
  });

  return grouped;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 0: return 'Critical';
    case 1: return 'High';
    case 2: return 'Medium';
    case 3: return 'Low';
    case 4: return 'Backlog';
    default: return 'Unknown';
  }
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 0: return 'red';
    case 1: return 'orange';
    case 2: return 'yellow';
    case 3: return 'blue';
    case 4: return 'gray';
    default: return 'gray';
  }
}
