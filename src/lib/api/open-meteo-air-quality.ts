import type { AirQuality } from '@/lib/types';

const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const HOURLY_PARAMS = ['us_aqi', 'pm2_5', 'pm10'].join(',');
const TIMEOUT_MS = 8000;

function normalizeCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

interface AirQualityResponse {
  current: { us_aqi: number };
  hourly: { time: string[]; us_aqi: number[]; pm2_5: number[]; pm10: number[] };
  timezone: string;
}

export async function fetchAirQuality(
  lat: number,
  lon: number,
  timezone: string,
): Promise<AirQuality> {
  const url = new URL(AIR_QUALITY_BASE);
  url.searchParams.set('latitude', String(normalizeCoord(lat)));
  url.searchParams.set('longitude', String(normalizeCoord(lon)));
  url.searchParams.set('current', 'us_aqi');
  url.searchParams.set('hourly', HOURLY_PARAMS);
  url.searchParams.set('timezone', timezone);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(
        `Open-Meteo Air Quality API error: ${response.status} ${response.statusText}`,
      );
    }
    const data: AirQualityResponse = await response.json();
    return {
      currentUsAqi: data.current.us_aqi,
      hourly: data.hourly.time.map((time, i) => ({
        time,
        usAqi: data.hourly.us_aqi[i],
        pm25: data.hourly.pm2_5[i],
        pm10: data.hourly.pm10[i],
      })),
      timezone: data.timezone,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
