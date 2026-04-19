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
  it('returns North for 0 degrees', () => {
    expect(getWindDirection(0)).toBe('North');
  });

  it('returns Northeast for 45 degrees', () => {
    expect(getWindDirection(45)).toBe('Northeast');
  });

  it('returns East for 90 degrees', () => {
    expect(getWindDirection(90)).toBe('East');
  });

  it('returns Southeast for 135 degrees', () => {
    expect(getWindDirection(135)).toBe('Southeast');
  });

  it('returns South for 180 degrees', () => {
    expect(getWindDirection(180)).toBe('South');
  });

  it('returns Southwest for 225 degrees', () => {
    expect(getWindDirection(225)).toBe('Southwest');
  });

  it('returns West for 270 degrees', () => {
    expect(getWindDirection(270)).toBe('West');
  });

  it('returns Northwest for 315 degrees', () => {
    expect(getWindDirection(315)).toBe('Northwest');
  });

  it('returns North for 360 degrees', () => {
    expect(getWindDirection(360)).toBe('North');
  });

  it('rounds to nearest direction for boundary values', () => {
    expect(getWindDirection(22)).toBe('North');
    expect(getWindDirection(23)).toBe('Northeast');
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
