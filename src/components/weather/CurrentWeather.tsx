import { getWeatherInfo, getIconEmoji } from '@/lib/weatherCodes';
import type { CurrentWeather as CurrentWeatherData } from '@/lib/types';

export function CurrentWeather({ data }: { data: CurrentWeatherData; timezone: string }) {
  const { label, icon } = getWeatherInfo(data.weatherCode);

  return (
    <section aria-label="Current weather" className="flex flex-col items-center py-6">
      <div className="mb-1 flex items-center gap-2 text-base text-gray-600 dark:text-gray-300">
        <span aria-hidden="true">{getIconEmoji(icon)}</span>
        <span>{label}</span>
      </div>
      <p className="text-6xl font-light text-gray-900 dark:text-gray-50 md:text-7xl">
        {Math.round(data.temperature)}°
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Feels like {Math.round(data.feelsLike)}°
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        H: {Math.round(data.highTemp)}° L: {Math.round(data.lowTemp)}°
      </p>
    </section>
  );
}
