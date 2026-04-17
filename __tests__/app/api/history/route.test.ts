/**
 * @jest-environment node
 */

jest.mock('@/lib/api/open-meteo', () => ({
  fetchHistorical: jest.fn(),
}));

jest.mock('@/lib/validators', () => ({
  validateLocationParams: jest.fn(),
}));

import { GET } from '@/app/api/history/route';
import { fetchHistorical } from '@/lib/api/open-meteo';
import { validateLocationParams } from '@/lib/validators';

const mockFetchHistorical = fetchHistorical as jest.Mock;
const mockValidateLocationParams = validateLocationParams as jest.Mock;

function makeRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost:3000/api/history');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

const mockHistoricalData = [
  {
    date: '2026-03-01',
    weatherCode: 0,
    highTemp: 8.5,
    lowTemp: -2.1,
    feelsLikeHigh: 5.0,
    feelsLikeLow: -6.0,
    precipitationSum: 0,
    precipitationProbability: 0,
    windSpeedMax: 15.0,
    uvIndexMax: 3,
    sunrise: '2026-03-01T06:50',
    sunset: '2026-03-01T18:10',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/history', () => {
  it('returns historical data with correct cache headers', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: 'America/Toronto',
    });
    mockFetchHistorical.mockResolvedValue(mockHistoricalData);

    const response = await GET(
      makeRequest({
        lat: '43.65',
        lon: '-79.38',
        tz: 'America/Toronto',
        start_date: '2026-03-01',
        end_date: '2026-03-01',
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=86400');

    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].date).toBe('2026-03-01');
  });

  it('returns 400 when location params are invalid', async () => {
    mockValidateLocationParams.mockReturnValue(null);

    const response = await GET(
      makeRequest({
        lat: 'bad',
        lon: '-79.38',
        tz: 'America/Toronto',
        start_date: '2026-03-01',
        end_date: '2026-03-02',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('returns 400 when start_date is missing', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: 'America/Toronto',
    });

    const response = await GET(
      makeRequest({
        lat: '43.65',
        lon: '-79.38',
        tz: 'America/Toronto',
        end_date: '2026-03-02',
      }),
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('start_date');
  });

  it('returns 400 when end_date is missing', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: 'America/Toronto',
    });

    const response = await GET(
      makeRequest({
        lat: '43.65',
        lon: '-79.38',
        tz: 'America/Toronto',
        start_date: '2026-03-01',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('returns 400 when date format is invalid', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: 'America/Toronto',
    });

    const response = await GET(
      makeRequest({
        lat: '43.65',
        lon: '-79.38',
        tz: 'America/Toronto',
        start_date: '03-01-2026',
        end_date: '03-02-2026',
      }),
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('YYYY-MM-DD');
  });

  it('returns 400 when date is semantically invalid', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: 'America/Toronto',
    });

    const response = await GET(
      makeRequest({
        lat: '43.65',
        lon: '-79.38',
        tz: 'America/Toronto',
        start_date: '2026-13-45',
        end_date: '2026-03-02',
      }),
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid date');
  });

  it('uses auto timezone when tz is null', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: null,
    });
    mockFetchHistorical.mockResolvedValue(mockHistoricalData);

    const response = await GET(
      makeRequest({
        lat: '43.65',
        lon: '-79.38',
        start_date: '2026-03-01',
        end_date: '2026-03-01',
      }),
    );

    expect(response.status).toBe(200);
    expect(mockFetchHistorical).toHaveBeenCalledWith(
      43.65,
      -79.38,
      'auto',
      '2026-03-01',
      '2026-03-01',
    );
  });

  it('returns 502 when upstream API fails', async () => {
    mockValidateLocationParams.mockReturnValue({
      lat: 43.65,
      lon: -79.38,
      tz: 'America/Toronto',
    });
    mockFetchHistorical.mockRejectedValue(new Error('Open-Meteo Archive API error: 500'));

    const response = await GET(
      makeRequest({
        lat: '43.65',
        lon: '-79.38',
        tz: 'America/Toronto',
        start_date: '2026-03-01',
        end_date: '2026-03-02',
      }),
    );

    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('Open-Meteo Archive API error');
  });
});
