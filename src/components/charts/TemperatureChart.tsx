'use client';

import { DateTime } from 'luxon';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_COLORS } from '@/lib/chartColors';
import type { HourlyForecast } from '@/lib/types';

interface TemperatureChartProps {
  hours: HourlyForecast[];
  timezone: string;
}

interface ChartPoint {
  index: number;
  time: string;
  label: string;
  temperature: number;
  feelsLike: number;
}

interface TooltipPayload {
  payload: ChartPoint;
}

function TempTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-gray-700 dark:bg-gray-900">
      <p className="font-medium text-gray-900 dark:text-gray-50">{point.label}</p>
      <p className="text-gray-600 dark:text-gray-300">{Math.round(point.temperature)}°</p>
      <p className="text-gray-500 dark:text-gray-400">Feels like {Math.round(point.feelsLike)}°</p>
    </div>
  );
}

export function TemperatureChart({ hours, timezone }: TemperatureChartProps) {
  if (hours.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        No temperature data
      </p>
    );
  }

  const data: ChartPoint[] = hours.map((h, i) => {
    const dt = DateTime.fromISO(h.time, { zone: timezone });
    return {
      index: i,
      time: h.time,
      label: dt.toFormat('h a'),
      temperature: h.temperature,
      feelsLike: h.feelsLike,
    };
  });

  const ticks = data.filter((d) => d.index % 3 === 0).map((d) => d.index);

  return (
    <div role="img" aria-label="Hourly temperature chart" className="h-[200px] w-full md:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.tempWarm} stopOpacity={0.6} />
              <stop offset="100%" stopColor={CHART_COLORS.tempCold} stopOpacity={0.15} />
            </linearGradient>
          </defs>
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
            tick={{ fontSize: 11, fill: 'currentColor' }}
            tickFormatter={(t: number) => `${Math.round(t)}°`}
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
            width={36}
          />
          <Tooltip content={<TempTooltip />} />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke={CHART_COLORS.tempWarm}
            strokeWidth={2}
            fill="url(#tempGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
