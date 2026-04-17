import { validateLocationParams } from '@/lib/validators';

describe('validateLocationParams', () => {
  describe('valid params', () => {
    it('returns parsed values for valid params', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
        tz: 'America/Toronto',
      });
      expect(result).toEqual({ lat: 43.65, lon: -79.38, tz: 'America/Toronto' });
    });

    it('handles zero latitude and longitude', () => {
      const result = validateLocationParams({
        lat: '0',
        lon: '0',
        tz: 'Africa/Accra',
      });
      expect(result).toEqual({ lat: 0, lon: 0, tz: 'Africa/Accra' });
    });

    it('handles UTC timezone', () => {
      const result = validateLocationParams({
        lat: '51.5',
        lon: '-0.1',
        tz: 'UTC',
      });
      expect(result).toEqual({ lat: 51.5, lon: -0.1, tz: 'UTC' });
    });
  });

  describe('boundary values', () => {
    it('accepts lat = -90', () => {
      const result = validateLocationParams({
        lat: '-90',
        lon: '0',
        tz: 'UTC',
      });
      expect(result).toEqual({ lat: -90, lon: 0, tz: 'UTC' });
    });

    it('accepts lat = 90', () => {
      const result = validateLocationParams({
        lat: '90',
        lon: '0',
        tz: 'UTC',
      });
      expect(result).toEqual({ lat: 90, lon: 0, tz: 'UTC' });
    });

    it('accepts lon = -180', () => {
      const result = validateLocationParams({
        lat: '0',
        lon: '-180',
        tz: 'UTC',
      });
      expect(result).toEqual({ lat: 0, lon: -180, tz: 'UTC' });
    });

    it('accepts lon = 180', () => {
      const result = validateLocationParams({
        lat: '0',
        lon: '180',
        tz: 'UTC',
      });
      expect(result).toEqual({ lat: 0, lon: 180, tz: 'UTC' });
    });

    it('rejects lat = -90.01', () => {
      const result = validateLocationParams({
        lat: '-90.01',
        lon: '0',
        tz: 'UTC',
      });
      expect(result).toBeNull();
    });

    it('rejects lat = 90.01', () => {
      const result = validateLocationParams({
        lat: '90.01',
        lon: '0',
        tz: 'UTC',
      });
      expect(result).toBeNull();
    });

    it('rejects lon = -180.01', () => {
      const result = validateLocationParams({
        lat: '0',
        lon: '-180.01',
        tz: 'UTC',
      });
      expect(result).toBeNull();
    });

    it('rejects lon = 180.01', () => {
      const result = validateLocationParams({
        lat: '0',
        lon: '180.01',
        tz: 'UTC',
      });
      expect(result).toBeNull();
    });
  });

  describe('missing params', () => {
    it('returns null when lat is missing', () => {
      const result = validateLocationParams({
        lon: '-79.38',
        tz: 'America/Toronto',
      });
      expect(result).toBeNull();
    });

    it('returns null when lon is missing', () => {
      const result = validateLocationParams({
        lat: '43.65',
        tz: 'America/Toronto',
      });
      expect(result).toBeNull();
    });

    it('returns tz as null when tz is missing', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
      });
      expect(result).toEqual({ lat: 43.65, lon: -79.38, tz: null });
    });

    it('returns null when all params are missing', () => {
      const result = validateLocationParams({});
      expect(result).toBeNull();
    });
  });

  describe('NaN and non-numeric values', () => {
    it('returns null when lat is NaN', () => {
      const result = validateLocationParams({
        lat: 'NaN',
        lon: '-79.38',
        tz: 'America/Toronto',
      });
      expect(result).toBeNull();
    });

    it('returns null when lon is NaN', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: 'NaN',
        tz: 'America/Toronto',
      });
      expect(result).toBeNull();
    });

    it('returns null when lat is a word', () => {
      const result = validateLocationParams({
        lat: 'abc',
        lon: '-79.38',
        tz: 'America/Toronto',
      });
      expect(result).toBeNull();
    });

    it('returns null when lon is empty string', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '',
        tz: 'America/Toronto',
      });
      expect(result).toBeNull();
    });

    it('returns null when lat is Infinity', () => {
      const result = validateLocationParams({
        lat: 'Infinity',
        lon: '-79.38',
        tz: 'America/Toronto',
      });
      expect(result).toBeNull();
    });

    it('returns null when lon is -Infinity', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-Infinity',
        tz: 'America/Toronto',
      });
      expect(result).toBeNull();
    });
  });

  describe('invalid timezone', () => {
    it('returns null for fake timezone', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
        tz: 'Fake/Timezone',
      });
      expect(result).toBeNull();
    });

    it('returns tz as null for empty timezone', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
        tz: '',
      });
      expect(result).toEqual({ lat: 43.65, lon: -79.38, tz: null });
    });

    it('returns null for numeric timezone', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
        tz: '123',
      });
      expect(result).toBeNull();
    });
  });

  describe('valid IANA timezones', () => {
    it('accepts Asia/Seoul', () => {
      const result = validateLocationParams({
        lat: '37.57',
        lon: '126.98',
        tz: 'Asia/Seoul',
      });
      expect(result).toEqual({ lat: 37.57, lon: 126.98, tz: 'Asia/Seoul' });
    });

    it('accepts Pacific/Auckland', () => {
      const result = validateLocationParams({
        lat: '-36.85',
        lon: '174.76',
        tz: 'Pacific/Auckland',
      });
      expect(result).toEqual({ lat: -36.85, lon: 174.76, tz: 'Pacific/Auckland' });
    });

    it('accepts Asia/Kolkata (half-hour offset)', () => {
      const result = validateLocationParams({
        lat: '28.61',
        lon: '77.21',
        tz: 'Asia/Kolkata',
      });
      expect(result).toEqual({ lat: 28.61, lon: 77.21, tz: 'Asia/Kolkata' });
    });
  });

  describe('optional tz behavior', () => {
    it('returns tz as null when tz is undefined', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
      });
      expect(result).toEqual({ lat: 43.65, lon: -79.38, tz: null });
    });

    it('returns tz as null when tz is empty string', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
        tz: '',
      });
      expect(result).toEqual({ lat: 43.65, lon: -79.38, tz: null });
    });

    it('returns valid tz when provided and valid', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
        tz: 'America/Toronto',
      });
      expect(result).toEqual({ lat: 43.65, lon: -79.38, tz: 'America/Toronto' });
    });

    it('returns null for invalid tz when provided', () => {
      const result = validateLocationParams({
        lat: '43.65',
        lon: '-79.38',
        tz: 'Not/Real',
      });
      expect(result).toBeNull();
    });
  });
});
