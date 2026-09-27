import { fetchAirQuality } from '@/lib/api/open-meteo-air-quality';

const okResponse = {
  current: { us_aqi: 32 },
  hourly: {
    time: ['2026-08-31T00:00', '2026-08-31T01:00'],
    us_aqi: [30, 34],
    pm2_5: [5.1, 6.2],
    pm10: [10, 12],
  },
  timezone: 'America/Toronto',
};

beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.resetAllMocks();
});

describe('fetchAirQuality', () => {
  it('builds the correct URL and parses the response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => okResponse });

    const result = await fetchAirQuality(43.651, -79.383, 'America/Toronto');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('air-quality-api.open-meteo.com/v1/air-quality');
    expect(calledUrl).toContain('latitude=43.65'); // normalized to 2 dp
    expect(calledUrl).toContain('longitude=-79.38');
    expect(calledUrl).toContain('current=us_aqi');
    expect(calledUrl).toContain('hourly=us_aqi%2Cpm2_5%2Cpm10');

    expect(result.currentUsAqi).toBe(32);
    expect(result.hourly).toHaveLength(2);
    expect(result.hourly[1]).toEqual({ time: '2026-08-31T01:00', usAqi: 34, pm25: 6.2, pm10: 12 });
    expect(result.timezone).toBe('America/Toronto');
  });

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });
    await expect(fetchAirQuality(43.65, -79.38, 'America/Toronto')).rejects.toThrow(
      'Open-Meteo Air Quality API error: 500',
    );
  });
});
