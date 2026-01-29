import { AgentType, Bead } from '../types';
import { AGENT_LIMITS, VALID_AGENTS } from './validation';
import { AgentCurrentStatus } from '../types/activity';

export interface AgentCount {
  agent: AgentType;
  active: number;
  limit: number;
  available: number;
}

export function countActiveAgents(
  statuses: AgentCurrentStatus[]
): Record<AgentType, number> {
  const counts = {} as Record<AgentType, number>;
  for (const agent of VALID_AGENTS) {
    counts[agent] = 0;
  }

  for (const status of statuses) {
    if (status.status === 'working') {
      counts[status.name]++;
    }
  }

  return counts;
}

export function getAgentAvailability(
  statuses: AgentCurrentStatus[]
): AgentCount[] {
  const activeCounts = countActiveAgents(statuses);

  return VALID_AGENTS.map(agent => ({
    agent,
    active: activeCounts[agent],
    limit: AGENT_LIMITS[agent],
    available: AGENT_LIMITS[agent] - activeCounts[agent],
  }));
}

export function canAssignAgent(
  agent: AgentType,
  statuses: AgentCurrentStatus[]
): boolean {
  const activeCounts = countActiveAgents(statuses);
  const limit = AGENT_LIMITS[agent];
  return activeCounts[agent] < limit;
}

export function getAvailableAgent(
  agent: AgentType,
  statuses: AgentCurrentStatus[]
): AgentType | null {
  if (!canAssignAgent(agent, statuses)) {
    return null;
  }

  const status = statuses.find(s => s.name === agent);
  if (status && status.status === 'idle') {
    return agent;
  }

  return null;
}

export function isBeadBlocked(bead: Bead): boolean {
  const blockedBy = bead.blocked_by || bead.dependencies || [];
  return blockedBy.length > 0;
}

export function filterUnblockedBeads(beads: Bead[]): Bead[] {
  return beads.filter(bead => !isBeadBlocked(bead));
}

export interface AssignmentCheck {
  canAssign: boolean;
  reason?: string;
}

export function checkBeadAssignment(
  bead: Bead,
  targetAgent: AgentType,
  statuses: AgentCurrentStatus[]
): AssignmentCheck {
  if (isBeadBlocked(bead)) {
    return {
      canAssign: false,
      reason: `Bead ${bead.id} is blocked by: ${(bead.blocked_by || bead.dependencies || []).join(', ')}`,
    };
  }

  if (!canAssignAgent(targetAgent, statuses)) {
    const limit = AGENT_LIMITS[targetAgent];
    return {
      canAssign: false,
      reason: `Agent '${targetAgent}' has reached limit of ${limit} active agents`,
    };
  }

  return { canAssign: true };
}
