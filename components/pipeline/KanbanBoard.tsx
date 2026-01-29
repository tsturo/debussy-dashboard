'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Bead, BeadStage } from '@/lib/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

const STAGES: BeadStage[] = [
  'planning',
  'development',
  'testing',
  'review',
  'integration',
  'completed',
];

const STAGE_LABELS: Record<BeadStage, string> = {
  planning: 'Planning',
  development: 'Development',
  testing: 'Testing',
  review: 'Review',
  integration: 'Integration',
  completed: 'Done',
};

function getBeadStage(bead: Bead): BeadStage {
  if (bead.status === 'closed') return 'completed';
  if (bead.type === 'review') return 'review';
  if (bead.type === 'test') return 'testing';
  if (bead.type === 'integration') return 'integration';
  if (bead.status === 'in_progress') {
    if (bead.type === 'task' || bead.type === 'feature' || bead.type === 'bug' || bead.type === 'refactor') {
      return 'development';
    }
  }
  return 'planning';
}

interface KanbanBoardProps {
  beads: Bead[];
  onBeadUpdate?: (beadId: string, stage: BeadStage) => void;
}

export function KanbanBoard({ beads, onBeadUpdate }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'created' | 'updated'>('priority');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredBeads = useMemo(() => {
    let filtered = [...beads];

    if (filterPriority !== null) {
      filtered = filtered.filter((b) => b.priority === filterPriority);
    }

    if (filterAssignee) {
      filtered = filtered.filter((b) => b.assignee === filterAssignee);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        return a.priority - b.priority;
      } else if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [beads, filterPriority, filterAssignee, sortBy]);

  const beadsByStage = useMemo(() => {
    const grouped: Record<BeadStage, Bead[]> = {
      planning: [],
      development: [],
      testing: [],
      review: [],
      integration: [],
      completed: [],
    };

    filteredBeads.forEach((bead) => {
      const stage = getBeadStage(bead);
      grouped[stage].push(bead);
    });

    return grouped;
  }, [filteredBeads]);

  const activeBead = activeId ? beads.find((b) => b.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const targetStage = over.id as BeadStage;
      if (STAGES.includes(targetStage)) {
        onBeadUpdate?.(active.id as string, targetStage);
      }
    }

    setActiveId(null);
  };

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    beads.forEach((b) => {
      if (b.assignee) assignees.add(b.assignee);
    });
    return Array.from(assignees).sort();
  }, [beads]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Priority:</label>
            <select
              value={filterPriority ?? ''}
              onChange={(e) => setFilterPriority(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="0">P0</option>
              <option value="1">P1</option>
              <option value="2">P2</option>
              <option value="3">P3</option>
              <option value="4">P4</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Assignee:</label>
            <select
              value={filterAssignee ?? ''}
              onChange={(e) => setFilterAssignee(e.target.value || null)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              {uniqueAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="priority">Priority</option>
              <option value="created">Created Date</option>
              <option value="updated">Updated Date</option>
            </select>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                id={stage}
                title={STAGE_LABELS[stage]}
                beads={beadsByStage[stage]}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeBead ? <TaskCard bead={activeBead} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
