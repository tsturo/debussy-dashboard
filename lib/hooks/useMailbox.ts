import { useQuery } from '@tanstack/react-query';
import { AgentType, AgentMailbox, AgentMailboxResponse } from '@/lib/types';

interface MailboxResponse {
  agents: AgentMailbox[];
  total_messages: number;
  updated_at: string;
}

export function useMailbox(refetchInterval: number = 3000) {
  return useQuery<MailboxResponse, Error>({
    queryKey: ['mailbox'],
    queryFn: async () => {
      const response = await fetch('/api/mailbox');
      if (!response.ok) {
        throw new Error(`Failed to fetch mailbox: ${response.statusText}`);
      }
      return response.json();
    },
    refetchInterval,
  });
}

export function useAgentMailbox(agent: AgentType | null, refetchInterval: number = 3000) {
  return useQuery<AgentMailboxResponse, Error>({
    queryKey: ['mailbox', agent],
    queryFn: async () => {
      if (!agent) throw new Error('Agent is required');
      const response = await fetch(`/api/mailbox/${agent}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch agent mailbox: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!agent,
    refetchInterval,
  });
}
