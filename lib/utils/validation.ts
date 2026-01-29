import { AgentType, BeadStatus, BeadType, Message, Bead, LogLevel, LogCategory, LogEntry } from '../types';

export const VALID_AGENTS: AgentType[] = [
  'conductor',
  'architect',
  'developer',
  'tester',
  'reviewer',
  'integrator',
];

export const AGENT_LIMITS: Record<AgentType, number> = {
  conductor: 1,
  architect: 2,
  developer: 2,
  tester: 2,
  reviewer: 2,
  integrator: 1,
};

export function getAgentLimit(agent: AgentType): number {
  return AGENT_LIMITS[agent];
}

export const VALID_BEAD_STATUSES: BeadStatus[] = ['open', 'in_progress', 'closed'];

export const VALID_BEAD_TYPES: BeadType[] = [
  'task',
  'feature',
  'bug',
  'refactor',
  'test',
  'review',
  'integration',
];

export function isValidAgent(agent: string): agent is AgentType {
  return VALID_AGENTS.includes(agent as AgentType);
}

export function isValidBeadStatus(status: string): status is BeadStatus {
  return VALID_BEAD_STATUSES.includes(status as BeadStatus);
}

export function isValidBeadType(type: string): type is BeadType {
  return VALID_BEAD_TYPES.includes(type as BeadType);
}

export function isValidPriority(priority: number): boolean {
  return Number.isInteger(priority) && priority >= 0 && priority <= 4;
}

export function validateMessage(data: any): data is Message {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.sender === 'string' &&
    typeof data.recipient === 'string' &&
    typeof data.subject === 'string' &&
    typeof data.body === 'string' &&
    typeof data.priority === 'number' &&
    typeof data.created_at === 'string'
  );
}

export function validateBead(data: any): data is Bead {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    isValidBeadStatus(data.status) &&
    isValidBeadType(data.type) &&
    typeof data.priority === 'number' &&
    isValidPriority(data.priority)
  );
}

export function isValidBeadId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id) && id.length > 0 && id.length <= 100;
}

export function sanitizeShellArg(arg: string): string {
  return arg.replace(/[^a-zA-Z0-9._-]/g, '');
}

export const VALID_LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

export const VALID_LOG_CATEGORIES: LogCategory[] = [
  'system',
  'task',
  'communication',
  'error',
  'performance',
];

export function isValidLogLevel(level: string): level is LogLevel {
  return VALID_LOG_LEVELS.includes(level as LogLevel);
}

export function isValidLogCategory(category: string): category is LogCategory {
  return VALID_LOG_CATEGORIES.includes(category as LogCategory);
}

export function validateLogEntry(data: any): data is LogEntry {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.timestamp === 'string' &&
    isValidAgent(data.agent) &&
    isValidLogLevel(data.level) &&
    isValidLogCategory(data.category) &&
    typeof data.message === 'string' &&
    (data.context === undefined || typeof data.context === 'object') &&
    (data.metadata === undefined || typeof data.metadata === 'object')
  );
}
