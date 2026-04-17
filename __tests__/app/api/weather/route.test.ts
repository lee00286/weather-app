/**
 * @jest-environment node
 */

jest.mock('@/lib/api/open-meteo', () => ({
  fetchForecast: jest.fn(),
}));

jest.mock('@/lib/validators', () => ({
  validateLocationParams: jest.fn(),
}));

import { GET } from '@/app/api/weather/route';
import { fetchForecast } from '@/lib/api/open-meteo';
import { validateLocationParams } from '@/lib/validators';

const mockFetchForecast = fetchForecast as jest.Mock;
const mockValidateLocationParams = validateLocationParams as jest.Mock;

function makeRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost:3000/api/weather');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

const mockWeatherData = {
  current: {
    temperature: 18.5,
    feelsLike: 16.2,
    weatherCode: 2,
    humidity: 65,
    windSpeed: 12.5,
    windDirection: 220,
    precipitation: 0,
    pressure: 1013.2,
    uvIndex: 5,
    highTemp: 22.1,
    lowTemp: 12.3,
    isDay: true,
  },
  hourly: [],
  daily: [],
  timezone: 'America/Toronto',
  locationName: '',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/weather', () => {
  it('returns weather data with correct cache headers on valid params', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: 'America/Toronto',
    });
    mockFetchForecast.mockResolvedValue(mockWeatherData);

    const response = await GET(makeRequest({ lat: '43.65', lon: '-79.38', tz: 'America/Toronto' }));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=300, stale-while-revalidate=60',
    );

    const data = await response.json();
    expect(data.current.temperature).toBe(18.5);
    expect(data.timezone).toBe('America/Toronto');
  });

  it('returns 400 when params are missing', async () => {
    mockValidateLocationParams.mockReturnValue(null);

    const response = await GET(makeRequest({}));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.status).toBe(400);
  });

  it('returns 400 when lat is NaN', async () => {
    mockValidateLocationParams.mockReturnValue(null);

    const response = await GET(makeRequest({ lat: 'NaN', lon: '-79.38', tz: 'America/Toronto' }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.status).toBe(400);
  });

  it('returns 400 when validation fails', async () => {
    mockValidateLocationParams.mockReturnValue(null);

    const response = await GET(makeRequest({ lat: '43.65', lon: '-79.38' }));

    expect(response.status).toBe(400);
  });

  it('uses auto timezone when tz is null', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: null,
    });
    mockFetchForecast.mockResolvedValue(mockWeatherData);

    const response = await GET(makeRequest({ lat: '43.65', lon: '-79.38' }));

    expect(response.status).toBe(200);
    expect(mockFetchForecast).toHaveBeenCalledWith(43.65, -79.38, 'auto');
  });

  it('returns 502 when upstream API fails', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: 'America/Toronto',
    });
    mockFetchForecast.mockRejectedValue(
      new Error('Open-Meteo API error: 500 Internal Server Error'),
    );

    const response = await GET(makeRequest({ lat: '43.65', lon: '-79.38', tz: 'America/Toronto' }));

    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('Open-Meteo API error');
    expect(data.status).toBe(502);
  });
});
