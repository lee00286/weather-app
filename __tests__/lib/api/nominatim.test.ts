/**
 * @jest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const originalFetch = global.fetch;
const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

afterEach(() => {
  global.fetch = originalFetch;
});

import { geocodePostalCode } from '@/lib/api/nominatim';

function mockResponse(body: unknown, status = 200, statusText = 'OK') {
  mockFetch.mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      statusText,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('geocodePostalCode', () => {
  it('constructs the Nominatim URL with country, postal code, and address details', async () => {
    mockResponse([]);

    await geocodePostalCode('de', '10115');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('nominatim.openstreetmap.org/search');
    expect(calledUrl).toContain('postalcode=10115');
    expect(calledUrl).toContain('countrycodes=de');
    expect(calledUrl).toContain('format=json');
    expect(calledUrl).toContain('addressdetails=1');
  });

  it('sends a User-Agent and requests English results', async () => {
    mockResponse([]);

    await geocodePostalCode('de', '10115');

    const options = mockFetch.mock.calls[0][1] as { headers: Record<string, string> };
    expect(options.headers['User-Agent']).toBeTruthy();
    expect(options.headers['Accept-Language']).toBe('en');
  });

  it('parses a result into a location with numeric coordinates', async () => {
    mockResponse([
      {
        lat: '52.5321914',
        lon: '13.3845571',
        address: { city: 'Berlin', state: 'Berlin', country: 'Germany', postcode: '10115' },
      },
    ]);

    const result = await geocodePostalCode('de', '10115');

    expect(result).toEqual({
      name: 'Berlin',
      region: 'Berlin',
      country: 'Germany',
      lat: 52.5321914,
      lon: 13.3845571,
      url: '',
    });
  });

  it('falls back to town when city is absent', async () => {
    mockResponse([
      {
        lat: '48.2',
        lon: '16.3',
        address: { town: 'Smalltown', country: 'Austria' },
      },
    ]);

    const result = await geocodePostalCode('at', '1234');

    expect(result?.name).toBe('Smalltown');
    expect(result?.region).toBe('');
  });

  it('returns null when no place matches the postal code', async () => {
    mockResponse([]);

    const result = await geocodePostalCode('cz', '00000');

    expect(result).toBeNull();
  });

  it('throws on a non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, { status: 429, statusText: 'Too Many Requests' }),
    );

    await expect(geocodePostalCode('de', '10115')).rejects.toThrow('Nominatim geocode error: 429');
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(geocodePostalCode('de', '10115')).rejects.toThrow('fetch failed');
  });
});
