'use client';

import { BeadStage } from '@/lib/types';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { useBeads, useUpdateBead } from '@/lib/hooks';

export default function PipelinePage() {
  const { data, isLoading, error, isError } = useBeads(3000);
  const updateBead = useUpdateBead();

  const handleBeadUpdate = async (beadId: string, stage: BeadStage) => {
    const stageToStatus = (stage: BeadStage): 'open' | 'in_progress' | 'closed' => {
      switch (stage) {
        case 'planning':
          return 'open';
        case 'development':
        case 'testing':
        case 'review':
        case 'integration':
          return 'in_progress';
        case 'completed':
          return 'closed';
        default:
          return 'open';
      }
    };

    const status = stageToStatus(stage);

    try {
      await updateBead.mutateAsync({
        beadId,
        updates: { status },
      });
    } catch (error) {
      console.error(`Failed to update bead ${beadId}:`, error);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading beads...</div>
      </div>
    );
  }

  if (isError && error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error: {error.message || 'Failed to load beads'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const beads = data?.beads || [];
  const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as Error).message : undefined;

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">Task Pipeline</h1>
        <p className="text-gray-600 mt-1">
          Drag and drop tasks between stages to update their status
        </p>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <KanbanBoard beads={beads} onBeadUpdate={handleBeadUpdate} />
      </div>

      <ConnectionStatus
        isError={isError}
        isLoading={isLoading && !data}
        errorMessage={errorMessage}
      />
    </div>
  );
}
