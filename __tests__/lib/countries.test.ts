import { SUPPORTED_COUNTRIES, isSupportedCountry } from '@/lib/countries';

describe('SUPPORTED_COUNTRIES', () => {
  it('lists the five supported countries in order', () => {
    expect(SUPPORTED_COUNTRIES.map((c) => c.code)).toEqual(['de', 'fr', 'ch', 'at', 'cz']);
  });

  it('gives every country a non-empty label', () => {
    for (const country of SUPPORTED_COUNTRIES) {
      expect(country.label.length).toBeGreaterThan(0);
    }
  });
});

describe('isSupportedCountry', () => {
  it('accepts a supported country code', () => {
    expect(isSupportedCountry('de')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isSupportedCountry('DE')).toBe(true);
  });

  it('rejects an unsupported country code', () => {
    expect(isSupportedCountry('us')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isSupportedCountry('')).toBe(false);
  });
});
