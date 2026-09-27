/**
 * Unit tests for buildHours (colocated helper of the running page).
 *
 * Determinism: freeze the Luxon clock to 2026-08-31T00:30 UTC so all of that
 * day's hours are "today, now-or-later" and survive the filter. This lets us
 * assert the per-hour isDay derivation directly without DOM rendering.
 */
import { Settings } from 'luxon';

const FIXED_NOW_MS = new Date('2026-08-31T00:30:00.000Z').getTime();
Settings.now = () => FIXED_NOW_MS;

import { buildHours } from '@/app/weather/[location]/running/buildHours';
import type { WeatherData } from '@/lib/types';

function hour(time: string): WeatherData['hourly'][number] {
  return {
    time,
    temperature: 14,
    feelsLike: 14,
    weatherCode: 0,
    precipitationProbability: 0,
    precipitation: 0,
    windSpeed: 5,
    windDirection: 200,
    uvIndex: 2,
    humidity: 50,
  };
}

function weatherWith(hourly: WeatherData['hourly'], daily: WeatherData['daily']): WeatherData {
  return {
    current: {
      temperature: 14,
      feelsLike: 14,
      weatherCode: 0,
      humidity: 50,
      windSpeed: 5,
      windDirection: 200,
      precipitation: 0,
      pressure: 1012,
      uvIndex: 2,
      highTemp: 18,
      lowTemp: 9,
      isDay: true,
    },
    hourly,
    daily,
    timezone: 'UTC',
    locationName: 'Test City',
  };
}

const dailyEntry: WeatherData['daily'][number] = {
  date: '2026-08-31',
  weatherCode: 0,
  highTemp: 18,
  lowTemp: 9,
  feelsLikeHigh: 18,
  feelsLikeLow: 9,
  precipitationSum: 0,
  precipitationProbability: 0,
  windSpeedMax: 10,
  uvIndexMax: 5,
  sunrise: '2026-08-31T06:00',
  sunset: '2026-08-31T20:00',
};

describe('buildHours isDay derivation', () => {
  it('marks a daytime hour (between sunrise and sunset) as isDay true', () => {
    const weather = weatherWith([hour('2026-08-31T09:00')], [dailyEntry]);
    const result = buildHours(weather, undefined, [], 'UTC');
    expect(result).toHaveLength(1);
    expect(result[0].conditions.isDay).toBe(true);
  });

  it('marks a nighttime hour (after sunset) as isDay false', () => {
    const weather = weatherWith([hour('2026-08-31T22:00')], [dailyEntry]);
    const result = buildHours(weather, undefined, [], 'UTC');
    expect(result).toHaveLength(1);
    expect(result[0].conditions.isDay).toBe(false);
  });

  it('treats sunrise as day (inclusive) and sunset as night (exclusive)', () => {
    const weather = weatherWith([hour('2026-08-31T06:00'), hour('2026-08-31T20:00')], [dailyEntry]);
    const result = buildHours(weather, undefined, [], 'UTC');
    const byTime = new Map(result.map((r) => [r.time, r.conditions.isDay]));
    expect(byTime.get('2026-08-31T06:00')).toBe(true); // sunrise → day
    expect(byTime.get('2026-08-31T20:00')).toBe(false); // sunset → night
  });

  it('falls back to isDay true when no matching daily entry exists', () => {
    const weather = weatherWith([hour('2026-08-31T22:00')], []);
    const result = buildHours(weather, undefined, [], 'UTC');
    expect(result).toHaveLength(1);
    expect(result[0].conditions.isDay).toBe(true);
  });

  it('aligns AQI by ISO time and falls back to null when absent', () => {
    const weather = weatherWith([hour('2026-08-31T09:00'), hour('2026-08-31T10:00')], [dailyEntry]);
    const aqi = {
      currentUsAqi: 30,
      hourly: [{ time: '2026-08-31T09:00', usAqi: 42, pm25: 5, pm10: 10 }],
      timezone: 'UTC',
    };
    const result = buildHours(weather, aqi, [], 'UTC');
    const byTime = new Map(result.map((r) => [r.time, r.conditions.usAqi]));
    expect(byTime.get('2026-08-31T09:00')).toBe(42);
    expect(byTime.get('2026-08-31T10:00')).toBeNull();
  });

  it('attaches only the alerts active during each hour', () => {
    const weather = weatherWith([hour('2026-08-31T09:00'), hour('2026-08-31T12:00')], [dailyEntry]);
    const alerts = [
      {
        headline: 'Severe thunderstorm warning',
        severity: 'Severe' as const,
        event: 'Severe Thunderstorm',
        description: 'Storms 10:00–13:00.',
        effective: '2026-08-31T10:00',
        expires: '2026-08-31T13:00',
      },
    ];
    const result = buildHours(weather, undefined, alerts, 'UTC');
    const byTime = new Map(result.map((r) => [r.time, r.conditions.activeAlerts]));
    expect(byTime.get('2026-08-31T09:00')).toEqual([]); // before the window
    expect(byTime.get('2026-08-31T12:00')).toHaveLength(1); // inside the window
  });
});

afterAll(() => {
  Settings.now = () => Date.now();
});
