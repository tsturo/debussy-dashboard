import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AgentType, LogEntry, LogsResponse, AgentLogsResponse, LogFilters } from '@/lib/types';

function buildQueryParams(filters?: LogFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters?.level) {
    if (Array.isArray(filters.level)) {
      filters.level.forEach(l => params.append('level', l));
    } else {
      params.append('level', filters.level);
    }
  }

  if (filters?.category) {
    if (Array.isArray(filters.category)) {
      filters.category.forEach(c => params.append('category', c));
    } else {
      params.append('category', filters.category);
    }
  }

  if (filters?.from) {
    params.append('from', filters.from);
  }

  if (filters?.to) {
    params.append('to', filters.to);
  }

  if (filters?.search) {
    params.append('search', filters.search);
  }

  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }

  if (filters?.offset) {
    params.append('offset', filters.offset.toString());
  }

  return params;
}

export function useLogs(
  filters?: LogFilters,
  refetchInterval: number = 5000
): UseQueryResult<LogsResponse, Error> {
  return useQuery<LogsResponse, Error>({
    queryKey: ['logs', filters],
    queryFn: async () => {
      const params = buildQueryParams(filters);
      const response = await fetch(`/api/logs?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch logs: ${response.statusText}`);
      }

      return response.json();
    },
    refetchInterval,
  });
}

export function useAgentLogs(
  agent: AgentType | null,
  filters?: LogFilters,
  refetchInterval: number = 5000
): UseQueryResult<AgentLogsResponse, Error> {
  return useQuery<AgentLogsResponse, Error>({
    queryKey: ['logs', agent, filters],
    queryFn: async () => {
      if (!agent) throw new Error('Agent is required');

      const params = buildQueryParams(filters);
      const response = await fetch(`/api/logs/${agent}?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch agent logs: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!agent,
    refetchInterval,
  });
}
