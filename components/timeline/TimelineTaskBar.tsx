'use client';

import { TimelineTask, TimelineStageSegment } from '@/lib/types';
import { BeadStage } from '@/lib/types';

interface TimelineTaskBarProps {
  task: TimelineTask;
  startTime: string;
  endTime: string;
  pixelsPerHour: number;
  rowHeight?: number;
  onTaskClick?: (task: TimelineTask) => void;
}

const STAGE_COLORS: Record<BeadStage, string> = {
  planning: 'bg-purple-500',
  development: 'bg-blue-500',
  testing: 'bg-yellow-500',
  review: 'bg-orange-500',
  integration: 'bg-pink-500',
  completed: 'bg-green-500',
};

export function TimelineTaskBar({
  task,
  startTime,
  endTime,
  pixelsPerHour,
  rowHeight = 40,
  onTaskClick,
}: TimelineTaskBarProps) {
  const timelineStart = new Date(startTime).getTime();
  const timelineEnd = new Date(endTime).getTime();
  const taskStart = new Date(task.startTime).getTime();
  const taskEnd = task.endTime ? new Date(task.endTime).getTime() : Date.now();

  const totalHours = (timelineEnd - timelineStart) / (1000 * 60 * 60);
  const taskOffsetHours = (taskStart - timelineStart) / (1000 * 60 * 60);
  const taskDurationHours = (taskEnd - taskStart) / (1000 * 60 * 60);

  const leftPosition = (taskOffsetHours / totalHours) * 100;
  const width = (taskDurationHours / totalHours) * 100;

  const totalTaskDuration = taskEnd - taskStart;

  return (
    <div
      className="absolute flex items-center"
      style={{
        left: `${leftPosition}%`,
        width: `${width}%`,
        height: `${rowHeight}px`,
        top: 0,
      }}
    >
      <div className="relative flex w-full h-6 rounded overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-300 dark:border-gray-600">
        {task.stageSegments.map((segment, index) => {
          const segmentStart = new Date(segment.startTime).getTime();
          const segmentEnd = segment.endTime
            ? new Date(segment.endTime).getTime()
            : Date.now();
          const segmentDuration = segmentEnd - segmentStart;
          const segmentWidth = (segmentDuration / totalTaskDuration) * 100;

          return (
            <div
              key={`${task.beadId}-${segment.stage}-${index}`}
              className={`${STAGE_COLORS[segment.stage]} h-full flex items-center justify-center text-xs text-white font-medium`}
              style={{ width: `${segmentWidth}%` }}
              title={`${segment.stage}: ${(segmentDuration / (1000 * 60 * 60)).toFixed(1)}h`}
            >
              {segmentWidth > 15 && (
                <span className="truncate px-1">{segment.stage}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute -top-6 left-0 text-xs text-gray-700 dark:text-gray-300 truncate max-w-full">
        {task.title}
      </div>
    </div>
  );
}
