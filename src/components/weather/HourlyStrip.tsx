'use client';

import { useEffect, useRef } from 'react';
import { DateTime } from 'luxon';

import { getWeatherInfo, getIconEmoji } from '@/lib/weatherCodes';
import { formatHourlyTime } from '@/lib/timezone';
import type { HourlyForecast } from '@/lib/types';

interface HourlyStripProps {
  hours: HourlyForecast[];
  timezone: string;
  /** When true, the card matching the current hour is highlighted as "Now". */
  isToday: boolean;
}

export function HourlyStrip({ hours, timezone, isToday }: HourlyStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nowRef = useRef<HTMLDivElement>(null);
  const currentHour = DateTime.now().setZone(timezone).hour;

  useEffect(() => {
    if (isToday && nowRef.current) {
      nowRef.current.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, [isToday, hours]);

  if (hours.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">No hourly data</p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto py-2"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {hours.map((hour) => {
        const { icon } = getWeatherInfo(hour.weatherCode);
        const hourNum = DateTime.fromISO(hour.time, { zone: timezone }).hour;
        const isNow = isToday && hourNum === currentHour;

        return (
          <div
            key={hour.time}
            ref={isNow ? nowRef : undefined}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 ${
              isNow ? 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-800' : ''
            }`}
            style={{ scrollSnapAlign: 'start' }}
          >
            <span
              className={`text-xs ${
                isNow
                  ? 'font-semibold text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {isNow ? 'Now' : formatHourlyTime(hour.time, timezone)}
            </span>
            <span aria-hidden="true" className="text-lg">
              {getIconEmoji(icon)}
            </span>
            <span
              className={`text-sm font-medium ${
                isNow ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-50'
              }`}
            >
              {Math.round(hour.temperature)}°
            </span>
          </div>
        );
      })}
    </div>
  );
}
