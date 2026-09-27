'use client';

import { useQuery } from '@tanstack/react-query';

import type { AirQuality } from '@/lib/types';

async function fetchAirQuality(lat: string, lon: string): Promise<AirQuality> {
  const params = new URLSearchParams({ lat, lon, tz: 'auto' });
  const response = await fetch(`/api/air-quality?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Air quality fetch failed: ${response.status}`);
  }
  return response.json();
}

export function useAirQuality(lat: string, lon: string) {
  return useQuery<AirQuality>({
    queryKey: ['air-quality', lat, lon],
    queryFn: () => fetchAirQuality(lat, lon),
    enabled: !!lat && !!lon,
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
}
