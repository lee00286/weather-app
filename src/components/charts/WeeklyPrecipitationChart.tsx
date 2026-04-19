'use client';

import { DateTime } from 'luxon';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CHART_COLORS } from '@/lib/chartColors';
import type { DailyForecast } from '@/lib/types';

interface WeeklyPrecipitationChartProps {
  days: DailyForecast[];
  timezone: string;
}

interface ChartPoint {
  date: string;
  label: string;
  fullLabel: string;
  probability: number;
  precipitation: number;
}

interface TooltipPayload {
  payload: ChartPoint;
}

function PrecipTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-gray-700 dark:bg-gray-900">
      <p className="font-medium text-gray-900 dark:text-gray-50">{point.fullLabel}</p>
      <p className="text-gray-600 dark:text-gray-300">{Math.round(point.probability)}% chance</p>
      <p className="text-gray-500 dark:text-gray-400">{point.precipitation.toFixed(1)} mm</p>
    </div>
  );
}

export function WeeklyPrecipitationChart({ days, timezone }: WeeklyPrecipitationChartProps) {
  if (days.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        No precipitation data
      </p>
    );
  }

  const data: ChartPoint[] = days.map((d) => {
    const dt = DateTime.fromISO(d.date, { zone: timezone });
    return {
      date: d.date,
      label: dt.toFormat('EEE'),
      fullLabel: dt.toFormat('EEE, MMM d'),
      probability: d.precipitationProbability,
      precipitation: d.precipitationSum,
    };
  });

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
        Daily precipitation chance
      </h4>
      <div
        role="img"
        aria-label="14-day precipitation chart"
        className="h-[120px] w-full md:h-[160px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              width={44}
            />
            <Tooltip content={<PrecipTooltip />} cursor={{ fill: 'rgba(96, 165, 250, 0.1)' }} />
            <Bar dataKey="probability" fill={CHART_COLORS.precipRain} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
