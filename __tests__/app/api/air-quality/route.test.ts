/**
 * @jest-environment node
 */
jest.mock('@/lib/api/open-meteo-air-quality', () => ({ fetchAirQuality: jest.fn() }));
jest.mock('@/lib/validators', () => ({ validateLocationParams: jest.fn() }));

import { GET } from '@/app/api/air-quality/route';
import { fetchAirQuality } from '@/lib/api/open-meteo-air-quality';
import { validateLocationParams } from '@/lib/validators';

const mockFetch = fetchAirQuality as jest.Mock;
const mockValidate = validateLocationParams as jest.Mock;

function makeRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost:3000/api/air-quality');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
}

const mockAq = { currentUsAqi: 32, hourly: [], timezone: 'America/Toronto' };

beforeEach(() => jest.clearAllMocks());

describe('GET /api/air-quality', () => {
  it('returns AQI with cache headers on valid params', async () => {
    mockValidate.mockReturnValue({ lat: 43.65, lon: -79.38, tz: 'America/Toronto' });
    mockFetch.mockResolvedValue(mockAq);

    const res = await GET(makeRequest({ lat: '43.65', lon: '-79.38', tz: 'America/Toronto' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe(
      'public, s-maxage=900, stale-while-revalidate=120',
    );
    const data = await res.json();
    expect(data.currentUsAqi).toBe(32);
  });

  it('returns 400 when params invalid', async () => {
    mockValidate.mockReturnValue(null);
    const res = await GET(makeRequest({}));
    expect(res.status).toBe(400);
    expect((await res.json()).status).toBe(400);
  });

  it('returns 502 when upstream fails', async () => {
    mockValidate.mockReturnValue({ lat: 43.65, lon: -79.38, tz: null });
    mockFetch.mockRejectedValue(new Error('Open-Meteo Air Quality API error: 500 Server Error'));
    const res = await GET(makeRequest({ lat: '43.65', lon: '-79.38' }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toContain('Air Quality');
  });
});
