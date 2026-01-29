import { useQuery } from '@tanstack/react-query';
import { StatsResponse } from '@/lib/types';

export function useStats(refetchInterval: number = 5000) {
  return useQuery<StatsResponse, Error>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      return response.json();
    },
    refetchInterval,
  });
}
