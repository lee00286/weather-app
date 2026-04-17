import { Card } from '@/components/ui/Card';
import { getWindDirection, getUvLabel } from '@/lib/timezone';
import type { CurrentWeather } from '@/lib/types';

export function WeatherDetails({ data }: { data: CurrentWeather }) {
  return (
    <section aria-label="Weather details">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-50">
            {Math.round(data.windSpeed)} km/h
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getWindDirection(data.windDirection)}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-50">
            {data.humidity}%
          </p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">UV Index</p>
          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-50">
            {Math.round(data.uvIndex)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{getUvLabel(data.uvIndex)}</p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Precipitation</p>
          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-50">
            {data.precipitation} mm
          </p>
        </Card>
      </div>
    </section>
  );
}
