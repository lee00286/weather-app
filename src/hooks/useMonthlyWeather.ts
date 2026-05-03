'use client';

import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';

import { getMonthlyRange } from '@/lib/monthlyStitch';
import type { DailyForecast } from '@/lib/types';

interface MonthlyArchive {
  pastActual: DailyForecast[];
  historicalBaseline: DailyForecast[];
}

async function fetchHistory(
  lat: string,
  lon: string,
  tz: string,
  startDate: string,
  endDate: string,
): Promise<DailyForecast[]> {
  const params = new URLSearchParams({ lat, lon, tz, start_date: startDate, end_date: endDate });
  const response = await fetch(`/api/history?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`History fetch failed: ${response.status}`);
  }

  return response.json();
}

async function fetchMonthlyArchive(
  lat: string,
  lon: string,
  timezone: string,
): Promise<MonthlyArchive> {
  const today = DateTime.now().setZone(timezone);
  const { start, end } = getMonthlyRange(today);

  // Past-actual window: from 30 days ago up to yesterday (archive doesn't include today reliably).
  const pastStart = start.toFormat('yyyy-MM-dd');
  const pastEnd = today.minus({ days: 1 }).toFormat('yyyy-MM-dd');

  // Historical baseline window: same calendar range, one year prior.
  const baselineStart = start.minus({ years: 1 }).toFormat('yyyy-MM-dd');
  const baselineEnd = end.minus({ years: 1 }).toFormat('yyyy-MM-dd');

  const [pastActual, historicalBaseline] = await Promise.all([
    fetchHistory(lat, lon, timezone, pastStart, pastEnd),
    fetchHistory(lat, lon, timezone, baselineStart, baselineEnd),
  ]);

  return { pastActual, historicalBaseline };
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function useMonthlyWeather(lat: string, lon: string, timezone: string) {
  return useQuery<MonthlyArchive>({
    queryKey: ['monthly-archive', lat, lon, timezone],
    queryFn: () => fetchMonthlyArchive(lat, lon, timezone),
    enabled: !!lat && !!lon && !!timezone,
    staleTime: DAY_MS,
    gcTime: DAY_MS,
  });
}
