import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { LogEntry, AgentLogsResponse, LogFilters } from '@/lib/types';
import { VALID_AGENTS, validateLogEntry, isValidAgent, isValidLogLevel, isValidLogCategory } from '@/lib/utils';
import { getLogsPath } from '@/lib/utils/paths';
import { filterLogs, sortLogs } from '@/lib/utils/logFilters';

async function readLogFile(filePath: string): Promise<LogEntry[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    const logs: LogEntry[] = [];
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (validateLogEntry(parsed)) {
          logs.push(parsed);
        } else {
          console.error(`Invalid log entry in ${filePath}`);
        }
      } catch (error) {
        console.error(`Failed to parse log line in ${filePath}:`, error);
      }
    }

    return logs;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

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

    const searchParams = request.nextUrl.searchParams;
    const levels = searchParams.getAll('level');
    const categories = searchParams.getAll('category');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (levels.length > 0) {
      for (const level of levels) {
        if (!isValidLogLevel(level)) {
          return NextResponse.json(
            {
              error: 'Invalid log level',
              code: 'INVALID_LOG_LEVEL',
              details: 'Log level must be: debug, info, warn, or error',
            },
            { status: 400 }
          );
        }
      }
    }

    if (categories.length > 0) {
      for (const category of categories) {
        if (!isValidLogCategory(category)) {
          return NextResponse.json(
            {
              error: 'Invalid log category',
              code: 'INVALID_LOG_CATEGORY',
              details: 'Category must be: system, task, communication, error, or performance',
            },
            { status: 400 }
          );
        }
      }
    }

    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        {
          error: 'Invalid limit',
          code: 'INVALID_LIMIT',
          details: 'Limit must be between 1 and 1000',
        },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        {
          error: 'Invalid offset',
          code: 'INVALID_OFFSET',
          details: 'Offset must be non-negative',
        },
        { status: 400 }
      );
    }

    const logsPath = getLogsPath(agent);

    let allLogs: LogEntry[] = [];
    try {
      const files = await fs.readdir(logsPath);
      const jsonlFiles = files.filter(f => f.endsWith('.jsonl')).sort();

      for (const file of jsonlFiles) {
        const filePath = path.join(logsPath, file);
        const logs = await readLogFile(filePath);
        allLogs.push(...logs);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    const filters: LogFilters = {};
    if (levels.length > 0) filters.level = levels.length === 1 ? levels[0] as any : levels as any;
    if (categories.length > 0) filters.category = categories.length === 1 ? categories[0] as any : categories as any;
    if (from) filters.from = from;
    if (to) filters.to = to;
    if (search) filters.search = search;

    let filteredLogs = filterLogs(allLogs, filters);
    filteredLogs = sortLogs(filteredLogs, 'desc');

    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    const response: AgentLogsResponse = {
      agent,
      logs: paginatedLogs,
      count: filteredLogs.length,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching logs for agent ${params.agent}:`, error);
    return NextResponse.json(
      {
        error: 'Failed to fetch agent logs',
        code: 'AGENT_LOGS_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
