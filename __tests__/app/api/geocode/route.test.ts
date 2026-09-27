/**
 * @jest-environment node
 */

jest.mock('@/lib/api/nominatim', () => ({
  geocodePostalCode: jest.fn(),
}));

import { GET } from '@/app/api/geocode/route';
import { geocodePostalCode } from '@/lib/api/nominatim';

const mockGeocode = geocodePostalCode as jest.Mock;

function makeRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost:3000/api/geocode');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/geocode', () => {
  it('returns the geocoded location with cache headers', async () => {
    mockGeocode.mockResolvedValue({
      name: 'Berlin',
      region: 'Berlin',
      country: 'Germany',
      lat: 52.53,
      lon: 13.38,
      url: '',
    });

    const response = await GET(makeRequest({ country: 'de', postal: '10115' }));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=86400');
    const data = await response.json();
    expect(data.name).toBe('Berlin');
    expect(data.lat).toBe(52.53);
  });

  it('lowercases the country before geocoding', async () => {
    mockGeocode.mockResolvedValue({
      name: 'Berlin',
      region: 'Berlin',
      country: 'Germany',
      lat: 52.53,
      lon: 13.38,
      url: '',
    });

    await GET(makeRequest({ country: 'DE', postal: '10115' }));

    expect(mockGeocode).toHaveBeenCalledWith('de', '10115');
  });

  it('returns 400 when country is missing', async () => {
    const response = await GET(makeRequest({ postal: '10115' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when postal is missing', async () => {
    const response = await GET(makeRequest({ country: 'de' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when country is not supported', async () => {
    const response = await GET(makeRequest({ country: 'us', postal: '10001' }));
    expect(response.status).toBe(400);
    expect(mockGeocode).not.toHaveBeenCalled();
  });

  it('returns 400 when postal contains invalid characters', async () => {
    const response = await GET(makeRequest({ country: 'de', postal: 'abc' }));
    expect(response.status).toBe(400);
    expect(mockGeocode).not.toHaveBeenCalled();
  });

  it('returns 404 when no location matches', async () => {
    mockGeocode.mockResolvedValue(null);

    const response = await GET(makeRequest({ country: 'cz', postal: '00000' }));
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('returns 502 when the geocoder fails', async () => {
    mockGeocode.mockRejectedValue(new Error('Nominatim geocode error: 429'));

    const response = await GET(makeRequest({ country: 'de', postal: '10115' }));
    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('Nominatim geocode error');
  });
});
