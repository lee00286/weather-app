import { DateTime } from 'luxon';

import { activeAlertsAt } from '@/lib/running/alerts';
import type { HourPoint } from '@/lib/running/bestWindow';
import type { AirQuality, WeatherAlert, WeatherData } from '@/lib/types';

// Build today's remaining HourPoints, aligning AQI by ISO time (fallback usAqi = null),
// deriving isDay per hour from that day's sunrise/sunset, and attaching the government
// weather alerts active at each hour.
export function buildHours(
  weather: WeatherData,
  aqi: AirQuality | undefined,
  alerts: WeatherAlert[],
  timezone: string,
): HourPoint[] {
  const aqiByTime = new Map((aqi?.hourly ?? []).map((h) => [h.time, h.usAqi]));
  const dailyByDate = new Map(weather.daily.map((d) => [d.date, d]));
  const now = DateTime.now().setZone(timezone);

  return weather.hourly
    .filter((h) => {
      const t = DateTime.fromISO(h.time, { zone: timezone });
      return t.hasSame(now, 'day') && t >= now.startOf('hour');
    })
    .map((h) => {
      const t = DateTime.fromISO(h.time, { zone: timezone });
      const day = dailyByDate.get(t.toFormat('yyyy-MM-dd'));
      const isDay = day
        ? t >= DateTime.fromISO(day.sunrise, { zone: timezone }) &&
          t < DateTime.fromISO(day.sunset, { zone: timezone })
        : true;

      return {
        time: h.time,
        conditions: {
          feelsLike: h.feelsLike,
          temperature: h.temperature,
          humidity: h.humidity,
          windSpeed: h.windSpeed,
          uvIndex: h.uvIndex,
          precipitation: h.precipitation,
          weatherCode: h.weatherCode,
          usAqi: aqiByTime.get(h.time) ?? null,
          isDay,
          activeAlerts: activeAlertsAt(alerts, h.time, timezone),
        },
      };
    });
}
