'use client';

import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import type { DailyForecast } from '@/lib/types';

function getMonthDays(year: number, month: number) {
  const first = DateTime.local(year, month, 1);
  const startWeekday = first.weekday; // 1=Mon, 7=Sun
  const daysInMonth = first.daysInMonth!;

  const cells: (number | null)[] = [];
  for (let i = 1; i < startWeekday; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }
  return cells;
}

interface HourlyCalendarProps {
  dailyData: DailyForecast[];
  selectedDate: string;
  todayIso: string;
  onSelectDate: (date: string) => void;
}

export function HourlyCalendar({
  dailyData,
  selectedDate,
  todayIso,
  onSelectDate,
}: HourlyCalendarProps) {
  const initial = DateTime.fromISO(selectedDate);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const monthDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = DateTime.local(viewYear, viewMonth).toFormat('LLLL yyyy');

  const dailyMap = useMemo(() => {
    const map = new Map<string, DailyForecast>();
    for (const day of dailyData) {
      map.set(day.date, day);
    }
    return map;
  }, [dailyData]);

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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
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

      <div className="mb-1 grid grid-cols-7 text-center">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <span key={d} className="py-1 text-xs text-gray-400 dark:text-gray-500">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
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
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center rounded-lg py-1 text-center transition-colors ${
                isSelected
                  ? 'bg-blue-50 ring-1 ring-inset ring-blue-500 dark:bg-blue-900/30 dark:ring-blue-400'
                  : isToday
                    ? 'ring-1 ring-inset ring-blue-300 hover:bg-blue-50/50 dark:ring-blue-600 dark:hover:bg-blue-900/20'
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
  );
}
