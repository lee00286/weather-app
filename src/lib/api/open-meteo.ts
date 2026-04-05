import { DateTime } from 'luxon';

import type { WeatherData, CurrentWeather, HourlyForecast, DailyForecast } from '@/lib/types';

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const HISTORICAL_BASE = 'https://archive-api.open-meteo.com/v1/archive';

const CURRENT_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'surface_pressure',
  'uv_index',
].join(',');

const HOURLY_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'uv_index',
].join(',');

const DAILY_PARAMS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'weather_code',
  'wind_speed_10m_max',
  'uv_index_max',
  'sunrise',
  'sunset',
].join(',');

const TIMEOUT_MS = 8000;

function normalizeCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

interface OpenMeteoCurrentResponse {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  surface_pressure: number;
  uv_index: number;
}

interface OpenMeteoHourlyResponse {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  uv_index: number[];
}

interface OpenMeteoDailyResponse {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  weather_code: number[];
  wind_speed_10m_max: number[];
  uv_index_max: number[];
  sunrise: string[];
  sunset: string[];
}

interface OpenMeteoForecastResponse {
  current: OpenMeteoCurrentResponse;
  hourly: OpenMeteoHourlyResponse;
  daily: OpenMeteoDailyResponse;
  timezone: string;
}

interface OpenMeteoHistoricalResponse {
  daily: OpenMeteoDailyResponse;
  timezone: string;
}

function parseCurrent(
  current: OpenMeteoCurrentResponse,
  daily: OpenMeteoDailyResponse,
  timezone: string,
): CurrentWeather {
  const now = DateTime.now().setZone(timezone);
  const sunrise = DateTime.fromISO(daily.sunrise[0], { zone: timezone });
  const sunset = DateTime.fromISO(daily.sunset[0], { zone: timezone });
  const isDay = now >= sunrise && now < sunset;

  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    weatherCode: current.weather_code,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    precipitation: current.precipitation,
    pressure: current.surface_pressure,
    uvIndex: current.uv_index,
    highTemp: daily.temperature_2m_max[0],
    lowTemp: daily.temperature_2m_min[0],
    isDay,
  };
}

function parseHourly(hourly: OpenMeteoHourlyResponse): HourlyForecast[] {
  return hourly.time.map((time, i) => ({
    time,
    temperature: hourly.temperature_2m[i],
    feelsLike: hourly.apparent_temperature[i],
    weatherCode: hourly.weather_code[i],
    precipitationProbability: hourly.precipitation_probability[i],
    precipitation: hourly.precipitation[i],
    windSpeed: hourly.wind_speed_10m[i],
    windDirection: hourly.wind_direction_10m[i],
    uvIndex: hourly.uv_index[i],
    humidity: hourly.relative_humidity_2m[i],
  }));
}

function parseDaily(daily: OpenMeteoDailyResponse): DailyForecast[] {
  return daily.time.map((date, i) => ({
    date,
    weatherCode: daily.weather_code[i],
    highTemp: daily.temperature_2m_max[i],
    lowTemp: daily.temperature_2m_min[i],
    feelsLikeHigh: daily.apparent_temperature_max[i],
    feelsLikeLow: daily.apparent_temperature_min[i],
    precipitationSum: daily.precipitation_sum[i],
    precipitationProbability: daily.precipitation_probability_max[i],
    windSpeedMax: daily.wind_speed_10m_max[i],
    uvIndexMax: daily.uv_index_max[i],
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
  }));
}

export async function fetchForecast(
  lat: number,
  lon: number,
  timezone: string,
): Promise<WeatherData> {
  const normLat = normalizeCoord(lat);
  const normLon = normalizeCoord(lon);

  const url = new URL(FORECAST_BASE);
  url.searchParams.set('latitude', String(normLat));
  url.searchParams.set('longitude', String(normLon));
  url.searchParams.set('current', CURRENT_PARAMS);
  url.searchParams.set('hourly', HOURLY_PARAMS);
  url.searchParams.set('daily', DAILY_PARAMS);
  url.searchParams.set('timezone', timezone);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenMeteoForecastResponse = await response.json();

    return {
      current: parseCurrent(data.current, data.daily, data.timezone),
      hourly: parseHourly(data.hourly),
      daily: parseDaily(data.daily),
      timezone: data.timezone,
      locationName: '',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchHistorical(
  lat: number,
  lon: number,
  timezone: string,
  startDate: string,
  endDate: string,
): Promise<DailyForecast[]> {
  const normLat = normalizeCoord(lat);
  const normLon = normalizeCoord(lon);

  const url = new URL(HISTORICAL_BASE);
  url.searchParams.set('latitude', String(normLat));
  url.searchParams.set('longitude', String(normLon));
  url.searchParams.set('daily', DAILY_PARAMS);
  url.searchParams.set('timezone', timezone);
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Open-Meteo Archive API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenMeteoHistoricalResponse = await response.json();

    return parseDaily(data.daily);
  } finally {
    clearTimeout(timeoutId);
  }
}
