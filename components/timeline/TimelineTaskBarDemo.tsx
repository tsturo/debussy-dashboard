'use client';

import { TimelineTask } from '@/lib/types';
import { TimelineTaskBar } from './TimelineTaskBar';
import { TimelineLegend } from './TimelineLegend';

export function TimelineTaskBarDemo() {
  const now = Date.now();
  const startTime = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const endTime = new Date(now + 24 * 60 * 60 * 1000).toISOString();

  const mockTasks: TimelineTask[] = [
    {
      beadId: 'debussy-dashboard-001',
      title: 'Implement authentication',
      status: 'in_progress',
      currentStage: 'testing',
      startTime: new Date(now - 20 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      stageSegments: [
        {
          stage: 'planning',
          startTime: new Date(now - 20 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
          duration: 2 * 60 * 60 * 1000,
        },
        {
          stage: 'development',
          startTime: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
          duration: 10 * 60 * 60 * 1000,
        },
        {
          stage: 'testing',
          startTime: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          duration: 6 * 60 * 60 * 1000,
        },
        {
          stage: 'review',
          startTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          duration: 2 * 60 * 60 * 1000,
        },
      ],
      priority: 1,
      type: 'feature',
    },
    {
      beadId: 'debussy-dashboard-002',
      title: 'Fix login bug',
      status: 'closed',
      currentStage: 'completed',
      startTime: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      stageSegments: [
        {
          stage: 'planning',
          startTime: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 11 * 60 * 60 * 1000).toISOString(),
          duration: 1 * 60 * 60 * 1000,
        },
        {
          stage: 'development',
          startTime: new Date(now - 11 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 7 * 60 * 60 * 1000).toISOString(),
          duration: 4 * 60 * 60 * 1000,
        },
        {
          stage: 'testing',
          startTime: new Date(now - 7 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
          duration: 2 * 60 * 60 * 1000,
        },
        {
          stage: 'review',
          startTime: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
          duration: 2 * 60 * 60 * 1000,
        },
        {
          stage: 'completed',
          startTime: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          duration: 1 * 60 * 60 * 1000,
        },
      ],
      priority: 0,
      type: 'bug',
    },
    {
      beadId: 'debussy-dashboard-003',
      title: 'Add dashboard metrics',
      status: 'in_progress',
      currentStage: 'development',
      startTime: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      stageSegments: [
        {
          stage: 'planning',
          startTime: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
          duration: 1 * 60 * 60 * 1000,
        },
        {
          stage: 'development',
          startTime: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
          duration: 5 * 60 * 60 * 1000,
        },
      ],
      priority: 2,
      type: 'feature',
    },
  ];

  return (
    <div className="space-y-6">
      <TimelineLegend />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Task Bar Examples
        </h3>

        <div className="space-y-16">
          {mockTasks.map((task) => (
            <div key={task.beadId} className="relative" style={{ height: '60px' }}>
              <TimelineTaskBar
                task={task}
                startTime={startTime}
                endTime={endTime}
                pixelsPerHour={40}
                rowHeight={40}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How to use TimelineTaskBar
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>Each task bar shows different colored segments for each stage</li>
          <li>Hover over segments to see stage name and duration</li>
          <li>Task title appears above the bar</li>
          <li>Bars scale automatically based on task duration</li>
          <li>Works with any time range (hours, days, weeks)</li>
        </ul>
      </div>
    </div>
  );
}
