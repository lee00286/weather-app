'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';

import { getWeatherInfo, getIconEmoji } from '@/lib/weatherCodes';
import { formatHourlyTime } from '@/lib/timezone';
import type { DailyForecast, HourlyForecast } from '@/lib/types';

function getHoursForDate(
  hours: HourlyForecast[],
  date: string,
  timezone: string,
): HourlyForecast[] {
  return hours.filter((h) => {
    const dt = DateTime.fromISO(h.time, { zone: timezone });
    return dt.toISODate() === date;
  });
}

function getMonthDays(year: number, month: number) {
  const first = DateTime.local(year, month, 1);
  const startWeekday = first.weekday; // 1=Mon, 7=Sun
  const daysInMonth = first.daysInMonth!;

  const cells: (number | null)[] = [];
  // Pad start (Mon=1 based)
  for (let i = 1; i < startWeekday; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }
  return cells;
}

interface HourlyCalendarProps {
  hourlyData: HourlyForecast[];
  dailyData: DailyForecast[];
  timezone: string;
}

export function HourlyStrip({ hourlyData, dailyData, timezone }: HourlyCalendarProps) {
  const now = DateTime.now().setZone(timezone);
  const [viewYear, setViewYear] = useState(now.year);
  const [viewMonth, setViewMonth] = useState(now.month);
  const [selectedDate, setSelectedDate] = useState<string>(now.toISODate()!);

  const monthDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = DateTime.local(viewYear, viewMonth).toFormat('LLLL yyyy');

  // Build a map of date → daily forecast for quick lookup
  const dailyMap = useMemo(() => {
    const map = new Map<string, DailyForecast>();
    for (const day of dailyData) {
      map.set(day.date, day);
    }
    return map;
  }, [dailyData]);

  const todayIso = now.toISODate()!;
  const currentHour = now.hour;

  // Get hourly data for selected date (show all hours, including past)
  const selectedHours = useMemo(
    () => getHoursForDate(hourlyData, selectedDate, timezone),
    [hourlyData, selectedDate, timezone],
  );

  const goToPrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const nowRef = useRef<HTMLDivElement>(null);

  // Scroll to center "Now" when today is selected
  useEffect(() => {
    if (selectedDate === todayIso && nowRef.current) {
      nowRef.current.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, [selectedDate, todayIso, selectedHours]);

  return (
    <section aria-label="Hourly forecast" className="space-y-4">
      {/* Hourly strip for selected date */}
      {selectedHours.length > 0 ? (
        <div>
          <h3 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            {selectedDate === todayIso
              ? 'Today, hourly'
              : DateTime.fromISO(selectedDate, { zone: timezone }).toFormat('cccc, LLLL d')}
          </h3>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto py-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {selectedHours.map((hour, i) => {
              const { icon } = getWeatherInfo(hour.weatherCode);
              const hourNum = DateTime.fromISO(hour.time, { zone: timezone }).hour;
              const isNow = selectedDate === todayIso && hourNum === currentHour;
              return (
                <div
                  key={hour.time}
                  ref={isNow ? nowRef : undefined}
                  className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 ${
                    isNow
                      ? 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-800'
                      : ''
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
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
          No hourly data for {DateTime.fromISO(selectedDate, { zone: timezone }).toFormat('LLLL d')}
        </p>
      )}

      {/* Calendar */}
      <div className="rounded-2xl border border-gray-200 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        {/* Month nav */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Previous month"
          >
            &larr;
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{monthLabel}</span>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Next month"
          >
            &rarr;
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-1 grid grid-cols-7 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d} className="py-1 text-xs text-gray-400 dark:text-gray-500">
              {d}
            </span>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {monthDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} />;
            }

            const dateStr = DateTime.local(viewYear, viewMonth, day).toISODate()!;
            const daily = dailyMap.get(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayIso;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center rounded-lg py-1 text-center transition-colors ${
                  isSelected
                    ? 'bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-900/30 dark:ring-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span
                  className={`text-xs ${
                    isToday
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </span>
                {daily && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {Math.round(daily.highTemp)}°/{Math.round(daily.lowTemp)}°
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
