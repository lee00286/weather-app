import { generateSlug } from '@/lib/slug';

describe('generateSlug', () => {
  it('generates slug from simple names', () => {
    expect(generateSlug('Toronto', 'Ontario', 'Canada')).toBe('toronto-ontario-canada');
  });

  it('handles spaces in names', () => {
    expect(generateSlug('New York', 'New York', 'United States')).toBe(
      'new-york-new-york-united-states',
    );
  });

  it('strips apostrophes', () => {
    expect(generateSlug("St. John's", 'Newfoundland', 'Canada')).toBe(
      'st-johns-newfoundland-canada',
    );
  });

  it('strips periods', () => {
    expect(generateSlug('St. Louis', 'Missouri', 'U.S.A.')).toBe('st-louis-missouri-usa');
  });

  it('handles special characters', () => {
    expect(generateSlug('São Paulo', 'São Paulo', 'Brazil')).toBe('sao-paulo-sao-paulo-brazil');
  });

  it('handles accented characters', () => {
    expect(generateSlug('Montréal', 'Québec', 'Canada')).toBe('montreal-quebec-canada');
  });

  it('collapses multiple hyphens into one', () => {
    expect(generateSlug('A - B', 'C', 'D')).toBe('a-b-c-d');
  });

  it('handles single-word names', () => {
    expect(generateSlug('Seoul', 'Seoul', 'South Korea')).toBe('seoul-seoul-south-korea');
  });

  it('handles empty name', () => {
    expect(generateSlug('', 'Ontario', 'Canada')).toBe('ontario-canada');
  });

  it('handles empty region', () => {
    expect(generateSlug('Tokyo', '', 'Japan')).toBe('tokyo-japan');
  });

  it('handles empty country', () => {
    expect(generateSlug('London', 'England', '')).toBe('london-england');
  });

  it('handles all empty strings', () => {
    expect(generateSlug('', '', '')).toBe('');
  });

  it('handles unicode characters', () => {
    expect(generateSlug('東京', '東京都', '日本')).toBe('');
  });

  it('strips leading and trailing hyphens', () => {
    expect(generateSlug('-Test-', 'Region', 'Country')).toBe('test-region-country');
  });

  it('handles mixed case', () => {
    expect(generateSlug('TORONTO', 'ONTARIO', 'CANADA')).toBe('toronto-ontario-canada');
  });

  it('handles numbers in names', () => {
    expect(generateSlug('District 9', 'Area 51', 'Zone 3')).toBe('district-9-area-51-zone-3');
  });

  it('handles parentheses', () => {
    expect(generateSlug('Washington (DC)', 'DC', 'United States')).toBe(
      'washington-dc-dc-united-states',
    );
  });

  it('handles commas', () => {
    expect(generateSlug('City, Town', 'Region', 'Country')).toBe('city-town-region-country');
  });
});
