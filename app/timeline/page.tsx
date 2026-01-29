'use client';

import { useState, useEffect, useMemo } from 'react';
import { GanttChart } from '@/components/timeline';
import { TimelineTask } from '@/lib/types/timeline';
import { BeadStage } from '@/lib/types/bead';

interface Bead {
  id: string;
  title: string;
  status: string;
  type: string;
  priority: number;
  assignee?: string;
  created_at: string;
  updated_at: string;
}

export default function TimelinePage() {
  const [beads, setBeads] = useState<Bead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBeads() {
      try {
        const response = await fetch('/api/beads');
        if (!response.ok) {
          throw new Error('Failed to fetch beads');
        }
        const data = await response.json();
        setBeads(data.beads || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching beads:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    }

    fetchBeads();
  }, []);

  const timelineTasks = useMemo((): TimelineTask[] => {
    return beads
      .filter(bead => bead.status === 'in_progress' || bead.status === 'closed')
      .map(bead => ({
        beadId: bead.id,
        title: bead.title,
        agent: bead.assignee as any,
        status: bead.status as any,
        currentStage: 'development' as BeadStage,
        startTime: bead.created_at,
        endTime: bead.status === 'closed' ? bead.updated_at : undefined,
        stageSegments: [],
        priority: bead.priority,
        type: bead.type,
      }));
  }, [beads]);

  const { viewStartTime, viewEndTime } = useMemo(() => {
    if (timelineTasks.length === 0) {
      const now = new Date();
      return {
        viewStartTime: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        viewEndTime: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      };
    }

    const allDates = timelineTasks.flatMap(task => [
      new Date(task.startTime),
      task.endTime ? new Date(task.endTime) : new Date(),
    ]);

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    const padding = 2 * 60 * 60 * 1000;

    return {
      viewStartTime: new Date(minDate.getTime() - padding),
      viewEndTime: new Date(maxDate.getTime() + padding),
    };
  }, [timelineTasks]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Timeline / Gantt View</h1>

        <div className="mb-6">
          <GanttChart
            tasks={timelineTasks}
            viewStartTime={viewStartTime}
            viewEndTime={viewEndTime}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tasks Overview</h2>
            {beads.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
            ) : (
              <div className="space-y-2">
                {beads.map((bead) => (
                  <div
                    key={bead.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-200">
                        {bead.id}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {bead.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        bead.status === 'open' ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' :
                        bead.status === 'in_progress' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                        bead.status === 'closed' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' :
                        'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }`}>
                        {bead.status}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-800 rounded text-purple-800 dark:text-purple-200">
                        P{bead.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
