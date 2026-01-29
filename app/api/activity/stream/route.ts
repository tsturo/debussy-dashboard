import { NextRequest } from 'next/server';
import { getAllActivity } from '@/lib/utils/activityParser';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agent = searchParams.get('agent');
  const type = searchParams.get('type');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastTimestamp = new Date().toISOString();

      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const poll = async () => {
        try {
          let events = await getAllActivity(50);

          events = events.filter(event => event.timestamp > lastTimestamp);

          if (agent) {
            events = events.filter(event => event.agent === agent);
          }

          if (type) {
            events = events.filter(event => event.type === type);
          }

          if (events.length > 0) {
            sendEvent({
              type: 'activity',
              events,
              timestamp: new Date().toISOString(),
            });

            lastTimestamp = events[0].timestamp;
          }
        } catch (error) {
          sendEvent({
            type: 'error',
            message: error instanceof Error ? error.message : String(error),
          });
        }
      };

      sendEvent({ type: 'connected', timestamp: new Date().toISOString() });

      const interval = setInterval(poll, 2000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
