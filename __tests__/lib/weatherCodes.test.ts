import { getWeatherInfo } from '@/lib/weatherCodes';

describe('getWeatherInfo', () => {
  it('returns clear sky for code 0', () => {
    const info = getWeatherInfo(0);
    expect(info.label).toBe('Clear sky');
    expect(info.icon).toBe('sun');
    expect(info.category).toBe('clear');
  });

  describe('partly cloudy codes (1-3)', () => {
    it.each([
      [1, 'Mainly clear'],
      [2, 'Partly cloudy'],
      [3, 'Overcast'],
    ] as const)('returns cloudy info for code %d', (code, expectedLabel) => {
      const info = getWeatherInfo(code);
      expect(info.label).toBe(expectedLabel);
      expect(info.icon).toBe('cloud-sun');
      expect(info.category).toBe('cloudy');
    });
  });

  describe('fog codes (45, 48)', () => {
    it.each([
      [45, 'Fog'],
      [48, 'Depositing rime fog'],
    ] as const)('returns fog info for code %d', (code, expectedLabel) => {
      const info = getWeatherInfo(code);
      expect(info.label).toBe(expectedLabel);
      expect(info.icon).toBe('fog');
      expect(info.category).toBe('fog');
    });
  });

  describe('drizzle codes (51-55)', () => {
    it.each([
      [51, 'Light drizzle'],
      [53, 'Moderate drizzle'],
      [55, 'Dense drizzle'],
    ] as const)('returns drizzle info for code %d', (code, expectedLabel) => {
      const info = getWeatherInfo(code);
      expect(info.label).toBe(expectedLabel);
      expect(info.icon).toBe('light-rain');
      expect(info.category).toBe('rain');
    });
  });

  describe('rain codes (61-65)', () => {
    it.each([
      [61, 'Slight rain'],
      [63, 'Moderate rain'],
      [65, 'Heavy rain'],
    ] as const)('returns rain info for code %d', (code, expectedLabel) => {
      const info = getWeatherInfo(code);
      expect(info.label).toBe(expectedLabel);
      expect(info.icon).toBe('rain');
      expect(info.category).toBe('rain');
    });
  });

  describe('snow codes (71-75)', () => {
    it.each([
      [71, 'Slight snow fall'],
      [73, 'Moderate snow fall'],
      [75, 'Heavy snow fall'],
    ] as const)('returns snow info for code %d', (code, expectedLabel) => {
      const info = getWeatherInfo(code);
      expect(info.label).toBe(expectedLabel);
      expect(info.icon).toBe('snow');
      expect(info.category).toBe('snow');
    });
  });

  describe('rain shower codes (80-82)', () => {
    it.each([
      [80, 'Slight rain showers'],
      [81, 'Moderate rain showers'],
      [82, 'Violent rain showers'],
    ] as const)('returns rain shower info for code %d', (code, expectedLabel) => {
      const info = getWeatherInfo(code);
      expect(info.label).toBe(expectedLabel);
      expect(info.icon).toBe('rain');
      expect(info.category).toBe('rain');
    });
  });

  describe('snow shower codes (85-86)', () => {
    it.each([
      [85, 'Slight snow showers'],
      [86, 'Heavy snow showers'],
    ] as const)('returns snow shower info for code %d', (code, expectedLabel) => {
      const info = getWeatherInfo(code);
      expect(info.label).toBe(expectedLabel);
      expect(info.icon).toBe('snow');
      expect(info.category).toBe('snow');
    });
  });

  describe('thunderstorm codes (95-99)', () => {
    it.each([
      [95, 'Thunderstorm'],
      [96, 'Thunderstorm with slight hail'],
      [99, 'Thunderstorm with heavy hail'],
    ] as const)('returns storm info for code %d', (code, expectedLabel) => {
      const info = getWeatherInfo(code);
      expect(info.label).toBe(expectedLabel);
      expect(info.icon).toBe('storm');
      expect(info.category).toBe('storm');
    });
  });

  describe('unknown codes', () => {
    it('throws for code -1', () => {
      expect(() => getWeatherInfo(-1)).toThrow('Unknown WMO weather code: -1');
    });

    it('throws for code 4', () => {
      expect(() => getWeatherInfo(4)).toThrow('Unknown WMO weather code: 4');
    });

    it('throws for code 100', () => {
      expect(() => getWeatherInfo(100)).toThrow('Unknown WMO weather code: 100');
    });

    it('throws for code 50', () => {
      expect(() => getWeatherInfo(50)).toThrow('Unknown WMO weather code: 50');
    });

    it('throws for code 97', () => {
      expect(() => getWeatherInfo(97)).toThrow('Unknown WMO weather code: 97');
    });
  });

  describe('boundary values', () => {
    it('handles lowest valid code (0)', () => {
      expect(getWeatherInfo(0).category).toBe('clear');
    });

    it('handles highest valid code (99)', () => {
      expect(getWeatherInfo(99).category).toBe('storm');
    });

    it('handles first fog code (45)', () => {
      expect(getWeatherInfo(45).category).toBe('fog');
    });

    it('handles last fog code (48)', () => {
      expect(getWeatherInfo(48).category).toBe('fog');
    });
  });
});
