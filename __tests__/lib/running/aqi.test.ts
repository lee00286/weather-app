import { getAqiCategory } from '@/lib/running/aqi';

describe('getAqiCategory (US AQI bands)', () => {
  it('maps each band by its lower bound', () => {
    expect(getAqiCategory(0).level).toBe('good');
    expect(getAqiCategory(50).level).toBe('good');
    expect(getAqiCategory(51).level).toBe('moderate');
    expect(getAqiCategory(100).level).toBe('moderate');
    expect(getAqiCategory(101).level).toBe('unhealthy-sensitive');
    expect(getAqiCategory(151).level).toBe('unhealthy');
    expect(getAqiCategory(201).level).toBe('very-unhealthy');
    expect(getAqiCategory(301).level).toBe('hazardous');
  });

  it('gives a human label', () => {
    expect(getAqiCategory(30).label).toBe('Good');
    expect(getAqiCategory(160).label).toBe('Unhealthy');
  });
});
