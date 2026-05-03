'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import {
  CurrentWeatherSkeleton,
  HourlyForecastSkeleton,
  WeatherDetailsSkeleton,
} from '@/components/ui/Skeleton';
import { AlertBanner } from '@/components/weather/AlertBanner';
import { CurrentWeather } from '@/components/weather/CurrentWeather';
import { HourlyForecast } from '@/components/weather/HourlyForecast';
import { NoticeCard } from '@/components/weather/NoticeCard';
import { WeatherDetails } from '@/components/weather/WeatherDetails';
import { useAlerts } from '@/hooks/useAlerts';
import { useWeather } from '@/hooks/useWeather';
import { getSeasonalNotices } from '@/lib/seasonalNotices';

function decodeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DailyDashboard() {
  const params = useParams<{ location: string }>();
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

  const { data, isLoading, error } = useWeather(validLat, validLon);
  const { data: alerts } = useAlerts(validLat, validLon);

  const locationName = decodeSlug(params.location ?? '');

  const temperature = data?.current.temperature;
  const uvIndex = data?.current.uvIndex;

  const notices = useMemo(() => {
    if (temperature === undefined || uvIndex === undefined) {
      return [];
    }

    return getSeasonalNotices(locationName, { temperature, uvIndex }, new Date());
  }, [temperature, uvIndex, locationName]);

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
      <div className="space-y-4">
        <div className="grid items-center gap-4 sm:grid-cols-2">
          <CurrentWeatherSkeleton />
          <WeatherDetailsSkeleton />
        </div>
        <HourlyForecastSkeleton />
      </div>
    );
  }

  if (error || !data) {
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

  return (
    <div className="space-y-4">
      {alerts && alerts.length > 0 && <AlertBanner alerts={alerts} />}

      <div className="grid items-center gap-4 sm:grid-cols-2">
        <CurrentWeather data={data.current} timezone={data.timezone} />
        <WeatherDetails data={data.current} />
      </div>

      {notices.length > 0 && <NoticeCard notices={notices} />}

      <HourlyForecast hourlyData={data.hourly} dailyData={data.daily} timezone={data.timezone} />
    </div>
  );
}
