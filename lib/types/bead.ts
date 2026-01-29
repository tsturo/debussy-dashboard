import { AgentType } from './agent';

export type BeadStatus = 'open' | 'in_progress' | 'closed';

export type BeadType =
  | 'task'
  | 'feature'
  | 'bug'
  | 'refactor'
  | 'test'
  | 'review'
  | 'integration';

export type BeadLabel =
  | 'passed'
  | 'failed'
  | 'approved'
  | 'changes-requested';

export type BeadStage =
  | 'planning'
  | 'development'
  | 'testing'
  | 'review'
  | 'integration'
  | 'completed';

export interface Bead {
  id: string;
  title: string;
  description?: string;
  status: BeadStatus;
  type: BeadType;
  priority: number;
  assignee?: AgentType;
  owner?: string;
  created_at: string;
  updated_at: string;
  dependencies?: string[];
  blocked_by?: string[];
  blocks?: string[];
  labels?: BeadLabel[];
  comments?: string[];
  parent_bead?: string;
  git_branch?: string;
  commits?: string[];
  close_reason?: string;
}

export interface BeadListResponse {
  beads: Bead[];
  total: number;
  filtered: number;
}

export interface BeadDetailResponse {
  bead: Bead;
  dependencies: Bead[];
  blocked_by: Bead[];
  blocks: Bead[];
  related_messages: Message[];
}

export interface BeadReadyResponse {
  ready_beads: Bead[];
  count: number;
}

import { Message } from './message';
