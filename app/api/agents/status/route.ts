import { NextRequest, NextResponse } from 'next/server';
import { getAgentStatus } from '@/lib/utils/activityParser';
import { AgentStatusResponse } from '@/lib/types/activity';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agents = await getAgentStatus();

    const response: AgentStatusResponse = {
      agents,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching agent status:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch agent status',
        code: 'AGENT_STATUS_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
