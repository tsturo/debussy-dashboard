import { AgentStatus } from './agent';
import { BeadStatus, BeadStage } from './bead';

export interface BeadsByStatus {
  open: number;
  in_progress: number;
  closed: number;
  blocked: number;
}

export interface BeadsByStage {
  planning: number;
  development: number;
  testing: number;
  review: number;
  integration: number;
  completed: number;
}

export interface SystemState {
  total_beads: number;
  beads_by_status: BeadsByStatus;
  beads_by_priority: { [key: string]: number };
  beads_by_type: { [key: string]: number };
  ready_tasks: number;
}

export interface TimelineData {
  date: string;
  tasks_created: number;
  tasks_completed: number;
  tasks_in_progress: number;
}

export interface AgentPerformance {
  agent: string;
  tasks_completed: number;
  avg_completion_time: number;
  current_load: number;
}

export interface Bottleneck {
  bead_id: string;
  title: string;
  blocked_count: number;
  blocked_tasks: string[];
}

export interface StatsResponse {
  system_state: SystemState;
  timestamp: string;
}
