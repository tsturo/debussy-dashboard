import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isValidBeadId, sanitizeShellArg, isValidBeadStatus, isValidAgent } from '@/lib/utils';
import { getProjectPath } from '@/lib/utils/paths';

export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);

interface BeadDetails {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'closed';
  type: string;
  priority: number;
  assignee?: string;
  owner?: string;
  created_at: string;
  updated_at: string;
  dependencies?: Array<{ id: string; title: string; status: string }>;
  blocked_by?: Array<{ id: string; title: string; status: string }>;
  blocks?: Array<{ id: string; title: string; status: string }>;
  labels?: string[];
  notes?: string;
  design?: string;
}

function parseBeadShow(output: string, beadId: string): BeadDetails {
  const lines = output.split('\n');

  const bead: BeadDetails = {
    id: beadId,
    title: '',
    status: 'open',
    type: 'task',
    priority: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let section = '';
  let multilineContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^[○◐✓]\s+\S+\s+·/)) {
      const statusSymbol = line[0];
      if (statusSymbol === '◐') bead.status = 'in_progress';
      if (statusSymbol === '✓') bead.status = 'closed';

      const titleMatch = line.match(/·\s+(.+?)\s+\[/);
      if (titleMatch) {
        bead.title = titleMatch[1].trim();
      }

      const priorityMatch = line.match(/P(\d+)/);
      if (priorityMatch) {
        bead.priority = parseInt(priorityMatch[1]);
      }

      const typeMatch = line.match(/\b(task|feature|bug|refactor|test|review|integration)\b/i);
      if (typeMatch) {
        bead.type = typeMatch[1].toLowerCase();
      }
    }

    if (line.startsWith('Owner:')) {
      const parts = line.split('·');
      const ownerMatch = parts[0]?.match(/Owner:\s*(\S+)/);
      if (ownerMatch) bead.owner = ownerMatch[1];

      const assigneeMatch = parts[1]?.match(/Assignee:\s*(\S+)/);
      if (assigneeMatch) bead.assignee = assigneeMatch[1];

      const typeMatch = parts[2]?.match(/Type:\s*(\S+)/);
      if (typeMatch) bead.type = typeMatch[1].toLowerCase();
    }

    if (line.startsWith('Created:')) {
      const dateMatch = line.match(/Created:\s*(\S+)/);
      if (dateMatch) bead.created_at = dateMatch[1];

      const updatedMatch = line.match(/Updated:\s*(\S+)/);
      if (updatedMatch) bead.updated_at = updatedMatch[1];
    }

    if (line === 'DESCRIPTION' || line === 'NOTES' || line === 'DESIGN') {
      if (multilineContent && section) {
        if (section === 'DESCRIPTION') bead.description = multilineContent.trim();
        if (section === 'NOTES') bead.notes = multilineContent.trim();
        if (section === 'DESIGN') bead.design = multilineContent.trim();
      }
      section = line;
      multilineContent = '';
      continue;
    }

    if (line.startsWith('DEPENDS ON') || line.startsWith('BLOCKS') || line.startsWith('BLOCKED BY')) {
      if (multilineContent && section) {
        if (section === 'DESCRIPTION') bead.description = multilineContent.trim();
        if (section === 'NOTES') bead.notes = multilineContent.trim();
        if (section === 'DESIGN') bead.design = multilineContent.trim();
      }
      section = '';
      multilineContent = '';
    }

    if (section && line.trim() && !line.startsWith('DEPENDS ON') && !line.startsWith('BLOCKS')) {
      multilineContent += line + '\n';
    }

    if (line.match(/^\s+[→←]\s+[○◐✓]/)) {
      const depMatch = line.match(/[○◐✓]\s+(\S+):\s+(.+?)\s+[○◐]/);
      if (depMatch) {
        const [, depId, depTitle] = depMatch;
        const statusSymbol = line.match(/[○◐✓]/)?.[0];
        let depStatus = 'open';
        if (statusSymbol === '◐') depStatus = 'in_progress';
        if (statusSymbol === '✓') depStatus = 'closed';

        const dep = { id: depId, title: depTitle.trim(), status: depStatus };

        if (line.includes('→')) {
          if (!bead.dependencies) bead.dependencies = [];
          bead.dependencies.push(dep);
        } else if (line.includes('←')) {
          if (!bead.blocks) bead.blocks = [];
          bead.blocks.push(dep);
        }
      }
    }
  }

  if (multilineContent && section) {
    if (section === 'DESCRIPTION') bead.description = multilineContent.trim();
    if (section === 'NOTES') bead.notes = multilineContent.trim();
    if (section === 'DESIGN') bead.design = multilineContent.trim();
  }

  return bead;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const beadId = params.id;

    if (!isValidBeadId(beadId)) {
      return NextResponse.json(
        { error: 'Invalid bead ID format' },
        { status: 400 }
      );
    }

    const { stdout, stderr } = await execAsync(`bd show ${sanitizeShellArg(beadId)}`, {
      cwd: getProjectPath(),
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && !stderr.includes('Warning')) {
      console.error('bd show stderr:', stderr);
    }

    const bead = parseBeadShow(stdout, beadId);

    return NextResponse.json({
      bead,
      dependencies: bead.dependencies || [],
      blocked_by: bead.blocked_by || [],
      blocks: bead.blocks || [],
    });
  } catch (error) {
    console.error(`Error executing bd show ${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Failed to fetch bead details',
        code: 'BD_SHOW_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const beadId = params.id;

    if (!isValidBeadId(beadId)) {
      return NextResponse.json(
        { error: 'Invalid bead ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = ['status', 'assignee', 'priority', 'title', 'description', 'notes', 'design'];
    const updates: string[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'status' && typeof value === 'string') {
          if (!isValidBeadStatus(value)) {
            return NextResponse.json(
              { error: `Invalid status value: ${value}` },
              { status: 400 }
            );
          }
        }
        if (key === 'assignee' && typeof value === 'string') {
          if (!isValidAgent(value)) {
            return NextResponse.json(
              { error: `Invalid assignee value: ${value}` },
              { status: 400 }
            );
          }
        }
        if (key === 'priority') {
          const priority = typeof value === 'string' ? parseInt(value) : value;
          if (typeof priority !== 'number' || !Number.isInteger(priority) || priority < 0 || priority > 4) {
            return NextResponse.json(
              { error: `Invalid priority value: ${value}` },
              { status: 400 }
            );
          }
        }

        const flag = `--${key}`;
        if (typeof value === 'string') {
          const sanitized = value.replace(/"/g, '\\"');
          updates.push(`${flag}="${sanitized}"`);
        } else {
          updates.push(`${flag}=${value}`);
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const sanitizedBeadId = sanitizeShellArg(beadId);
    const command = `bd update ${sanitizedBeadId} ${updates.join(' ')}`;
    const { stdout, stderr } = await execAsync(command, {
      cwd: getProjectPath(),
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && !stderr.includes('Warning')) {
      console.error('bd update stderr:', stderr);
    }

    const { stdout: showStdout } = await execAsync(`bd show ${sanitizedBeadId}`, {
      cwd: getProjectPath(),
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });

    const bead = parseBeadShow(showStdout, beadId);

    return NextResponse.json({
      bead,
      dependencies: bead.dependencies || [],
      blocked_by: bead.blocked_by || [],
      blocks: bead.blocks || [],
    });
  } catch (error) {
    console.error(`Error updating bead ${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Failed to update bead',
        code: 'BD_UPDATE_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
