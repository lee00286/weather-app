'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function WeatherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center py-12 text-center">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
        Unable to load this view
      </h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        Something went wrong while loading the weather. You can retry or pick another location.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
        >
          Retry
        </button>
        <Link
          href="/"
          className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-50 dark:hover:bg-gray-900 dark:focus-visible:ring-blue-400"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
