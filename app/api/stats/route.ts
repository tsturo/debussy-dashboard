import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);

interface SystemStats {
  total_beads: number;
  beads_by_status: {
    open: number;
    in_progress: number;
    closed: number;
    blocked: number;
  };
  beads_by_priority: {
    [key: string]: number;
  };
  beads_by_type: {
    [key: string]: number;
  };
  ready_tasks: number;
}

function parseBeadStats(output: string): SystemStats {
  const stats: SystemStats = {
    total_beads: 0,
    beads_by_status: {
      open: 0,
      in_progress: 0,
      closed: 0,
      blocked: 0,
    },
    beads_by_priority: {},
    beads_by_type: {},
    ready_tasks: 0,
  };

  const lines = output.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.match(/Total Issues:/)) {
      const match = trimmedLine.match(/(\d+)/);
      if (match) stats.total_beads = parseInt(match[1]);
    }

    if (trimmedLine.match(/^Open:/)) {
      const match = trimmedLine.match(/(\d+)/);
      if (match) stats.beads_by_status.open = parseInt(match[1]);
    }

    if (trimmedLine.match(/In Progress:/)) {
      const match = trimmedLine.match(/(\d+)/);
      if (match) stats.beads_by_status.in_progress = parseInt(match[1]);
    }

    if (trimmedLine.match(/^Closed:/)) {
      const match = trimmedLine.match(/(\d+)/);
      if (match) stats.beads_by_status.closed = parseInt(match[1]);
    }

    if (trimmedLine.match(/^Blocked:/)) {
      const match = trimmedLine.match(/(\d+)/);
      if (match) stats.beads_by_status.blocked = parseInt(match[1]);
    }

    if (trimmedLine.match(/Ready to Work:/)) {
      const match = trimmedLine.match(/(\d+)/);
      if (match) stats.ready_tasks = parseInt(match[1]);
    }
  }

  return stats;
}

export async function GET(request: NextRequest) {
  try {
    const { stdout, stderr } = await execAsync('bd stats', {
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && !stderr.includes('Warning')) {
      console.error('bd stats stderr:', stderr);
    }

    const stats = parseBeadStats(stdout);

    return NextResponse.json({
      system_state: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error executing bd stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch statistics',
        code: 'BD_STATS_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
