import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bead } from '@/lib/types';

interface BeadsResponse {
  beads: Bead[];
}

export function useBeads(refetchInterval: number = 3000) {
  return useQuery<BeadsResponse, Error>({
    queryKey: ['beads'],
    queryFn: async () => {
      const response = await fetch('/api/beads');
      if (!response.ok) {
        throw new Error(`Failed to fetch beads: ${response.statusText}`);
      }
      return response.json();
    },
    refetchInterval,
  });
}

export function useReadyBeads(refetchInterval: number = 3000) {
  return useQuery<BeadsResponse, Error>({
    queryKey: ['beads', 'ready'],
    queryFn: async () => {
      const response = await fetch('/api/beads/ready');
      if (!response.ok) {
        throw new Error(`Failed to fetch ready beads: ${response.statusText}`);
      }
      return response.json();
    },
    refetchInterval,
  });
}

export function useBead(id: string | null, refetchInterval: number = 3000) {
  return useQuery<Bead, Error>({
    queryKey: ['beads', id],
    queryFn: async () => {
      if (!id) throw new Error('Bead ID is required');
      const response = await fetch(`/api/beads/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch bead: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id,
    refetchInterval,
  });
}

interface UpdateBeadParams {
  beadId: string;
  updates: Partial<{
    status: 'open' | 'in_progress' | 'closed';
    assignee: string;
    priority: number;
    title: string;
    description: string;
    notes: string;
    design: string;
  }>;
}

export function useUpdateBead() {
  const queryClient = useQueryClient();

  return useMutation<Bead, Error, UpdateBeadParams>({
    mutationFn: async ({ beadId, updates }: UpdateBeadParams) => {
      const response = await fetch(`/api/beads/${beadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update bead');
      }

      const data = await response.json();
      return data.bead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beads'] });
    },
  });
}
