import { exec } from 'child_process';
import { promisify } from 'util';
import { TimelineTask, TimelineStageSegment, BeadStage, ActivityEvent } from '@/lib/types';
import { getAllActivity, parseBeadsForActivity } from './activityParser';
import { getProjectPath } from './paths';

const execAsync = promisify(exec);

function inferStageFromStatus(status: string, events: ActivityEvent[]): BeadStage {
  const recentEvents = events.slice(0, 10);

  for (const event of recentEvents) {
    const msg = event.message.toLowerCase();
    if (msg.includes('review') || msg.includes('pr')) return 'review';
    if (msg.includes('test')) return 'testing';
    if (msg.includes('integrat')) return 'integration';
  }

  if (status === 'closed') return 'completed';
  if (status === 'in_progress') return 'development';
  return 'planning';
}

function calculateStageSegments(
  beadId: string,
  events: ActivityEvent[],
  startTime: string,
  endTime?: string
): TimelineStageSegment[] {
  const beadEvents = events.filter(e => e.beadId === beadId).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (beadEvents.length === 0) {
    return [{
      stage: 'planning',
      startTime,
      endTime,
      duration: endTime ? new Date(endTime).getTime() - new Date(startTime).getTime() : undefined,
    }];
  }

  const segments: TimelineStageSegment[] = [];
  let currentStage: BeadStage = 'planning';
  let stageStartTime = startTime;

  for (const event of beadEvents) {
    const msg = event.message.toLowerCase();
    let newStage: BeadStage | null = null;

    if (msg.includes('start') || msg.includes('in_progress')) {
      newStage = 'development';
    } else if (msg.includes('test')) {
      newStage = 'testing';
    } else if (msg.includes('review') || msg.includes('pr')) {
      newStage = 'review';
    } else if (msg.includes('integrat') || msg.includes('merge')) {
      newStage = 'integration';
    } else if (msg.includes('complet') || msg.includes('closed')) {
      newStage = 'completed';
    }

    if (newStage && newStage !== currentStage) {
      segments.push({
        stage: currentStage,
        startTime: stageStartTime,
        endTime: event.timestamp,
        duration: new Date(event.timestamp).getTime() - new Date(stageStartTime).getTime(),
      });
      currentStage = newStage;
      stageStartTime = event.timestamp;
    }
  }

  segments.push({
    stage: currentStage,
    startTime: stageStartTime,
    endTime,
    duration: endTime ? new Date(endTime).getTime() - new Date(stageStartTime).getTime() : undefined,
  });

  return segments;
}

export async function getTimelineData(
  agent?: string,
  status?: string,
  hours?: number
): Promise<TimelineTask[]> {
  const tasks: TimelineTask[] = [];

  let command = 'bd list --status=open,in_progress,closed';
  if (status) {
    command = `bd list --status=${status}`;
  }
  if (agent) {
    command += ` --assignee=${agent}`;
  }

  try {
    const { stdout } = await execAsync(command, {
      cwd: getProjectPath(),
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });

    const lines = stdout.trim().split('\n');
    const beadIds: string[] = [];

    for (const line of lines) {
      if (!line.trim() || line.startsWith('─') || line.startsWith('ID')) {
        continue;
      }

      const match = line.match(/^([○●✓◐])\s+([^\s]+)/);
      if (match) {
        beadIds.push(match[2]);
      }
    }

    const allEvents = await getAllActivity(500);
    const now = new Date();
    const cutoffTime = hours ? new Date(now.getTime() - hours * 60 * 60 * 1000) : new Date(0);

    for (const beadId of beadIds) {
      try {
        const { stdout: showOutput } = await execAsync(`bd show ${beadId}`, {
          cwd: getProjectPath(),
          timeout: 5000,
        });

        const titleMatch = showOutput.match(/^[○●✓◐]\s+[^\s]+\s+·\s+(.+?)\s+\[/m);
        const statusMatch = showOutput.match(/\[.*?·\s*(OPEN|IN_PROGRESS|CLOSED)\]/m);
        const ownerMatch = showOutput.match(/Owner:\s*(\S+)/m);
        const typeMatch = showOutput.match(/Type:\s*(\S+)/m);
        const createdMatch = showOutput.match(/Created:\s*([\d-]+)/m);
        const updatedMatch = showOutput.match(/Updated:\s*([\d-]+)/m);
        const priorityMatch = showOutput.match(/P(\d+)/m);

        if (!titleMatch || !statusMatch || !createdMatch) continue;

        const title = titleMatch[1];
        const beadStatus = statusMatch[1].toLowerCase() as 'open' | 'in_progress' | 'closed';
        const assignee = ownerMatch?.[1];
        const type = typeMatch?.[1] || 'task';
        const priority = priorityMatch ? parseInt(priorityMatch[1]) : 2;

        const createdDate = new Date(createdMatch[1] + 'T00:00:00.000Z');
        const updatedDate = updatedMatch ? new Date(updatedMatch[1] + 'T00:00:00.000Z') : createdDate;
        const startTime = createdDate.toISOString();
        const updateTime = updatedDate.toISOString();
        const endTime = beadStatus === 'closed' ? updateTime : undefined;

        if (new Date(startTime) < cutoffTime && !endTime) {
          continue;
        }

        const beadEvents = allEvents.filter(e => e.beadId === beadId);
        const currentStage = inferStageFromStatus(beadStatus, beadEvents);
        const stageSegments = calculateStageSegments(beadId, allEvents, startTime, endTime);

        const duration = endTime
          ? new Date(endTime).getTime() - new Date(startTime).getTime()
          : Date.now() - new Date(startTime).getTime();

        tasks.push({
          beadId,
          title,
          agent: assignee as any,
          status: beadStatus,
          currentStage,
          startTime,
          endTime,
          duration,
          stageSegments,
          priority,
          type,
        });
      } catch (error) {
      }
    }

    tasks.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return tasks;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw error;
  }
}
