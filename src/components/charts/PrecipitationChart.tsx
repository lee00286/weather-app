'use client';

import { DateTime } from 'luxon';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CHART_COLORS } from '@/lib/chartColors';
import type { HourlyForecast } from '@/lib/types';

interface PrecipitationChartProps {
  hours: HourlyForecast[];
  timezone: string;
}

interface ChartPoint {
  index: number;
  time: string;
  label: string;
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
      <p className="font-medium text-gray-900 dark:text-gray-50">{point.label}</p>
      <p className="text-gray-600 dark:text-gray-300">{Math.round(point.probability)}% chance</p>
      <p className="text-gray-500 dark:text-gray-400">{point.precipitation.toFixed(1)} mm</p>
    </div>
  );
}

export function PrecipitationChart({ hours, timezone }: PrecipitationChartProps) {
  if (hours.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        No precipitation data
      </p>
    );
  }

  const data: ChartPoint[] = hours.map((h, i) => {
    const dt = DateTime.fromISO(h.time, { zone: timezone });
    return {
      index: i,
      time: h.time,
      label: dt.toFormat('h a'),
      probability: h.precipitationProbability,
      precipitation: h.precipitation,
    };
  });

  const ticks = data.filter((d) => d.index % 3 === 0).map((d) => d.index);

  return (
    <div
      role="img"
      aria-label="Hourly precipitation chart"
      className="h-[120px] w-full md:h-[160px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-800"
          />
          <XAxis
            dataKey="index"
            type="number"
            domain={[0, data.length - 1]}
            ticks={ticks}
            tickFormatter={(i: number) => data[i]?.label ?? ''}
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
            width={36}
          />
          <Tooltip content={<PrecipTooltip />} cursor={{ fill: 'rgba(96, 165, 250, 0.1)' }} />
          <Bar dataKey="probability" fill={CHART_COLORS.precipRain} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
