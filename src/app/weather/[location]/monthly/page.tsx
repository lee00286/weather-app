'use client';

import { DateTime } from 'luxon';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMonthlyWeather } from '@/hooks/useMonthlyWeather';
import { useWeather } from '@/hooks/useWeather';
import { stitchMonthlyData } from '@/lib/monthlyStitch';

export default function MonthlyForecast() {
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

  const weatherQuery = useWeather(validLat, validLon);
  const timezone = weatherQuery.data?.timezone ?? '';
  const monthlyQuery = useMonthlyWeather(validLat, validLon, timezone);

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

  if (weatherQuery.isLoading || (weatherQuery.data && monthlyQuery.isLoading)) {
    return <MonthlySkeleton />;
  }

  if (weatherQuery.error || !weatherQuery.data || monthlyQuery.error || !monthlyQuery.data) {
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

  const today = DateTime.now().setZone(weatherQuery.data.timezone);
  const points = stitchMonthlyData(
    today,
    monthlyQuery.data.pastActual,
    weatherQuery.data.daily,
    monthlyQuery.data.historicalBaseline,
  );

  return (
    <div className="space-y-4">
      <Card>
        <MonthlyTrendChart points={points} />
      </Card>
      <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
        Historical average shows daily average temperature from the same calendar range one year
        prior. Days beyond the 16-day forecast horizon appear as gaps.
      </p>
    </div>
  );
}

function MonthlySkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading monthly trend">
      <span className="sr-only">Loading monthly trend…</span>
      <Skeleton className="h-[280px] rounded-2xl" />
    </div>
  );
}
