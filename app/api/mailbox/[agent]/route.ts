import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Message, AgentType, AgentMailboxResponse } from '@/lib/types';
import { VALID_AGENTS, isValidAgent, validateMessage } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { agent: string } }
) {
  try {
    const agent = params.agent;

    if (!isValidAgent(agent)) {
      return NextResponse.json(
        {
          error: 'Invalid agent',
          code: 'INVALID_AGENT',
          details: `Agent must be one of: ${VALID_AGENTS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const inboxPath = path.join(process.cwd(), '.claude', 'mailbox', agent, 'inbox');

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

    const validMessages = messages.filter((msg): msg is Message => msg !== null);

    return NextResponse.json({
      agent,
      messages: validMessages,
      count: validMessages.length,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({
        agent: params.agent,
        messages: [],
        count: 0,
      });
    }

    console.error(`Error fetching messages for agent ${params.agent}:`, error);
    return NextResponse.json(
      {
        error: 'Failed to fetch agent messages',
        code: 'AGENT_MAILBOX_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
