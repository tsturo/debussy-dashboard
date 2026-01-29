import { AgentType } from './agent';

export interface Message {
  id: string;
  sender: AgentType;
  recipient: AgentType;
  subject: string;
  body: string;
  bead_id?: string | null;
  priority: number;
  created_at: string;
}

export interface AgentMailbox {
  agent: AgentType;
  inbox_count: number;
  messages: Message[];
}

export interface MailboxResponse {
  agents: AgentMailbox[];
  total_messages: number;
  updated_at: string;
}

export interface AgentMailboxResponse {
  agent: AgentType;
  messages: Message[];
  count: number;
}
