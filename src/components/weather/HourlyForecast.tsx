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

  return (
    <section aria-label="Hourly forecast" className="space-y-4">
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

      <HourlyCalendar
        dailyData={dailyData}
        selectedDate={selectedDate}
        todayIso={todayIso}
        onSelectDate={setSelectedDate}
      />
    </section>
  );
}
