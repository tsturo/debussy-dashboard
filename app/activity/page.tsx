'use client';

import { ActivityDashboardView } from '@/components/activity';
import { AgentStatus } from '@/lib/types';
import { ActivityEvent } from '@/components/activity';
import { useState, useEffect } from 'react';

const mockAgents: AgentStatus[] = [
  {
    agent: 'conductor',
    inbox_count: 3,
    current_task: 'Orchestrating pipeline execution',
    status: 'running',
    last_activity: '1m ago',
  },
  {
    agent: 'developer',
    inbox_count: 1,
    current_task: 'Implementing activity feed UI components',
    status: 'running',
    last_activity: 'just now',
  },
  {
    agent: 'developer2',
    inbox_count: 0,
    status: 'idle',
    last_activity: '15m ago',
  },
  {
    agent: 'tester',
    inbox_count: 2,
    current_task: 'Running integration tests',
    status: 'running',
    last_activity: '3m ago',
  },
  {
    agent: 'reviewer',
    inbox_count: 0,
    status: 'idle',
    last_activity: '1h ago',
  },
  {
    agent: 'integrator',
    inbox_count: 1,
    status: 'idle',
    last_activity: '30m ago',
  },
  {
    agent: 'architect',
    inbox_count: 0,
    status: 'idle',
    last_activity: '2h ago',
  },
];

const mockEvents: ActivityEvent[] = [
  {
    id: '1',
    type: 'task_started',
    agent: 'developer',
    message: 'Started implementing activity feed UI components',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    metadata: { bead_id: 'debussy-dashboard-tc0' },
  },
  {
    id: '2',
    type: 'message_sent',
    agent: 'conductor',
    message: 'Sent task assignment to developer',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    priority: 2,
  },
  {
    id: '3',
    type: 'task_completed',
    agent: 'tester',
    message: 'Completed unit tests for pipeline module',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    metadata: { tests_passed: 42, duration: '2.3s' },
  },
  {
    id: '4',
    type: 'status_change',
    agent: 'developer2',
    message: 'Status changed from running to idle',
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: '5',
    type: 'task_started',
    agent: 'tester',
    message: 'Started running integration tests',
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
];

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>(mockEvents);
  const [agents, setAgents] = useState<AgentStatus[]>(mockAgents);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent: ActivityEvent = {
        id: `event-${Date.now()}`,
        type: ['task_started', 'task_completed', 'message_sent', 'status_change'][
          Math.floor(Math.random() * 4)
        ] as any,
        agent: ['developer', 'tester', 'conductor', 'reviewer'][
          Math.floor(Math.random() * 4)
        ],
        message: 'New activity event generated',
        timestamp: new Date().toISOString(),
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 20));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <ActivityDashboardView agents={agents} events={events} />
    </div>
  );
}
