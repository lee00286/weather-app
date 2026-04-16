'use client';

import { useQuery } from '@tanstack/react-query';

import type { LocationSearchResult } from '@/lib/types';

async function fetchSearchResults(query: string): Promise<LocationSearchResult[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

export function useLocationSearch(query: string) {
  return useQuery<LocationSearchResult[]>({
    queryKey: ['location-search', query],
    queryFn: () => fetchSearchResults(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
