import { NextRequest, NextResponse } from 'next/server';
import { getAllActivity } from '@/lib/utils/activityParser';
import { ActivityResponse, ActivityEventType } from '@/lib/types/activity';
import { AgentType } from '@/lib/types';
import { VALID_AGENTS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const agent = searchParams.get('agent');
    const type = searchParams.get('type');

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

    if (agent && !VALID_AGENTS.includes(agent as AgentType)) {
      return NextResponse.json(
        {
          error: 'Invalid agent',
          code: 'INVALID_AGENT',
          details: `Agent must be one of: ${VALID_AGENTS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const allEvents = await getAllActivity(limit * 2);

    let filteredEvents = allEvents;

    if (agent) {
      filteredEvents = filteredEvents.filter(event => event.agent === agent);
    }

    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    const total = filteredEvents.length;
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    const response: ActivityResponse = {
      events: paginatedEvents,
      total,
      filtered: total,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch activity',
        code: 'ACTIVITY_FETCH_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
