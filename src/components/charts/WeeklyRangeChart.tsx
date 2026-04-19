'use client';

import { DateTime } from 'luxon';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_COLORS } from '@/lib/chartColors';
import type { DailyForecast } from '@/lib/types';

interface WeeklyRangeChartProps {
  days: DailyForecast[];
  timezone: string;
}

interface ChartPoint {
  date: string;
  label: string;
  fullLabel: string;
  low: number;
  high: number;
  range: [number, number];
  avg: number;
}

interface TooltipPayload {
  payload: ChartPoint;
}

function RangeTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-gray-700 dark:bg-gray-900">
      <p className="font-medium text-gray-900 dark:text-gray-50">{point.fullLabel}</p>
      <p className="text-gray-600 dark:text-gray-300">High {Math.round(point.high)}°</p>
      <p className="text-gray-600 dark:text-gray-300">Low {Math.round(point.low)}°</p>
      <p className="text-gray-500 dark:text-gray-400">Avg {Math.round(point.avg)}°</p>
    </div>
  );
}

export function WeeklyRangeChart({ days, timezone }: WeeklyRangeChartProps) {
  if (days.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        No temperature data
      </p>
    );
  }

  const data: ChartPoint[] = days.map((d) => {
    const dt = DateTime.fromISO(d.date, { zone: timezone });
    return {
      date: d.date,
      label: dt.toFormat('EEE'),
      fullLabel: dt.toFormat('EEE, MMM d'),
      low: d.lowTemp,
      high: d.highTemp,
      range: [d.lowTemp, d.highTemp],
      avg: (d.lowTemp + d.highTemp) / 2,
    };
  });

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
        14-day temperature range
      </h4>
      <div role="img" aria-label="14-day temperature range chart" className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyRangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.tempWarm} stopOpacity={0.65} />
                <stop offset="100%" stopColor={CHART_COLORS.tempCold} stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-800"
            />
            <XAxis
              dataKey="date"
              interval={0}
              tickFormatter={(d: string) => data.find((point) => point.date === d)?.label ?? ''}
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
            <Tooltip content={<RangeTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }} />
            <Bar
              dataKey="range"
              fill="url(#weeklyRangeGradient)"
              radius={[4, 4, 4, 4]}
              maxBarSize={18}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke={CHART_COLORS.tempWarm}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
