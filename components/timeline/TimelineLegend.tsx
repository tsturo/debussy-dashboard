'use client';

import { BeadStage } from '@/lib/types';

const STAGE_COLORS: Record<BeadStage, string> = {
  planning: 'bg-purple-500',
  development: 'bg-blue-500',
  testing: 'bg-yellow-500',
  review: 'bg-orange-500',
  integration: 'bg-pink-500',
  completed: 'bg-green-500',
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
    <div className="flex items-center gap-4 flex-wrap">
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
