import { AgentType } from './agent';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogCategory =
  | 'system'
  | 'task'
  | 'communication'
  | 'error'
  | 'performance';

export interface LogContext {
  bead_id?: string;
  message_id?: string;
  file_path?: string;
  line_number?: number;
  duration_ms?: number;
  [key: string]: any;
}

export interface LogMetadata {
  session_id?: string;
  correlation_id?: string;
  tags?: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: AgentType;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: LogContext;
  metadata?: LogMetadata;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  filtered: number;
  agents: AgentType[];
  timestamp: string;
}

export interface AgentLogsResponse {
  agent: AgentType;
  logs: LogEntry[];
  count: number;
  timestamp: string;
}

export interface LogFilters {
  level?: LogLevel | LogLevel[];
  category?: LogCategory | LogCategory[];
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
