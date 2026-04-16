/**
 * @jest-environment node
 */

jest.mock('@/lib/api/weather-api', () => ({
  searchLocations: jest.fn(),
}));

import { GET } from '@/app/api/search/route';
import { searchLocations } from '@/lib/api/weather-api';

const mockSearchLocations = searchLocations as jest.Mock;

function makeRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost:3000/api/search');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/search', () => {
  it('returns search results with correct cache headers', async () => {
    mockSearchLocations.mockResolvedValue([
      {
        name: 'Toronto',
        region: 'Ontario',
        country: 'Canada',
        lat: 43.67,
        lon: -79.42,
        url: 'toronto-ontario-canada',
      },
    ]);

    const response = await GET(makeRequest({ q: 'Toronto' }));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=3600');

    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Toronto');
  });

  it('returns 400 when q is missing', async () => {
    const response = await GET(makeRequest({}));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.status).toBe(400);
  });

  it('returns 400 when q is empty', async () => {
    const response = await GET(makeRequest({ q: '   ' }));

    expect(response.status).toBe(400);
  });

  it('returns 400 when q exceeds 200 characters', async () => {
    const longQuery = 'a'.repeat(201);
    const response = await GET(makeRequest({ q: longQuery }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('200');
  });

  it('passes query to searchLocations', async () => {
    mockSearchLocations.mockResolvedValue([]);

    await GET(makeRequest({ q: 'Seoul' }));

    expect(mockSearchLocations).toHaveBeenCalledWith('Seoul');
  });

  it('returns 502 when upstream API fails', async () => {
    mockSearchLocations.mockRejectedValue(new Error('WeatherAPI search error: 500'));

    const response = await GET(makeRequest({ q: 'Toronto' }));

    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('WeatherAPI search error');
    expect(data.status).toBe(502);
  });
});
