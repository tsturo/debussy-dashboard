import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getProjectPath } from '@/lib/utils/paths';

export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);

interface ReadyBead {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  type: string;
  priority: number;
  assignee?: string;
}

function parseBeadReady(output: string): ReadyBead[] {
  const beads: ReadyBead[] = [];
  const lines = output.trim().split('\n');

  for (const line of lines) {
    if (!line.trim() || line.includes('Ready work') || line.includes('📋')) {
      continue;
    }

    const match = line.match(/^\d+\.\s+\[([●○✓◐])\s+P(\d+)\]\s+\[(\w+)\]\s+([^:]+):\s+(.+)/);
    if (match) {
      const [, statusSymbol, priorityStr, type, id, title] = match;

      let status: 'open' | 'in_progress' | 'closed' = 'open';
      if (statusSymbol === '●' || statusSymbol === '◐') status = 'in_progress';
      if (statusSymbol === '✓') status = 'closed';

      const priority = parseInt(priorityStr);

      const nextLineIdx = lines.indexOf(line) + 1;
      let assignee: string | undefined;
      if (nextLineIdx < lines.length) {
        const assigneeMatch = lines[nextLineIdx].match(/Assignee:\s+(\S+)/);
        if (assigneeMatch) {
          assignee = assigneeMatch[1];
        }
      }

      beads.push({
        id: id.trim(),
        title: title.trim(),
        status,
        type: type.toLowerCase(),
        priority,
        assignee,
      });
    }
  }

  return beads;
}

export async function GET(request: NextRequest) {
  try {
    const { stdout, stderr } = await execAsync('bd ready', {
      cwd: getProjectPath(),
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && !stderr.includes('Warning')) {
      console.error('bd ready stderr:', stderr);
    }

    const readyBeads = parseBeadReady(stdout);

    return NextResponse.json({
      ready_beads: readyBeads,
      count: readyBeads.length,
    });
  } catch (error) {
    console.error('Error executing bd ready:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch ready beads',
        code: 'BD_READY_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
