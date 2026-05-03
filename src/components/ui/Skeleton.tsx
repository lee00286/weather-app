interface SkeletonProps {
  className?: string;
  /** When true, render as a circle (for icon placeholders). */
  circle?: boolean;
}

/**
 * Base skeleton block — pulsing gray rectangle (or circle). Wraps children
 * inside `aria-hidden` regions; the surrounding section should expose status
 * via `role="status"` and screen-reader text.
 */
export function Skeleton({ className = '', circle = false }: SkeletonProps) {
  const radius = circle ? 'rounded-full' : 'rounded';
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 ${radius} ${className}`}
    />
  );
}

/** Skeleton matching the CurrentWeather hero shape. */
export function CurrentWeatherSkeleton() {
  return (
    <section
      aria-label="Loading current weather"
      role="status"
      className="flex flex-col items-center py-2 text-center sm:py-6"
    >
      <span className="sr-only">Loading current weather…</span>
      <Skeleton className="mb-2 h-5 w-32" />
      <Skeleton className="h-16 w-24 md:h-20 md:w-28" />
      <Skeleton className="mt-2 h-4 w-28" />
      <Skeleton className="mt-1 h-4 w-36" />
    </section>
  );
}

/** Skeleton matching the WeatherDetails 4-card grid. */
export function WeatherDetailsSkeleton() {
  return (
    <section aria-label="Loading weather details" role="status">
      <span className="sr-only">Loading weather details…</span>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-1 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 sm:h-20" />
        ))}
      </div>
    </section>
  );
}

/** Skeleton matching the HourlyForecast section (strip + charts). */
export function HourlyForecastSkeleton() {
  return (
    <section aria-label="Loading hourly forecast" role="status" className="space-y-4">
      <span className="sr-only">Loading hourly forecast…</span>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-1 px-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-6 w-6" circle />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[200px] md:h-[280px]" />
      <Skeleton className="h-[120px] md:h-[160px]" />
    </section>
  );
}
