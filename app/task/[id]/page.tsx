'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BeadDependency {
  id: string;
  title: string;
  status: string;
}

interface BeadDetails {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'closed';
  type: string;
  priority: number;
  assignee?: string;
  owner?: string;
  created_at: string;
  updated_at: string;
  dependencies?: BeadDependency[];
  blocked_by?: BeadDependency[];
  blocks?: BeadDependency[];
  labels?: string[];
  notes?: string;
  design?: string;
}

interface BeadDetailResponse {
  bead: BeadDetails;
  dependencies: BeadDependency[];
  blocked_by: BeadDependency[];
  blocks: BeadDependency[];
}

const PRIORITY_COLORS: Record<number, string> = {
  0: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  1: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
  2: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
  3: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  4: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600',
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

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600',
  in_progress: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  closed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
};

const STATUS_SYMBOLS: Record<string, string> = {
  open: '○',
  in_progress: '●',
  closed: '✓',
};

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<BeadDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const fetchBead = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/beads/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bead details');
      }
      const result: BeadDetailResponse = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchBead();
  }, [fetchBead]);

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = async (field: string) => {
    if (!data) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/beads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: editValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bead');
      }

      await fetchBead();
      setEditingField(null);
      setEditValue('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!data) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/beads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchBead();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <span>Loading task details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h2 className="text-red-800 dark:text-red-300 font-semibold mb-2">Error</h2>
            <p className="text-red-600 dark:text-red-400">{error || 'Failed to load task details'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { bead, dependencies, blocked_by, blocks } = data;
  const priorityColor = PRIORITY_COLORS[bead.priority] || PRIORITY_COLORS[2];
  const typeColor = TYPE_COLORS[bead.type] || TYPE_COLORS['task'];
  const statusColor = STATUS_COLORS[bead.status] || STATUS_COLORS['open'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-800 dark:to-gray-950 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full ${typeColor}`}></span>
                <h1 className="text-2xl font-bold">{bead.title}</h1>
              </div>
              <span className={`text-xs px-3 py-1 rounded border font-medium ${priorityColor}`}>
                P{bead.priority}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300 dark:text-gray-400">
              <span className="font-mono">{bead.id}</span>
              <span>•</span>
              <span className="capitalize">{bead.type}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Status</label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded border text-sm font-medium ${statusColor}`}>
                    {STATUS_SYMBOLS[bead.status]} {bead.status.replace('_', ' ')}
                  </span>
                  {!updating && (
                    <div className="flex gap-1">
                      {bead.status !== 'open' && (
                        <button
                          onClick={() => updateStatus('open')}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          Reopen
                        </button>
                      )}
                      {bead.status !== 'in_progress' && (
                        <button
                          onClick={() => updateStatus('in_progress')}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
                        >
                          Start
                        </button>
                      )}
                      {bead.status !== 'closed' && (
                        <button
                          onClick={() => updateStatus('closed')}
                          className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 rounded"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Assignee</label>
                <div className="flex items-center gap-2">
                  {bead.assignee ? (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">@{bead.assignee}</span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">Unassigned</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Owner</label>
                <span className="text-sm text-gray-700 dark:text-gray-300">{bead.owner || 'N/A'}</span>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Priority</label>
                <span className={`px-3 py-1 rounded border text-sm font-medium ${priorityColor}`}>
                  P{bead.priority}
                </span>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Created</label>
                <span className="text-sm text-gray-700 dark:text-gray-300">{bead.created_at}</span>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Updated</label>
                <span className="text-sm text-gray-700 dark:text-gray-300">{bead.updated_at}</span>
              </div>
            </div>

            {bead.description && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Description</label>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {bead.description}
                </div>
              </div>
            )}

            {bead.notes && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Notes</label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {bead.notes}
                </div>
              </div>
            )}

            {bead.design && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Design</label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {bead.design}
                </div>
              </div>
            )}

            {dependencies.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-3">
                  Dependencies ({dependencies.length})
                </label>
                <div className="space-y-2">
                  {dependencies.map((dep) => (
                    <Link
                      key={dep.id}
                      href={`/task/${dep.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-lg">{STATUS_SYMBOLS[dep.status]}</span>
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{dep.id}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{dep.title}</span>
                      <span className={`text-xs px-2 py-1 rounded border ${STATUS_COLORS[dep.status]}`}>
                        {dep.status.replace('_', ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {blocked_by.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-red-600 dark:text-red-400 block mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Blocked By ({blocked_by.length})
                </label>
                <div className="space-y-2">
                  {blocked_by.map((dep) => (
                    <Link
                      key={dep.id}
                      href={`/task/${dep.id}`}
                      className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
                    >
                      <span className="text-lg">{STATUS_SYMBOLS[dep.status]}</span>
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{dep.id}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{dep.title}</span>
                      <span className={`text-xs px-2 py-1 rounded border ${STATUS_COLORS[dep.status]}`}>
                        {dep.status.replace('_', ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {blocks.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-3">
                  Blocks ({blocks.length})
                </label>
                <div className="space-y-2">
                  {blocks.map((dep) => (
                    <Link
                      key={dep.id}
                      href={`/task/${dep.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-lg">{STATUS_SYMBOLS[dep.status]}</span>
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{dep.id}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{dep.title}</span>
                      <span className={`text-xs px-2 py-1 rounded border ${STATUS_COLORS[dep.status]}`}>
                        {dep.status.replace('_', ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {bead.labels && bead.labels.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Labels</label>
                <div className="flex flex-wrap gap-2">
                  {bead.labels.map((label) => (
                    <span
                      key={label}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm border border-purple-300 dark:border-purple-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
