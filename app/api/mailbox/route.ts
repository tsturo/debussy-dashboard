import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Message, AgentMailbox, AgentType, MailboxResponse } from '@/lib/types';
import { VALID_AGENTS, validateMessage } from '@/lib/utils';

const AGENT_TYPES = VALID_AGENTS;

async function getAgentMessages(agent: AgentType): Promise<Message[]> {
  const inboxPath = path.join(process.cwd(), '.claude', 'mailbox', agent, 'inbox');

  try {
    const files = await fs.readdir(inboxPath);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort();

    const messages = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(inboxPath, file);
        const content = await fs.readFile(filePath, 'utf-8');

        try {
          const parsed = JSON.parse(content);
          if (!validateMessage(parsed)) {
            console.error(`Invalid message format in ${file}`);
            return null;
          }
          return parsed;
        } catch (error) {
          console.error(`Failed to parse JSON in ${file}:`, error);
          return null;
        }
      })
    );

    return messages.filter((msg): msg is Message => msg !== null);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function GET() {
  try {
    const agentMailboxes: AgentMailbox[] = await Promise.all(
      AGENT_TYPES.map(async (agent) => {
        const messages = await getAgentMessages(agent);
        return {
          agent,
          inbox_count: messages.length,
          messages,
        };
      })
    );

    const totalMessages = agentMailboxes.reduce(
      (sum, mailbox) => sum + mailbox.inbox_count,
      0
    );

    return NextResponse.json({
      agents: agentMailboxes,
      total_messages: totalMessages,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching mailbox messages:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch mailbox messages',
        code: 'MAILBOX_FETCH_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
