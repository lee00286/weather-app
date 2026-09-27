'use client';

import { DateTime } from 'luxon';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { BestWindowCallout } from '@/components/running/BestWindowCallout';
import { ClothingCard } from '@/components/running/ClothingCard';
import { RunHourlyStrip } from '@/components/running/RunHourlyStrip';
import { RunStatus } from '@/components/running/RunStatus';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAirQuality } from '@/hooks/useAirQuality';
import { useAlerts } from '@/hooks/useAlerts';
import { useWeather } from '@/hooks/useWeather';
import { activeAlertsAt } from '@/lib/running/alerts';
import { getBestWindow } from '@/lib/running/bestWindow';
import { getClothing } from '@/lib/running/clothing';
import { getRunSafety } from '@/lib/running/runSafety';
import type { RunConditions } from '@/lib/running/types';

import { buildHours } from './buildHours';

export default function RunningPage() {
  const searchParams = useSearchParams();
  const lat = searchParams.get('lat') ?? '';
  const lon = searchParams.get('lon') ?? '';

  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  const isValidCoords =
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLon) &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLon >= -180 &&
    parsedLon <= 180;

  const validLat = isValidCoords ? lat : '';
  const validLon = isValidCoords ? lon : '';

  const { data: weather, isLoading, error } = useWeather(validLat, validLon);
  const { data: airQuality } = useAirQuality(validLat, validLon);
  const { data: alerts } = useAlerts(validLat, validLon);

  if (!isValidCoords) {
    return (
      <div className="flex flex-col items-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">Invalid or missing coordinates.</p>
        <Link
          href="/"
          className="mt-3 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
        >
          Back to search
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading running conditions">
        <span className="sr-only">Loading running conditions…</span>
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex flex-col items-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">Unable to load weather data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const usAqi = airQuality?.currentUsAqi ?? null;
  const alertList = alerts ?? [];
  const nowIso = DateTime.now().setZone(weather.timezone).toISO() ?? '';
  const now: RunConditions = {
    feelsLike: weather.current.feelsLike,
    temperature: weather.current.temperature,
    humidity: weather.current.humidity,
    windSpeed: weather.current.windSpeed,
    uvIndex: weather.current.uvIndex,
    precipitation: weather.current.precipitation,
    weatherCode: weather.current.weatherCode,
    usAqi,
    isDay: weather.current.isDay,
    activeAlerts: activeAlertsAt(alertList, nowIso, weather.timezone),
  };

  const safety = getRunSafety(now);
  const clothing = getClothing(now);
  const hours = buildHours(weather, airQuality, alertList, weather.timezone);
  const bestWindow = getBestWindow(hours);

  return (
    <div className="space-y-4">
      <RunStatus safety={safety} feelsLike={now.feelsLike} usAqi={usAqi} />
      <ClothingCard recommendation={clothing} />
      {bestWindow && <BestWindowCallout window={bestWindow} timezone={weather.timezone} />}
      {hours.length > 0 && (
        <Card>
          <RunHourlyStrip hours={hours} timezone={weather.timezone} />
        </Card>
      )}
    </div>
  );
}
