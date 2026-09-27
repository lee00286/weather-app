import { getAqiCategory } from '@/lib/running/aqi';
import { getRunSafety } from '@/lib/running/runSafety';
import type { RunConditions } from '@/lib/running/types';

export interface HourPoint {
  time: string;
  conditions: RunConditions;
}

export interface BestWindow {
  startTime: string;
  endTime: string;
  feelsLike: number;
  usAqi: number | null;
  note: string;
}

const IDEAL_FEELS_LIKE = 12; // °C — comfortable running temp
const TOLERANCE = 4; // window extends while score stays within this of the anchor

function scoreHour(c: RunConditions): number {
  let score = Math.abs(c.feelsLike - IDEAL_FEELS_LIKE);
  if (getRunSafety(c).rating === 'caution') score += 15;
  if (c.usAqi !== null) score += c.usAqi / 10;
  return score;
}

function buildNote(c: RunConditions): string {
  const parts = [`${Math.round(c.feelsLike)}°`];
  if (c.uvIndex >= 6) parts.push('high UV');
  else parts.push('low UV');
  if (c.usAqi !== null) parts.push(`air ${getAqiCategory(c.usAqi).label.toLowerCase()}`);
  return parts.join(', ');
}

export function getBestWindow(hours: HourPoint[]): BestWindow | null {
  const scored = hours.map((h) => ({
    ...h,
    runnable: getRunSafety(h.conditions).rating !== 'no-go',
    score: scoreHour(h.conditions),
  }));

  const runnable = scored.filter((s) => s.runnable);
  if (runnable.length === 0) return null;

  let anchor = scored.indexOf(runnable[0]);
  for (const s of runnable) {
    const i = scored.indexOf(s);
    if (s.score < scored[anchor].score) anchor = i;
  }

  const limit = scored[anchor].score + TOLERANCE;
  let start = anchor;
  let end = anchor;
  while (start - 1 >= 0 && scored[start - 1].runnable && scored[start - 1].score <= limit) start--;
  while (end + 1 < scored.length && scored[end + 1].runnable && scored[end + 1].score <= limit)
    end++;

  const rep = scored[anchor].conditions;
  return {
    startTime: scored[start].time,
    endTime: scored[end].time,
    feelsLike: rep.feelsLike,
    usAqi: rep.usAqi,
    note: buildNote(rep),
  };
}
