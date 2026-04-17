/**
 * @jest-environment node
 */

jest.mock('@/lib/api/weather-api', () => ({
  fetchAlerts: jest.fn(),
}));

import { GET } from '@/app/api/alerts/route';
import { fetchAlerts } from '@/lib/api/weather-api';

const mockFetchAlerts = fetchAlerts as jest.Mock;

function makeRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost:3000/api/alerts');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/alerts', () => {
  it('returns alerts with correct cache headers on valid params', async () => {
    mockFetchAlerts.mockResolvedValue([
      {
        headline: 'Winter Storm Warning',
        severity: 'Severe',
        event: 'Winter Storm',
        description: 'Heavy snow',
        effective: '2026-04-04T12:00:00Z',
        expires: '2026-04-05T06:00:00Z',
      },
    ]);

    const response = await GET(makeRequest({ lat: '43.65', lon: '-79.38' }));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=300, stale-while-revalidate=60',
    );

    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].headline).toBe('Winter Storm Warning');
  });

  it('returns 400 when lat is missing', async () => {
    const response = await GET(makeRequest({ lon: '-79.38' }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.status).toBe(400);
  });

  it('returns 400 when lon is missing', async () => {
    const response = await GET(makeRequest({ lat: '43.65' }));

    expect(response.status).toBe(400);
  });

  it('returns 400 when lat is NaN', async () => {
    const response = await GET(makeRequest({ lat: 'abc', lon: '-79.38' }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid lat');
  });

  it('returns 400 when lat is out of range', async () => {
    const response = await GET(makeRequest({ lat: '91', lon: '-79.38' }));

    expect(response.status).toBe(400);
  });

  it('returns 400 when lon is out of range', async () => {
    const response = await GET(makeRequest({ lat: '43.65', lon: '181' }));

    expect(response.status).toBe(400);
  });

  it('returns 502 when upstream API fails', async () => {
    mockFetchAlerts.mockRejectedValue(new Error('WeatherAPI alerts error: 500'));

    const response = await GET(makeRequest({ lat: '43.65', lon: '-79.38' }));

    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('WeatherAPI alerts error');
    expect(data.status).toBe(502);
  });
});
