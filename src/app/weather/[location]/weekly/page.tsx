'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { WeeklyPrecipitationChart } from '@/components/charts/WeeklyPrecipitationChart';
import { WeeklyRangeChart } from '@/components/charts/WeeklyRangeChart';
import { Card } from '@/components/ui/Card';
import { WeeklyList } from '@/components/weather/WeeklyList';
import { useWeather } from '@/hooks/useWeather';

export default function WeeklyForecast() {
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
    return <WeeklySkeleton />;
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
      <WeeklyList days={data.daily} timezone={data.timezone} />

      <Card>
        <WeeklyRangeChart days={data.daily} timezone={data.timezone} />
      </Card>

      <Card>
        <WeeklyPrecipitationChart days={data.daily} timezone={data.timezone} />
      </Card>
    </div>
  );
}

function WeeklySkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/80 p-4 shadow backdrop-blur dark:bg-gray-900/80">
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
      <div className="h-[240px] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-[160px] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
