import { Card } from '@/components/ui/Card';
import { getWindDirection, getUvLabel } from '@/lib/timezone';
import type { CurrentWeather } from '@/lib/types';

export function WeatherDetails({ data }: { data: CurrentWeather }) {
  return (
    <section aria-label="Weather details">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-1 sm:gap-3">
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
            <p className="text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">Wind</p>
            <div className="mt-1 sm:mt-0 sm:text-right">
              <p className="text-sm font-medium text-gray-900 sm:text-lg dark:text-gray-50">
                {Math.round(data.windSpeed)}
                <span className="text-[10px] font-normal text-gray-500 sm:text-xs dark:text-gray-400">
                  {' '}
                  km/h
                </span>
              </p>
              <p className="text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">
                {getWindDirection(data.windDirection)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
            <p className="text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">Humidity</p>
            <p className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:text-lg dark:text-gray-50">
              {data.humidity}%
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
            <p className="text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">UV Index</p>
            <div className="mt-1 sm:mt-0 sm:text-right">
              <p className="text-sm font-medium text-gray-900 sm:text-lg dark:text-gray-50">
                {Math.round(data.uvIndex)}
              </p>
              <p className="text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">
                {getUvLabel(data.uvIndex)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
            <p className="text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">Precipitation</p>
            <p className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:text-lg dark:text-gray-50">
              {data.precipitation}
              <span className="text-[10px] font-normal text-gray-500 sm:text-xs dark:text-gray-400">
                {' '}
                mm
              </span>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
