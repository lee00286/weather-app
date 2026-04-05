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
});

afterEach(() => {
  global.fetch = originalFetch;
});

// Import after setting up the mock strategy
import { fetchForecast, fetchHistorical } from '@/lib/api/open-meteo';

function makeForecastResponse() {
  return {
    current: {
      temperature_2m: 18.5,
      relative_humidity_2m: 65,
      apparent_temperature: 16.2,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 12.5,
      wind_direction_10m: 220,
      surface_pressure: 1013.2,
      uv_index: 5,
    },
    hourly: {
      time: ['2026-04-04T00:00', '2026-04-04T01:00', '2026-04-04T02:00'],
      temperature_2m: [15.2, 14.8, 14.1],
      relative_humidity_2m: [70, 72, 75],
      apparent_temperature: [13.5, 13.0, 12.5],
      precipitation_probability: [10, 15, 20],
      precipitation: [0, 0, 0.2],
      weather_code: [1, 2, 3],
      wind_speed_10m: [10.0, 11.0, 12.0],
      wind_direction_10m: [200, 210, 220],
      uv_index: [0, 0, 0],
    },
    daily: {
      time: ['2026-04-04', '2026-04-05'],
      temperature_2m_max: [22.1, 20.5],
      temperature_2m_min: [12.3, 11.0],
      apparent_temperature_max: [20.0, 18.5],
      apparent_temperature_min: [10.5, 9.0],
      precipitation_sum: [0.5, 2.0],
      precipitation_probability_max: [30, 60],
      weather_code: [2, 61],
      wind_speed_10m_max: [18.0, 22.0],
      uv_index_max: [6, 4],
      sunrise: ['2026-04-04T06:30', '2026-04-05T06:28'],
      sunset: ['2026-04-04T19:45', '2026-04-05T19:46'],
    },
    timezone: 'America/Toronto',
  };
}

function makeHistoricalResponse() {
  return {
    daily: {
      time: ['2026-03-01', '2026-03-02'],
      temperature_2m_max: [8.5, 10.2],
      temperature_2m_min: [-2.1, -0.5],
      apparent_temperature_max: [5.0, 7.0],
      apparent_temperature_min: [-6.0, -4.0],
      precipitation_sum: [0, 3.5],
      precipitation_probability_max: [0, 80],
      weather_code: [0, 61],
      wind_speed_10m_max: [15.0, 20.0],
      uv_index_max: [3, 2],
      sunrise: ['2026-03-01T06:50', '2026-03-02T06:48'],
      sunset: ['2026-03-01T18:10', '2026-03-02T18:11'],
    },
    timezone: 'America/Toronto',
  };
}

function mockResponse(body: unknown, status = 200, statusText = 'OK') {
  mockFetch.mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      statusText,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('fetchForecast', () => {
  it('constructs the correct URL with all params', async () => {
    mockResponse(makeForecastResponse());

    await fetchForecast(43.65, -79.38, 'America/Toronto');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('43.65');
    expect(url.searchParams.get('longitude')).toBe('-79.38');
    expect(url.searchParams.get('timezone')).toBe('America/Toronto');
    expect(url.searchParams.get('current')).toContain('temperature_2m');
    expect(url.searchParams.get('hourly')).toContain('temperature_2m');
    expect(url.searchParams.get('daily')).toContain('temperature_2m_max');
  });

  it('normalizes coordinates to 2 decimal places', async () => {
    mockResponse(makeForecastResponse());

    await fetchForecast(43.6532, -79.3832, 'America/Toronto');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.searchParams.get('latitude')).toBe('43.65');
    expect(url.searchParams.get('longitude')).toBe('-79.38');
  });

  it('parses current weather correctly', async () => {
    mockResponse(makeForecastResponse());

    const result = await fetchForecast(43.65, -79.38, 'America/Toronto');

    expect(result.current.temperature).toBe(18.5);
    expect(result.current.feelsLike).toBe(16.2);
    expect(result.current.weatherCode).toBe(2);
    expect(result.current.humidity).toBe(65);
    expect(result.current.windSpeed).toBe(12.5);
    expect(result.current.windDirection).toBe(220);
    expect(result.current.precipitation).toBe(0);
    expect(result.current.pressure).toBe(1013.2);
    expect(result.current.uvIndex).toBe(5);
    expect(result.current.highTemp).toBe(22.1);
    expect(result.current.lowTemp).toBe(12.3);
  });

  it('derives isDay from sunrise/sunset in daily[0]', async () => {
    const response = makeForecastResponse();
    // Use local-time strings without timezone indicator (how Open-Meteo returns them)
    // new Date() without Z suffix is parsed as local time by parseCurrent
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    // Set sunrise to midnight today and sunset to 23:59 today (guarantees now is between them)
    response.daily.sunrise[0] = `${year}-${month}-${day}T00:00`;
    response.daily.sunset[0] = `${year}-${month}-${day}T23:59`;

    mockResponse(response);

    const result = await fetchForecast(43.65, -79.38, 'America/Toronto');
    expect(result.current.isDay).toBe(true);
  });

  it('sets isDay to false when current time is after sunset', async () => {
    const response = makeForecastResponse();
    // Set sunrise and sunset both far in the past
    response.daily.sunrise[0] = '2020-01-01T06:00';
    response.daily.sunset[0] = '2020-01-01T18:00';

    mockResponse(response);

    const result = await fetchForecast(43.65, -79.38, 'America/Toronto');
    expect(result.current.isDay).toBe(false);
  });

  it('parses hourly forecasts correctly', async () => {
    mockResponse(makeForecastResponse());

    const result = await fetchForecast(43.65, -79.38, 'America/Toronto');

    expect(result.hourly).toHaveLength(3);
    expect(result.hourly[0].time).toBe('2026-04-04T00:00');
    expect(result.hourly[0].temperature).toBe(15.2);
    expect(result.hourly[0].feelsLike).toBe(13.5);
    expect(result.hourly[0].weatherCode).toBe(1);
    expect(result.hourly[0].precipitationProbability).toBe(10);
    expect(result.hourly[0].precipitation).toBe(0);
    expect(result.hourly[0].windSpeed).toBe(10.0);
    expect(result.hourly[0].windDirection).toBe(200);
    expect(result.hourly[0].uvIndex).toBe(0);
    expect(result.hourly[0].humidity).toBe(70);
    expect(result.hourly[2].temperature).toBe(14.1);
  });

  it('parses daily forecasts correctly', async () => {
    mockResponse(makeForecastResponse());

    const result = await fetchForecast(43.65, -79.38, 'America/Toronto');

    expect(result.daily).toHaveLength(2);
    expect(result.daily[0].date).toBe('2026-04-04');
    expect(result.daily[0].highTemp).toBe(22.1);
    expect(result.daily[0].lowTemp).toBe(12.3);
    expect(result.daily[0].feelsLikeHigh).toBe(20.0);
    expect(result.daily[0].feelsLikeLow).toBe(10.5);
    expect(result.daily[0].precipitationSum).toBe(0.5);
    expect(result.daily[0].precipitationProbability).toBe(30);
    expect(result.daily[0].windSpeedMax).toBe(18.0);
    expect(result.daily[0].uvIndexMax).toBe(6);
    expect(result.daily[0].sunrise).toBe('2026-04-04T06:30');
    expect(result.daily[0].sunset).toBe('2026-04-04T19:45');
  });

  it('includes timezone and empty locationName in result', async () => {
    mockResponse(makeForecastResponse());

    const result = await fetchForecast(43.65, -79.38, 'America/Toronto');
    expect(result.timezone).toBe('America/Toronto');
    expect(result.locationName).toBe('');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    await expect(fetchForecast(43.65, -79.38, 'America/Toronto')).rejects.toThrow(
      'Open-Meteo API error: 500',
    );
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(fetchForecast(43.65, -79.38, 'America/Toronto')).rejects.toThrow('fetch failed');
  });

  it('aborts on timeout', async () => {
    mockFetch.mockImplementationOnce(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          const signal = options?.signal as AbortSignal | undefined;
          if (signal) {
            signal.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            });
          }
        }),
    );

    await expect(fetchForecast(43.65, -79.38, 'America/Toronto')).rejects.toThrow();
  }, 12000);
});

describe('fetchHistorical', () => {
  it('uses the archive API base URL', async () => {
    mockResponse(makeHistoricalResponse());

    await fetchHistorical(43.65, -79.38, 'America/Toronto', '2026-03-01', '2026-03-02');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('archive-api.open-meteo.com');
  });

  it('passes start_date and end_date params', async () => {
    mockResponse(makeHistoricalResponse());

    await fetchHistorical(43.65, -79.38, 'America/Toronto', '2026-03-01', '2026-03-02');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.searchParams.get('start_date')).toBe('2026-03-01');
    expect(url.searchParams.get('end_date')).toBe('2026-03-02');
  });

  it('normalizes coordinates', async () => {
    mockResponse(makeHistoricalResponse());

    await fetchHistorical(43.6532, -79.3832, 'America/Toronto', '2026-03-01', '2026-03-02');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.searchParams.get('latitude')).toBe('43.65');
    expect(url.searchParams.get('longitude')).toBe('-79.38');
  });

  it('only requests daily params (no current or hourly)', async () => {
    mockResponse(makeHistoricalResponse());

    await fetchHistorical(43.65, -79.38, 'America/Toronto', '2026-03-01', '2026-03-02');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.searchParams.get('daily')).toContain('temperature_2m_max');
    expect(url.searchParams.has('current')).toBe(false);
    expect(url.searchParams.has('hourly')).toBe(false);
  });

  it('returns DailyForecast array', async () => {
    mockResponse(makeHistoricalResponse());

    const result = await fetchHistorical(
      43.65,
      -79.38,
      'America/Toronto',
      '2026-03-01',
      '2026-03-02',
    );

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-03-01');
    expect(result[0].highTemp).toBe(8.5);
    expect(result[0].lowTemp).toBe(-2.1);
    expect(result[1].date).toBe('2026-03-02');
    expect(result[1].precipitationSum).toBe(3.5);
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, { status: 429, statusText: 'Too Many Requests' }),
    );

    await expect(
      fetchHistorical(43.65, -79.38, 'America/Toronto', '2026-03-01', '2026-03-02'),
    ).rejects.toThrow('Open-Meteo Archive API error: 429');
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(
      fetchHistorical(43.65, -79.38, 'America/Toronto', '2026-03-01', '2026-03-02'),
    ).rejects.toThrow('fetch failed');
  });
});
