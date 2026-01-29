import { AgentType } from './agent';
import { BeadStage, BeadStatus } from './bead';

export interface TimelineStageSegment {
  stage: BeadStage;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface TimelineTask {
  beadId: string;
  title: string;
  agent?: AgentType;
  status: BeadStatus;
  currentStage: BeadStage;
  startTime: string;
  endTime?: string;
  duration?: number;
  stageSegments: TimelineStageSegment[];
  priority: number;
  type: string;
}

export interface TimelineResponse {
  tasks: TimelineTask[];
  total: number;
  startTime: string;
  endTime: string;
  timestamp: string;
}
