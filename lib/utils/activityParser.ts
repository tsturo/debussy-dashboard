import fs from 'fs/promises';
import path from 'path';
import { ActivityEvent, ActivityEventType, AgentCurrentStatus } from '@/lib/types/activity';
import { AgentType, LogEntry, Message, Bead } from '@/lib/types';
import { getLogsPath, getMailboxPath, getProjectPath } from './paths';
import { VALID_AGENTS } from './index';

export async function parseLogsForActivity(limit: number = 100): Promise<ActivityEvent[]> {
  const events: ActivityEvent[] = [];

  for (const agent of VALID_AGENTS) {
    try {
      const logsPath = getLogsPath(agent);
      const files = await fs.readdir(logsPath);
      const jsonlFiles = files.filter(f => f.endsWith('.jsonl')).sort().reverse();

      for (const file of jsonlFiles.slice(0, 2)) {
        const filePath = path.join(logsPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const log: LogEntry = JSON.parse(line);

            let type: ActivityEventType = 'log';
            if (log.level === 'error') type = 'error';
            if (log.category === 'task') {
              if (log.message.toLowerCase().includes('start')) type = 'task_started';
              else if (log.message.toLowerCase().includes('complet')) type = 'task_completed';
              else if (log.message.toLowerCase().includes('fail')) type = 'task_failed';
            }

            events.push({
              id: log.id,
              timestamp: log.timestamp,
              agent: log.agent,
              type,
              message: log.message,
              taskId: log.context?.bead_id,
              beadId: log.context?.bead_id,
              metadata: log.context,
            });
          } catch (error) {
          }
        }
      }
    } catch (error) {
    }
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events.slice(0, limit);
}

export async function parseMessagesForActivity(limit: number = 50): Promise<ActivityEvent[]> {
  const events: ActivityEvent[] = [];

  for (const agent of VALID_AGENTS) {
    try {
      const mailboxPath = getMailboxPath(agent);
      const files = await fs.readdir(mailboxPath);
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();

      for (const file of jsonFiles.slice(0, 10)) {
        const filePath = path.join(mailboxPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const message: Message = JSON.parse(content);

        events.push({
          id: message.id,
          timestamp: message.created_at,
          agent: message.sender,
          type: 'message_sent',
          message: `${message.sender} → ${message.recipient}: ${message.subject}`,
          beadId: message.bead_id || undefined,
          metadata: {
            recipient: message.recipient,
            subject: message.subject,
            priority: message.priority,
          },
        });
      }
    } catch (error) {
    }
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events.slice(0, limit);
}

export async function parseBeadsForActivity(limit: number = 50): Promise<ActivityEvent[]> {
  const events: ActivityEvent[] = [];

  try {
    const beadsPath = path.join(getProjectPath(), '.beads');
    const files = await fs.readdir(beadsPath);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();

    for (const file of jsonFiles.slice(0, 20)) {
      const filePath = path.join(beadsPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const bead: Bead = JSON.parse(content);

      let type: ActivityEventType = 'bead_updated';
      const beadAge = Date.now() - new Date(bead.created_at).getTime();
      if (beadAge < 60000) {
        type = 'bead_created';
      } else if (bead.status === 'closed') {
        type = 'bead_closed';
      }

      const agent = bead.assignee || ('conductor' as AgentType);

      events.push({
        id: `${bead.id}-${bead.updated_at}`,
        timestamp: bead.updated_at,
        agent,
        type,
        message: `${type.replace('bead_', '').replace('_', ' ')}: ${bead.title}`,
        beadId: bead.id,
        metadata: {
          status: bead.status,
          priority: bead.priority,
          assignee: bead.assignee,
        },
      });
    }
  } catch (error) {
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events.slice(0, limit);
}

export async function getAllActivity(limit: number = 100): Promise<ActivityEvent[]> {
  const [logEvents, messageEvents, beadEvents] = await Promise.all([
    parseLogsForActivity(limit),
    parseMessagesForActivity(limit / 2),
    parseBeadsForActivity(limit / 2),
  ]);

  const allEvents = [...logEvents, ...messageEvents, ...beadEvents];
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return allEvents.slice(0, limit);
}

export async function getAgentStatus(): Promise<AgentCurrentStatus[]> {
  const statuses: AgentCurrentStatus[] = [];

  for (const agent of VALID_AGENTS) {
    try {
      const logsPath = getLogsPath(agent);
      const files = await fs.readdir(logsPath);
      const jsonlFiles = files.filter(f => f.endsWith('.jsonl')).sort().reverse();

      let lastActive = new Date(0).toISOString();
      let status: 'idle' | 'working' | 'error' = 'idle';
      let currentTask: string | undefined;
      let taskCount = 0;

      if (jsonlFiles.length > 0) {
        const latestFile = path.join(logsPath, jsonlFiles[0]);
        const content = await fs.readFile(latestFile, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines.slice(-20)) {
          try {
            const log: LogEntry = JSON.parse(line);
            const logTime = new Date(log.timestamp);
            if (logTime > new Date(lastActive)) {
              lastActive = log.timestamp;
            }

            if (log.level === 'error') {
              status = 'error';
            }

            if (log.category === 'task') {
              taskCount++;
              if (log.message.toLowerCase().includes('start') ||
                  log.message.toLowerCase().includes('working')) {
                status = 'working';
                currentTask = log.context?.bead_id || log.message;
              }
            }
          } catch (error) {
          }
        }
      }

      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if (new Date(lastActive).getTime() < fiveMinutesAgo) {
        status = 'idle';
        currentTask = undefined;
      }

      const mailboxPath = getMailboxPath(agent);
      let inboxCount = 0;
      try {
        const mailboxFiles = await fs.readdir(mailboxPath);
        inboxCount = mailboxFiles.filter(f => f.endsWith('.json')).length;
      } catch (error) {
      }

      statuses.push({
        name: agent,
        status,
        currentTask,
        lastActive,
        taskCount,
        inboxCount,
      });
    } catch (error) {
      statuses.push({
        name: agent,
        status: 'idle',
        lastActive: new Date(0).toISOString(),
        taskCount: 0,
        inboxCount: 0,
      });
    }
  }

  return statuses;
}
