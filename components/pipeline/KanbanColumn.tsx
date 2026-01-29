'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Bead, BeadStage } from '@/lib/types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: BeadStage;
  title: string;
  beads: Bead[];
}

export function KanbanColumn({ id, title, beads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      <div className="bg-gray-100 rounded-t-lg px-4 py-3 border-b-2 border-gray-300">
        <h3 className="font-semibold text-gray-800 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-gray-600 bg-white px-2 py-1 rounded">
            {beads.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-50 rounded-b-lg p-3 space-y-3 min-h-[400px] transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300' : 'border-2 border-transparent'
        }`}
      >
        <SortableContext items={beads.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {beads.map((bead) => (
            <TaskCard key={bead.id} bead={bead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
