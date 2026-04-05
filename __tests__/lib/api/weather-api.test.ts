/**
 * @jest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

// Save original fetch and replace with mock
const originalFetch = global.fetch;
const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
  process.env.WEATHER_API_KEY = 'test-api-key-123';
});

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.WEATHER_API_KEY;
});

import { searchLocations, fetchAlerts } from '@/lib/api/weather-api';

function mockResponse(body: unknown, status = 200, statusText = 'OK') {
  mockFetch.mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      statusText,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('searchLocations', () => {
  it('constructs URL with API key and encoded query', async () => {
    mockResponse([]);

    await searchLocations('Toronto');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('key=test-api-key-123');
    expect(calledUrl).toContain('q=Toronto');
  });

  it('encodes special characters in query', async () => {
    mockResponse([]);

    await searchLocations("St. John's");

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("q=St.%20John's");
  });

  it('encodes unicode characters', async () => {
    mockResponse([]);

    await searchLocations('Seoul');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('q=Seoul');
  });

  it('strips control characters before encoding', async () => {
    mockResponse([]);

    await searchLocations('Tor\x00on\x1Fto');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('q=Toronto');
    expect(calledUrl).not.toContain('%00');
    expect(calledUrl).not.toContain('%1F');
  });

  it('parses search results correctly', async () => {
    mockResponse([
      {
        id: 1,
        name: 'Toronto',
        region: 'Ontario',
        country: 'Canada',
        lat: 43.67,
        lon: -79.42,
        url: 'toronto-ontario-canada',
      },
      {
        id: 2,
        name: 'Toronto',
        region: 'Ohio',
        country: 'United States',
        lat: 40.46,
        lon: -80.6,
        url: 'toronto-ohio-united-states',
      },
    ]);

    const results = await searchLocations('Toronto');

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Toronto');
    expect(results[0].region).toBe('Ontario');
    expect(results[0].country).toBe('Canada');
    expect(results[0].lat).toBe(43.67);
    expect(results[0].lon).toBe(-79.42);
    expect(results[0].url).toBe('toronto-ontario-canada');
    expect(results[1].region).toBe('Ohio');
  });

  it('returns empty array for no results', async () => {
    mockResponse([]);

    const results = await searchLocations('asdfghjkl');
    expect(results).toHaveLength(0);
  });

  it('throws when API key is missing', async () => {
    delete process.env.WEATHER_API_KEY;

    await expect(searchLocations('Toronto')).rejects.toThrow(
      'WEATHER_API_KEY environment variable is not set',
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 403, statusText: 'Forbidden' }));

    await expect(searchLocations('Toronto')).rejects.toThrow('WeatherAPI search error: 403');
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(searchLocations('Toronto')).rejects.toThrow('fetch failed');
  });
});

describe('fetchAlerts', () => {
  it('constructs URL with API key and coordinates', async () => {
    mockResponse({ alerts: { alert: [] } });

    await fetchAlerts(43.65, -79.38);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('key=test-api-key-123');
    expect(calledUrl).toContain('q=43.65,-79.38');
    expect(calledUrl).toContain('days=1');
    expect(calledUrl).toContain('alerts=yes');
    expect(calledUrl).toContain('aqi=no');
  });

  it('parses alerts from nested response', async () => {
    mockResponse({
      alerts: {
        alert: [
          {
            headline: 'Winter Storm Warning',
            severity: 'Severe',
            event: 'Winter Storm',
            desc: 'Heavy snowfall expected',
            effective: '2026-04-04T12:00:00Z',
            expires: '2026-04-05T06:00:00Z',
          },
          {
            headline: 'Wind Advisory',
            severity: 'Moderate',
            event: 'High Wind',
            desc: 'Strong winds expected',
            effective: '2026-04-04T18:00:00Z',
            expires: '2026-04-05T12:00:00Z',
          },
        ],
      },
    });

    const alerts = await fetchAlerts(43.65, -79.38);

    expect(alerts).toHaveLength(2);
    expect(alerts[0].headline).toBe('Winter Storm Warning');
    expect(alerts[0].severity).toBe('Severe');
    expect(alerts[0].event).toBe('Winter Storm');
    expect(alerts[0].description).toBe('Heavy snowfall expected');
    expect(alerts[0].effective).toBe('2026-04-04T12:00:00Z');
    expect(alerts[0].expires).toBe('2026-04-05T06:00:00Z');
    expect(alerts[1].headline).toBe('Wind Advisory');
  });

  it('returns empty array when no alerts', async () => {
    mockResponse({ alerts: { alert: [] } });

    const alerts = await fetchAlerts(43.65, -79.38);
    expect(alerts).toHaveLength(0);
  });

  it('returns empty array when response has no alerts key', async () => {
    mockResponse({});

    const alerts = await fetchAlerts(43.65, -79.38);
    expect(alerts).toHaveLength(0);
  });

  it('returns empty array when alerts object has no alert key', async () => {
    mockResponse({ alerts: {} });

    const alerts = await fetchAlerts(43.65, -79.38);
    expect(alerts).toHaveLength(0);
  });

  it('defaults unrecognized severity to Minor', async () => {
    mockResponse({
      alerts: {
        alert: [
          {
            headline: 'Unknown Severity Alert',
            severity: 'SuperDanger',
            event: 'Test Event',
            desc: 'Unknown severity level',
            effective: '2026-04-04T12:00:00Z',
            expires: '2026-04-05T06:00:00Z',
          },
        ],
      },
    });

    const alerts = await fetchAlerts(43.65, -79.38);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('Minor');
  });

  it('throws when API key is missing', async () => {
    delete process.env.WEATHER_API_KEY;

    await expect(fetchAlerts(43.65, -79.38)).rejects.toThrow(
      'WEATHER_API_KEY environment variable is not set',
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    await expect(fetchAlerts(43.65, -79.38)).rejects.toThrow('WeatherAPI alerts error: 500');
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(fetchAlerts(43.65, -79.38)).rejects.toThrow('fetch failed');
  });
});
