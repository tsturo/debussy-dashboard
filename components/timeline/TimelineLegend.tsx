'use client';

import { BeadStage } from '@/lib/types';

const STAGE_COLORS: Record<BeadStage, string> = {
  planning: 'bg-blue-500 dark:bg-blue-600',
  development: 'bg-purple-500 dark:bg-purple-600',
  testing: 'bg-yellow-500 dark:bg-yellow-600',
  review: 'bg-orange-500 dark:bg-orange-600',
  integration: 'bg-green-500 dark:bg-green-600',
  completed: 'bg-gray-500 dark:bg-gray-600',
};

const STAGE_LABELS: Record<BeadStage, string> = {
  planning: 'Planning',
  development: 'Development',
  testing: 'Testing',
  review: 'Review',
  integration: 'Integration',
  completed: 'Completed',
};

export function TimelineLegend() {
  const stages = Object.keys(STAGE_COLORS) as BeadStage[];

  return (
    <div className="flex items-center gap-4 flex-wrap p-4 bg-gray-50 dark:bg-dark-900 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Stage Legend:
      </span>
      {stages.map((stage) => (
        <div key={stage} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${STAGE_COLORS[stage]}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {STAGE_LABELS[stage]}
          </span>
        </div>
      ))}
    </div>
  );
}
