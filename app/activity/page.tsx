'use client';

import { ActivityDashboardView } from '@/components/activity';
import { AgentStatus } from '@/lib/types';
import { ActivityEvent } from '@/components/activity';
import { useState, useEffect } from 'react';
import {
  ActivityEvent as LibActivityEvent,
  AgentCurrentStatus,
  ActivityResponse,
  AgentStatusResponse
} from '@/lib/types/activity';

function mapAgentCurrentStatusToAgentStatus(status: AgentCurrentStatus): AgentStatus {
  const mappedStatus = status.status === 'working'
    ? 'running'
    : status.status === 'error'
    ? 'stopped'
    : status.status;

  return {
    agent: status.name,
    inbox_count: status.inboxCount,
    current_task: status.currentTask,
    status: mappedStatus as 'idle' | 'running' | 'stopped',
    last_activity: status.lastActive,
  };
}

function mapLibActivityEventToComponentEvent(event: LibActivityEvent): ActivityEvent | null {
  type ComponentEventType = 'task_started' | 'task_completed' | 'error' | 'status_change' | 'message_sent';
  let mappedType: ComponentEventType;

  switch (event.type) {
    case 'task_started':
      mappedType = 'task_started';
      break;
    case 'task_completed':
      mappedType = 'task_completed';
      break;
    case 'error':
      mappedType = 'error';
      break;
    case 'message_sent':
      mappedType = 'message_sent';
      break;
    case 'task_failed':
      mappedType = 'error';
      break;
    case 'message_received':
      mappedType = 'message_sent';
      break;
    case 'bead_created':
    case 'bead_updated':
    case 'bead_closed':
    case 'agent_started':
    case 'agent_stopped':
    case 'log':
      mappedType = 'status_change';
      break;
    default:
      return null;
  }

  return {
    id: event.id,
    type: mappedType,
    agent: event.agent,
    message: event.message,
    timestamp: event.timestamp,
    metadata: event.metadata,
  };
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [activityRes, agentsRes] = await Promise.all([
          fetch('/api/activity?limit=50'),
          fetch('/api/agents/status'),
        ]);

        if (!activityRes.ok || !agentsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const activityData: ActivityResponse = await activityRes.json();
        const agentsData: AgentStatusResponse = await agentsRes.json();

        const mappedEvents = activityData.events
          .map(mapLibActivityEventToComponentEvent)
          .filter((e): e is ActivityEvent => e !== null);
        setEvents(mappedEvents);
        setAgents(agentsData.agents.map(mapAgentCurrentStatusToAgentStatus));
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    }

    fetchInitialData();

    const eventSource = new EventSource('/api/activity/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'activity') {
          const newEvents = data.events
            .map(mapLibActivityEventToComponentEvent)
            .filter((e: ActivityEvent | null): e is ActivityEvent => e !== null);
          setEvents((prev) => {
            const merged = [...newEvents, ...prev];
            const unique = Array.from(new Map(merged.map(e => [e.id, e])).values());
            return unique.slice(0, 100);
          });
        } else if (data.type === 'agents') {
          setAgents(data.agents.map(mapAgentCurrentStatusToAgentStatus));
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <ActivityDashboardView agents={agents} events={events} />
    </div>
  );
}
