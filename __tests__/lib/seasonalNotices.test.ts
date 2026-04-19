import { describe, expect, it } from '@jest/globals';

import { getSeasonalNotices } from '@/lib/seasonalNotices';

describe('getSeasonalNotices', () => {
  it('triggers cherry blossom for Toronto in April', () => {
    const notices = getSeasonalNotices(
      'Toronto',
      { temperature: 15, uvIndex: 4 },
      new Date('2025-04-20'),
    );
    const cherry = notices.find((n) => n.id === 'cherry-blossom');
    expect(cherry).toBeDefined();
    expect(cherry!.type).toBe('seasonal');
  });

  it('does not trigger cherry blossom for Toronto in July', () => {
    const notices = getSeasonalNotices(
      'Toronto',
      { temperature: 28, uvIndex: 6 },
      new Date('2025-07-15'),
    );
    expect(notices.find((n) => n.id === 'cherry-blossom')).toBeUndefined();
  });

  it('triggers frost tip when temperature is 0', () => {
    const notices = getSeasonalNotices(
      'Vancouver',
      { temperature: 0, uvIndex: 1 },
      new Date('2025-01-15'),
    );
    const frost = notices.find((n) => n.id === 'frost-tip');
    expect(frost).toBeDefined();
    expect(frost!.type).toBe('tip');
  });

  it('triggers frost tip when temperature is below 0', () => {
    const notices = getSeasonalNotices(
      'Montreal',
      { temperature: -5, uvIndex: 1 },
      new Date('2025-02-01'),
    );
    expect(notices.find((n) => n.id === 'frost-tip')).toBeDefined();
  });

  it('does not trigger frost tip when temperature is above 0', () => {
    const notices = getSeasonalNotices(
      'Toronto',
      { temperature: 1, uvIndex: 3 },
      new Date('2025-03-15'),
    );
    expect(notices.find((n) => n.id === 'frost-tip')).toBeUndefined();
  });

  it('triggers UV warning when UV index is above 8', () => {
    const notices = getSeasonalNotices(
      'Sydney',
      { temperature: 30, uvIndex: 9 },
      new Date('2025-01-10'),
    );
    const uv = notices.find((n) => n.id === 'uv-warning');
    expect(uv).toBeDefined();
    expect(uv!.type).toBe('info');
  });

  it('does not trigger UV warning when UV index is 8', () => {
    const notices = getSeasonalNotices(
      'Sydney',
      { temperature: 28, uvIndex: 8 },
      new Date('2025-01-10'),
    );
    expect(notices.find((n) => n.id === 'uv-warning')).toBeUndefined();
  });

  it('triggers heat advisory when temperature is above 35', () => {
    const notices = getSeasonalNotices(
      'Dubai',
      { temperature: 40, uvIndex: 7 },
      new Date('2025-08-01'),
    );
    const heat = notices.find((n) => n.id === 'heat-advisory');
    expect(heat).toBeDefined();
    expect(heat!.type).toBe('info');
  });

  it('does not trigger heat advisory when temperature is 35', () => {
    const notices = getSeasonalNotices(
      'Dubai',
      { temperature: 35, uvIndex: 7 },
      new Date('2025-08-01'),
    );
    expect(notices.find((n) => n.id === 'heat-advisory')).toBeUndefined();
  });

  it('returns multiple notices simultaneously', () => {
    // Toronto in April with freezing temp and high UV — triggers cherry blossom + frost + UV
    const notices = getSeasonalNotices(
      'Toronto',
      { temperature: -2, uvIndex: 10 },
      new Date('2025-04-20'),
    );
    const ids = notices.map((n) => n.id);
    expect(ids).toContain('cherry-blossom');
    expect(ids).toContain('frost-tip');
    expect(ids).toContain('uv-warning');
    expect(notices.length).toBeGreaterThanOrEqual(3);
  });

  it('triggers hurricane season for Miami in August', () => {
    const notices = getSeasonalNotices(
      'Miami',
      { temperature: 32, uvIndex: 7 },
      new Date('2025-08-15'),
    );
    expect(notices.find((n) => n.id === 'hurricane-season')).toBeDefined();
  });

  it('does not trigger hurricane season for Miami in March', () => {
    const notices = getSeasonalNotices(
      'Miami',
      { temperature: 25, uvIndex: 5 },
      new Date('2025-03-15'),
    );
    expect(notices.find((n) => n.id === 'hurricane-season')).toBeUndefined();
  });
});
