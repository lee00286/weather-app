import { DateTime } from 'luxon';

import type { DailyForecast } from '@/lib/types';

export interface MonthlyPoint {
  date: string; // YYYY-MM-DD in location timezone
  label: string; // short label for x-axis (e.g. "Apr 1")
  fullLabel: string; // tooltip label (e.g. "Mon, Apr 1")
  actual: number | null; // daily avg temp, null = gap (beyond forecast horizon)
  historical: number | null; // same day-of-year, prior year (pragmatic baseline)
}

// Monthly view date range: past 30 days ending today, through the last day of the current
// calendar month. This matches the implementation plan's "past 30 days + remaining days of
// current month (projected via forecast, up to ~16 days ahead)".
export function getMonthlyRange(today: DateTime): { start: DateTime; end: DateTime } {
  const start = today.minus({ days: 30 }).startOf('day');
  const end = today.endOf('month').startOf('day');
  return { start, end };
}

function avgTemp(d: DailyForecast): number {
  return (d.highTemp + d.lowTemp) / 2;
}

// Build a map from YYYY-MM-DD → average temp for quick lookup.
function indexByDate(days: DailyForecast[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of days) {
    map.set(d.date, avgTemp(d));
  }
  return map;
}

// Stitch past historical + forecast into a single monthly series.
// - Past days (before today): read from `pastActual` (archive API response)
// - Today + upcoming (within forecast horizon): read from `forecastDaily`
// - Beyond forecast horizon: actual = null (renders as a gap in the line)
// - Historical baseline: same calendar day, one year prior (pragmatic approximation)
export function stitchMonthlyData(
  today: DateTime,
  pastActual: DailyForecast[],
  forecastDaily: DailyForecast[],
  historicalBaseline: DailyForecast[],
): MonthlyPoint[] {
  const { start, end } = getMonthlyRange(today);
  const zone = today.zone;
  const todayKey = today.toFormat('yyyy-MM-dd');

  const pastMap = indexByDate(pastActual);
  const forecastMap = indexByDate(forecastDaily);
  const baselineMap = indexByDate(historicalBaseline);

  const points: MonthlyPoint[] = [];
  let cursor = start;

  while (cursor <= end) {
    const key = cursor.toFormat('yyyy-MM-dd');
    const isPast = key < todayKey;
    const isTodayOrFuture = key >= todayKey;

    let actual: number | null = null;
    if (isPast && pastMap.has(key)) {
      actual = pastMap.get(key)!;
    } else if (isTodayOrFuture && forecastMap.has(key)) {
      actual = forecastMap.get(key)!;
    }

    // Historical baseline: look up the same calendar day one year prior.
    const priorYearKey = cursor.minus({ years: 1 }).toFormat('yyyy-MM-dd');
    const historical = baselineMap.has(priorYearKey) ? baselineMap.get(priorYearKey)! : null;

    points.push({
      date: key,
      label: cursor.setZone(zone).toFormat('MMM d'),
      fullLabel: cursor.setZone(zone).toFormat('EEE, MMM d'),
      actual,
      historical,
    });

    cursor = cursor.plus({ days: 1 });
  }

  return points;
}
