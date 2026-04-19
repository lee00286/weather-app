'use client';

import { useQuery } from '@tanstack/react-query';

import type { WeatherAlert } from '@/lib/types';

async function fetchAlerts(lat: string, lon: string): Promise<WeatherAlert[]> {
  const params = new URLSearchParams({ lat, lon });
  const response = await fetch(`/api/alerts?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Alerts fetch failed: ${response.status}`);
  }

  return response.json();
}

export function useAlerts(lat: string, lon: string) {
  return useQuery<WeatherAlert[]>({
    queryKey: ['alerts', lat, lon],
    queryFn: () => fetchAlerts(lat, lon),
    enabled: !!lat && !!lon,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
