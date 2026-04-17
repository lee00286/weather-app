import { describe, expect, it } from '@jest/globals';

import { formatHourlyTime, getWindDirection, getUvLabel } from '@/lib/timezone';

describe('formatHourlyTime', () => {
  it('formats morning time correctly', () => {
    expect(formatHourlyTime('2024-06-15T09:00', 'America/Toronto')).toBe('9 AM');
  });

  it('formats afternoon time correctly', () => {
    expect(formatHourlyTime('2024-06-15T15:00', 'America/Toronto')).toBe('3 PM');
  });

  it('formats midnight as 12 AM', () => {
    expect(formatHourlyTime('2024-06-15T00:00', 'America/Toronto')).toBe('12 AM');
  });

  it('formats noon as 12 PM', () => {
    expect(formatHourlyTime('2024-06-15T12:00', 'America/Toronto')).toBe('12 PM');
  });

  it('respects timezone', () => {
    // 3 PM UTC is midnight KST (next day)
    expect(formatHourlyTime('2024-06-15T15:00', 'UTC')).toBe('3 PM');
  });
});

describe('getWindDirection', () => {
  it('returns N for 0 degrees', () => {
    expect(getWindDirection(0)).toBe('N');
  });

  it('returns NE for 45 degrees', () => {
    expect(getWindDirection(45)).toBe('NE');
  });

  it('returns E for 90 degrees', () => {
    expect(getWindDirection(90)).toBe('E');
  });

  it('returns SE for 135 degrees', () => {
    expect(getWindDirection(135)).toBe('SE');
  });

  it('returns S for 180 degrees', () => {
    expect(getWindDirection(180)).toBe('S');
  });

  it('returns SW for 225 degrees', () => {
    expect(getWindDirection(225)).toBe('SW');
  });

  it('returns W for 270 degrees', () => {
    expect(getWindDirection(270)).toBe('W');
  });

  it('returns NW for 315 degrees', () => {
    expect(getWindDirection(315)).toBe('NW');
  });

  it('returns N for 360 degrees', () => {
    expect(getWindDirection(360)).toBe('N');
  });

  it('rounds to nearest direction for boundary values', () => {
    // 22 degrees is closer to N (0) than NE (45)
    expect(getWindDirection(22)).toBe('N');
    // 23 degrees is closer to NE (45) than N (0)
    expect(getWindDirection(23)).toBe('NE');
  });
});

describe('getUvLabel', () => {
  it('returns Low for 0', () => {
    expect(getUvLabel(0)).toBe('Low');
  });

  it('returns Low for 2', () => {
    expect(getUvLabel(2)).toBe('Low');
  });

  it('returns Moderate for 3', () => {
    expect(getUvLabel(3)).toBe('Moderate');
  });

  it('returns Moderate for 5', () => {
    expect(getUvLabel(5)).toBe('Moderate');
  });

  it('returns High for 6', () => {
    expect(getUvLabel(6)).toBe('High');
  });

  it('returns High for 7', () => {
    expect(getUvLabel(7)).toBe('High');
  });

  it('returns Very High for 8', () => {
    expect(getUvLabel(8)).toBe('Very High');
  });

  it('returns Very High for 10', () => {
    expect(getUvLabel(10)).toBe('Very High');
  });

  it('returns Extreme for 11', () => {
    expect(getUvLabel(11)).toBe('Extreme');
  });

  it('returns Extreme for 14', () => {
    expect(getUvLabel(14)).toBe('Extreme');
  });
});
