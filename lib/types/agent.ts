export type AgentType =
  | 'conductor'
  | 'architect'
  | 'developer'
  | 'tester'
  | 'reviewer'
  | 'integrator';

export type AgentStatusType = 'idle' | 'running' | 'stopped';

export interface AgentStatus {
  agent: AgentType;
  inbox_count: number;
  current_task?: string;
  status: AgentStatusType;
  last_activity?: string;
}
