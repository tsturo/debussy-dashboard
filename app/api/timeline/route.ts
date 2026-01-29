import { NextRequest, NextResponse } from 'next/server';
import { getTimelineData } from '@/lib/utils/timelineParser';
import { TimelineResponse } from '@/lib/types';
import { isValidAgent } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const agent = searchParams.get('agent');
    const status = searchParams.get('status');
    const hours = searchParams.get('hours');

    if (agent && !isValidAgent(agent)) {
      return NextResponse.json(
        {
          error: 'Invalid agent',
          code: 'INVALID_AGENT',
          details: 'Agent must be a valid agent name',
        },
        { status: 400 }
      );
    }

    if (status && !['open', 'in_progress', 'closed'].includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status',
          code: 'INVALID_STATUS',
          details: 'Status must be one of: open, in_progress, closed',
        },
        { status: 400 }
      );
    }

    const hoursNum = hours ? parseInt(hours, 10) : undefined;
    if (hours && (isNaN(hoursNum!) || hoursNum! < 1 || hoursNum! > 720)) {
      return NextResponse.json(
        {
          error: 'Invalid hours',
          code: 'INVALID_HOURS',
          details: 'Hours must be between 1 and 720 (30 days)',
        },
        { status: 400 }
      );
    }

    const tasks = await getTimelineData(
      agent || undefined,
      status || undefined,
      hoursNum
    );

    let startTime = new Date().toISOString();
    let endTime = new Date().toISOString();

    if (tasks.length > 0) {
      const times = tasks.map(t => new Date(t.startTime).getTime());
      const endTimes = tasks
        .filter(t => t.endTime)
        .map(t => new Date(t.endTime!).getTime());

      startTime = new Date(Math.min(...times)).toISOString();
      endTime = endTimes.length > 0
        ? new Date(Math.max(...endTimes)).toISOString()
        : new Date().toISOString();
    }

    const response: TimelineResponse = {
      tasks,
      total: tasks.length,
      startTime,
      endTime,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch timeline data',
        code: 'TIMELINE_FETCH_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
