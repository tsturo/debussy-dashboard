'use client';

import { TimelineTask, TimelineStageSegment } from '@/lib/types/timeline';
import { BeadStage } from '@/lib/types/bead';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface GanttChartProps {
  tasks: TimelineTask[];
  viewStartTime: Date;
  viewEndTime: Date;
}

const stageColors: Record<BeadStage, string> = {
  planning: 'bg-blue-500 dark:bg-blue-600',
  development: 'bg-purple-500 dark:bg-purple-600',
  testing: 'bg-yellow-500 dark:bg-yellow-600',
  review: 'bg-orange-500 dark:bg-orange-600',
  integration: 'bg-green-500 dark:bg-green-600',
  completed: 'bg-gray-500 dark:bg-gray-600',
};

const stageBorderColors: Record<BeadStage, string> = {
  planning: 'border-blue-600 dark:border-blue-500',
  development: 'border-purple-600 dark:border-purple-500',
  testing: 'border-yellow-600 dark:border-yellow-500',
  review: 'border-orange-600 dark:border-orange-500',
  integration: 'border-green-600 dark:border-green-500',
  completed: 'border-gray-600 dark:border-gray-500',
};

export function GanttChart({ tasks, viewStartTime, viewEndTime }: GanttChartProps) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<TimelineTask | null>(null);

  const { hours, totalHours } = useMemo(() => {
    const hours: Date[] = [];
    const start = new Date(viewStartTime);
    const end = new Date(viewEndTime);

    start.setMinutes(0, 0, 0);

    let current = new Date(start);
    while (current <= end) {
      hours.push(new Date(current));
      current.setHours(current.getHours() + 1);
    }

    return {
      hours,
      totalHours: hours.length,
    };
  }, [viewStartTime, viewEndTime]);

  const getPositionAndWidth = (startTime: string, endTime?: string) => {
    const taskStart = new Date(startTime);
    const taskEnd = endTime ? new Date(endTime) : new Date();

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

  const formatHour = (date: Date) => {
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${month}/${day} ${hours.toString().padStart(2, '0')}:00`;
  };

  const handleTaskClick = (task: TimelineTask) => {
    setSelectedTask(task);
  };

  const handleNavigateToPipeline = () => {
    router.push('/pipeline');
  };

  const handleNavigateToTask = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  const handleClosePopup = () => {
    setSelectedTask(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 dark:text-dark-400">No tasks to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1200px]">
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
            <div className="flex">
              <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 dark:border-dark-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-200">
                  Task
                </h3>
              </div>
              <div className="flex-1 relative">
                <div className="flex h-full">
                  {hours.map((hour, index) => (
                    <div
                      key={index}
                      className="flex-1 px-2 py-4 text-xs text-gray-600 dark:text-dark-300 border-r border-gray-200 dark:border-dark-700 text-center"
                      style={{ minWidth: `${100 / totalHours}%` }}
                    >
                      {formatHour(hour)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-dark-700">
            {tasks.map((task) => {
              const taskPosition = getPositionAndWidth(task.startTime, task.endTime);

              return (
                <div key={task.beadId} className="flex hover:bg-gray-50 dark:hover:bg-dark-900/50 transition-colors">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 dark:border-dark-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-dark-400">
                        {task.beadId}
                      </span>
                      {task.agent && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {task.agent}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 relative p-4">
                    <div className="relative h-8">
                      <div className="absolute inset-y-0 left-0 right-0 flex">
                        {hours.map((_, index) => (
                          <div
                            key={index}
                            className="flex-1 border-r border-gray-100 dark:border-dark-800"
                            style={{ minWidth: `${100 / totalHours}%` }}
                          />
                        ))}
                      </div>

                      <div
                        className="absolute inset-y-0 flex rounded overflow-hidden shadow-sm border border-gray-300 dark:border-dark-600"
                        style={{
                          left: taskPosition.left,
                          width: taskPosition.width,
                        }}
                      >
                        {task.stageSegments.length > 0 ? (
                          task.stageSegments.map((segment, segIndex) => {
                            const segmentPos = getPositionAndWidth(
                              segment.startTime,
                              segment.endTime
                            );
                            const taskWidth = parseFloat(taskPosition.width);
                            const segmentWidth = (parseFloat(segmentPos.width) / taskWidth) * 100;

                            return (
                              <div
                                key={segIndex}
                                className={`${stageColors[segment.stage]} border-r ${stageBorderColors[segment.stage]} last:border-r-0 flex items-center justify-center text-white text-xs font-medium px-1`}
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
                            className={`w-full ${stageColors[task.currentStage]} flex items-center justify-center text-white text-xs font-medium`}
                            title={task.currentStage}
                          >
                            {task.currentStage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
