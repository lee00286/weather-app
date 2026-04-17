'use client';

import { useQuery } from '@tanstack/react-query';

import type { WeatherData } from '@/lib/types';

async function fetchWeather(lat: string, lon: string): Promise<WeatherData> {
  const params = new URLSearchParams({ lat, lon, tz: 'auto' });
  const response = await fetch(`/api/weather?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.status}`);
  }

  return response.json();
}

export function useWeather(lat: string, lon: string) {
  return useQuery<WeatherData>({
    queryKey: ['weather', lat, lon],
    queryFn: () => fetchWeather(lat, lon),
    enabled: !!lat && !!lon,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
