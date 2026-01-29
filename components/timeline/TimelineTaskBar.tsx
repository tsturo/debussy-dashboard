'use client';

import { TimelineTask } from '@/lib/types';
import { BeadStage } from '@/lib/types';

interface TimelineTaskBarProps {
  task: TimelineTask;
  viewStartTime: Date;
  viewEndTime: Date;
  onTaskClick?: (task: TimelineTask) => void;
}

const STAGE_COLORS: Record<BeadStage, string> = {
  planning: 'bg-blue-500 dark:bg-blue-600',
  development: 'bg-purple-500 dark:bg-purple-600',
  testing: 'bg-yellow-500 dark:bg-yellow-600',
  review: 'bg-orange-500 dark:bg-orange-600',
  integration: 'bg-green-500 dark:bg-green-600',
  completed: 'bg-gray-500 dark:bg-gray-600',
};

const STAGE_BORDER_COLORS: Record<BeadStage, string> = {
  planning: 'border-blue-600 dark:border-blue-500',
  development: 'border-purple-600 dark:border-purple-500',
  testing: 'border-yellow-600 dark:border-yellow-500',
  review: 'border-orange-600 dark:border-orange-500',
  integration: 'border-green-600 dark:border-green-500',
  completed: 'border-gray-600 dark:border-gray-500',
};

export function TimelineTaskBar({
  task,
  viewStartTime,
  viewEndTime,
  onTaskClick,
}: TimelineTaskBarProps) {
  const getPositionAndWidth = () => {
    const taskStart = new Date(task.startTime);
    const taskEnd = task.endTime ? new Date(task.endTime) : new Date();

    const viewStart = new Date(viewStartTime);
    const viewEnd = new Date(viewEndTime);

    const totalViewDuration = viewEnd.getTime() - viewStart.getTime();
    const taskStartOffset = taskStart.getTime() - viewStart.getTime();
    const taskDuration = taskEnd.getTime() - taskStart.getTime();

    const leftPercent = Math.max(0, (taskStartOffset / totalViewDuration) * 100);
    const widthPercent = Math.min(
      100 - leftPercent,
      (taskDuration / totalViewDuration) * 100
    );

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const getSegmentWidth = (segmentStartTime: string, segmentEndTime?: string) => {
    const taskStart = new Date(task.startTime);
    const taskEnd = task.endTime ? new Date(task.endTime) : new Date();
    const totalTaskDuration = taskEnd.getTime() - taskStart.getTime();

    const segmentStart = new Date(segmentStartTime);
    const segmentEnd = segmentEndTime ? new Date(segmentEndTime) : new Date();
    const segmentDuration = segmentEnd.getTime() - segmentStart.getTime();

    return (segmentDuration / totalTaskDuration) * 100;
  };

  const taskPosition = getPositionAndWidth();

  return (
    <div
      className="absolute inset-y-0 flex rounded overflow-hidden shadow-sm border border-gray-300 dark:border-gray-600 cursor-pointer hover:shadow-md transition-shadow"
      style={{
        left: taskPosition.left,
        width: taskPosition.width,
      }}
      onClick={() => onTaskClick?.(task)}
    >
      {task.stageSegments.length > 0 ? (
        task.stageSegments.map((segment, segIndex) => {
          const segmentWidth = getSegmentWidth(segment.startTime, segment.endTime);

          return (
            <div
              key={segIndex}
              className={`${STAGE_COLORS[segment.stage]} ${STAGE_BORDER_COLORS[segment.stage]} border-r last:border-r-0 flex items-center justify-center text-white text-xs font-medium px-1`}
              style={{
                width: `${segmentWidth}%`,
              }}
              title={`${segment.stage}${segment.duration ? ` (${Math.round(segment.duration / 60000)}m)` : ''}`}
            >
              {segmentWidth > 10 && (
                <span className="truncate">
                  {segment.stage}
                </span>
              )}
            </div>
          );
        })
      ) : (
        <div
          className={`w-full ${STAGE_COLORS[task.currentStage]} flex items-center justify-center text-white text-xs font-medium`}
          title={task.currentStage}
        >
          {task.currentStage}
        </div>
      )}
    </div>
  );
}
