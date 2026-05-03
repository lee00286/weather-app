'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_COLORS } from '@/lib/chartColors';
import type { MonthlyPoint } from '@/lib/monthlyStitch';

interface MonthlyTrendChartProps {
  points: MonthlyPoint[];
}

interface TooltipPayload {
  payload: MonthlyPoint;
}

const HISTORICAL_COLOR = '#9ca3af'; // gray-400

function formatTemp(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value)}°`;
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-gray-700 dark:bg-gray-900">
      <p className="font-medium text-gray-900 dark:text-gray-50">{point.fullLabel}</p>
      <p className="text-gray-600 dark:text-gray-300">Actual {formatTemp(point.actual)}</p>
      <p className="text-gray-500 dark:text-gray-400">
        Historical avg {formatTemp(point.historical)}
      </p>
    </div>
  );
}

export function MonthlyTrendChart({ points }: MonthlyTrendChartProps) {
  if (points.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        No temperature data
      </p>
    );
  }

  // Show every ~5th date label to keep the x-axis readable for a ~30-45 day range.
  const tickStep = Math.max(1, Math.floor(points.length / 6));
  const ticks = points.filter((_, i) => i % tickStep === 0).map((p) => p.date);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
        Monthly temperature trend
      </h4>
      <div role="img" aria-label="Monthly temperature trend chart" className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-800"
            />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={(d: string) => points.find((p) => p.date === d)?.label ?? ''}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'currentColor' }}
              tickFormatter={(t: number) => `${Math.round(t)}°`}
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              width={32}
            />
            <Tooltip content={<TrendTooltip />} />
            <Legend
              verticalAlign="top"
              height={24}
              iconType="plainline"
              wrapperStyle={{ fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke={CHART_COLORS.tempWarm}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="historical"
              name="Historical avg"
              stroke={HISTORICAL_COLOR}
              strokeWidth={1}
              strokeDasharray="4 3"
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
