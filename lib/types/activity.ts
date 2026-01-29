import { AgentType } from './agent';

export type ActivityEventType =
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'message_sent'
  | 'message_received'
  | 'bead_created'
  | 'bead_updated'
  | 'bead_closed'
  | 'agent_started'
  | 'agent_stopped'
  | 'error'
  | 'log';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agent: AgentType;
  type: ActivityEventType;
  message: string;
  taskId?: string;
  beadId?: string;
  metadata?: Record<string, any>;
}

export interface ActivityResponse {
  events: ActivityEvent[];
  total: number;
  filtered: number;
  timestamp: string;
}

export interface AgentCurrentStatus {
  name: AgentType;
  status: 'idle' | 'working' | 'error';
  currentTask?: string;
  lastActive: string;
  taskCount: number;
  inboxCount: number;
}

export interface AgentStatusResponse {
  agents: AgentCurrentStatus[];
  timestamp: string;
}
