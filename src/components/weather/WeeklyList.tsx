'use client';

import { DateTime } from 'luxon';

import { Card } from '@/components/ui/Card';
import type { DailyForecast } from '@/lib/types';
import { getIconEmoji, getWeatherInfo } from '@/lib/weatherCodes';

interface WeeklyListProps {
  days: DailyForecast[];
  timezone: string;
}

function formatDayLabel(date: string, timezone: string, index: number): string {
  const dt = DateTime.fromISO(date, { zone: timezone });
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return dt.toFormat('EEE, MMM d');
}

export function WeeklyList({ days, timezone }: WeeklyListProps) {
  if (days.length === 0) {
    return (
      <Card>
        <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
          No forecast available
        </p>
      </Card>
    );
  }

  return (
    <Card className="!p-0">
      <ul aria-label="14-day forecast" className="divide-y divide-gray-200 dark:divide-gray-800">
        {days.map((day, index) => {
          const info = getWeatherInfo(day.weatherCode);
          const emoji = getIconEmoji(info.icon);
          const isToday = index === 0;
          return (
            <li
              key={day.date}
              aria-current={isToday ? 'date' : undefined}
              className={`grid grid-cols-[5.5rem_2rem_1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[6.5rem_2rem_1fr_auto] ${
                isToday
                  ? 'rounded-t-2xl bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-800'
                  : ''
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  isToday
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-gray-50'
                }`}
              >
                {formatDayLabel(day.date, timezone, index)}
              </span>
              <span aria-label={info.label} role="img" className="text-xl leading-none">
                {emoji}
              </span>
              <span
                className={`text-sm ${
                  isToday ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-50'
                }`}
              >
                {Math.round(day.highTemp)}°
                <span className="text-gray-400 dark:text-gray-500"> / </span>
                <span className="text-gray-500 dark:text-gray-400">{Math.round(day.lowTemp)}°</span>
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                <span aria-hidden="true">💧 </span>
                {Math.round(day.precipitationProbability)}%
                <span className="sr-only"> chance of precipitation</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
