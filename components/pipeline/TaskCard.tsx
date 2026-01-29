'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bead } from '@/lib/types';
import Link from 'next/link';

interface TaskCardProps {
  bead: Bead;
  isDragging?: boolean;
}

const PRIORITY_COLORS: Record<number, string> = {
  0: 'bg-red-100 text-red-800 border-red-300',
  1: 'bg-orange-100 text-orange-800 border-orange-300',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  3: 'bg-blue-100 text-blue-800 border-blue-300',
  4: 'bg-gray-100 text-gray-800 border-gray-300',
};

const TYPE_COLORS: Record<string, string> = {
  task: 'bg-blue-500',
  feature: 'bg-green-500',
  bug: 'bg-red-500',
  refactor: 'bg-purple-500',
  test: 'bg-yellow-500',
  review: 'bg-indigo-500',
  integration: 'bg-pink-500',
};

export function TaskCard({ bead, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: bead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const priorityColor = PRIORITY_COLORS[bead.priority] || PRIORITY_COLORS[2];
  const typeColor = TYPE_COLORS[bead.type] || TYPE_COLORS['task'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-2 border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg border-blue-400 dark:border-blue-500' : ''
      }`}
    >
      <Link href={`/task/${bead.id}`} onClick={(e) => e.stopPropagation()} className="block">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${typeColor}`}></span>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{bead.id}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded border font-medium ${priorityColor}`}>
            P{bead.priority}
          </span>
        </div>

        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{bead.title}</h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bead.assignee && (
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                @{bead.assignee}
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300 capitalize">
              {bead.type}
            </span>
          </div>
        </div>

        {bead.blocked_by && bead.blocked_by.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
              Blocked ({bead.blocked_by.length})
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
