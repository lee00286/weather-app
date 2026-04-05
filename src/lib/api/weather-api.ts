import type { LocationSearchResult, WeatherAlert } from '@/lib/types';

const SEARCH_BASE = 'https://api.weatherapi.com/v1/search.json';
const FORECAST_BASE = 'https://api.weatherapi.com/v1/forecast.json';
const TIMEOUT_MS = 8000;

function getApiKey(): string {
  const key = process.env.WEATHER_API_KEY;

  if (!key) {
    throw new Error('WEATHER_API_KEY environment variable is not set');
  }

  return key;
}

function stripControlCharacters(input: string): string {
  return input.replace(/[\x00-\x1F]/g, '');
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const apiKey = getApiKey();
  const sanitized = stripControlCharacters(query);
  const url = `${SEARCH_BASE}?key=${apiKey}&q=${encodeURIComponent(sanitized)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`WeatherAPI search error: ${response.status} ${response.statusText}`);
    }

    const data: Array<{
      name: string;
      region: string;
      country: string;
      lat: number;
      lon: number;
      url: string;
    }> = await response.json();

    return data.map((item) => ({
      name: item.name,
      region: item.region,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      url: item.url,
    }));
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  const apiKey = getApiKey();
  const url = `${FORECAST_BASE}?key=${apiKey}&q=${lat},${lon}&days=1&alerts=yes&aqi=no`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`WeatherAPI alerts error: ${response.status} ${response.statusText}`);
    }

    const data: {
      alerts?: {
        alert?: Array<{
          headline: string;
          severity: string;
          event: string;
          desc: string;
          effective: string;
          expires: string;
        }>;
      };
    } = await response.json();

    const validSeverities: ReadonlySet<WeatherAlert['severity']> = new Set([
      'Extreme',
      'Severe',
      'Moderate',
      'Minor',
    ]);

    const rawAlerts = data?.alerts?.alert ?? [];

    return rawAlerts.map((alert) => ({
      headline: alert.headline,
      severity: validSeverities.has(alert.severity as WeatherAlert['severity'])
        ? (alert.severity as WeatherAlert['severity'])
        : 'Minor',
      event: alert.event,
      description: alert.desc,
      effective: alert.effective,
      expires: alert.expires,
    }));
  } finally {
    clearTimeout(timeoutId);
  }
}
