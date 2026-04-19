'use client';

import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { PrecipitationChart } from '@/components/charts/PrecipitationChart';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { HourlyCalendar } from '@/components/weather/HourlyCalendar';
import { HourlyStrip } from '@/components/weather/HourlyStrip';
import type { DailyForecast, HourlyForecast as HourlyForecastType } from '@/lib/types';

interface HourlyForecastProps {
  hourlyData: HourlyForecastType[];
  dailyData: DailyForecast[];
  timezone: string;
}

export function HourlyForecast({ hourlyData, dailyData, timezone }: HourlyForecastProps) {
  const todayIso = DateTime.now().setZone(timezone).toISODate()!;
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [showCalendar, setShowCalendar] = useState(false);

  const selectedHours = useMemo(
    () =>
      hourlyData.filter(
        (h) => DateTime.fromISO(h.time, { zone: timezone }).toISODate() === selectedDate,
      ),
    [hourlyData, selectedDate, timezone],
  );

  const isToday = selectedDate === todayIso;
  const heading = isToday
    ? 'Today, hourly'
    : DateTime.fromISO(selectedDate, { zone: timezone }).toFormat('cccc, LLLL d');

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  return (
    <section aria-label="Hourly forecast" className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowCalendar((s) => !s)}
          aria-expanded={showCalendar}
          aria-controls="hourly-calendar"
          className="rounded-full px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
        >
          {showCalendar ? 'Hide calendar' : 'Pick a date'}
        </button>
      </div>

      {showCalendar && (
        <div id="hourly-calendar">
          <HourlyCalendar
            dailyData={dailyData}
            selectedDate={selectedDate}
            todayIso={todayIso}
            onSelectDate={handleSelectDate}
          />
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{heading}</h3>
        <HourlyStrip hours={selectedHours} timezone={timezone} isToday={isToday} />
      </div>

      {selectedHours.length > 0 && (
        <>
          <TemperatureChart hours={selectedHours} timezone={timezone} />
          <PrecipitationChart hours={selectedHours} timezone={timezone} />
        </>
      )}
    </section>
  );
}
