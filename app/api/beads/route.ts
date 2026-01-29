import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Bead, BeadStatus, AgentType } from '@/lib/types';
import { isValidAgent, isValidBeadStatus, isValidBeadType, sanitizeShellArg } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);

function parseBeadList(output: string): Bead[] {
  const beads: Bead[] = [];
  const lines = output.trim().split('\n');

  for (const line of lines) {
    if (!line.trim() || line.startsWith('─') || line.startsWith('ID')) {
      continue;
    }

    const match = line.match(/^([○●✓◐])\s+([^\s]+)\s+\[(.+?)\]\s+(?:\[(.+?)\]\s+)?(?:@(\S+)\s+)?-\s+(.+)$/);
    if (match) {
      const [, statusSymbol, id, metaPart, typePart, assignee, title] = match;

      let status: BeadStatus = 'open';
      if (statusSymbol === '●' || statusSymbol === '◐') status = 'in_progress';
      if (statusSymbol === '✓') status = 'closed';

      const priorityMatch = metaPart.match(/P(\d+)/);
      const priority = priorityMatch ? parseInt(priorityMatch[1]) : 2;

      const type = (typePart?.toLowerCase() || 'task') as Bead['type'];

      beads.push({
        id,
        title: title.trim(),
        status,
        type,
        priority,
        assignee: assignee && isValidAgent(assignee) ? assignee : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  return beads;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    let command = 'bd list';

    if (status) {
      if (!isValidBeadStatus(status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }
      command += ` --status=${sanitizeShellArg(status)}`;
    }
    if (assignee) {
      if (!isValidAgent(assignee)) {
        return NextResponse.json(
          { error: 'Invalid assignee value' },
          { status: 400 }
        );
      }
      command += ` --assignee=${sanitizeShellArg(assignee)}`;
    }
    if (type) {
      if (!isValidBeadType(type)) {
        return NextResponse.json(
          { error: 'Invalid type value' },
          { status: 400 }
        );
      }
      command += ` --type=${sanitizeShellArg(type)}`;
    }
    if (priority) {
      if (!/^[0-4]$/.test(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority value' },
          { status: 400 }
        );
      }
      command += ` --priority=${priority}`;
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && !stderr.includes('Warning')) {
      console.error('bd list stderr:', stderr);
    }

    const beads = parseBeadList(stdout);

    return NextResponse.json({
      beads,
      total: beads.length,
      filtered: beads.length,
    });
  } catch (error) {
    console.error('Error executing bd list:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch beads',
        code: 'BD_LIST_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
