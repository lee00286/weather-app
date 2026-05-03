import { describe, expect, it } from '@jest/globals';
import { DateTime } from 'luxon';

import { getMonthlyRange, stitchMonthlyData } from '@/lib/monthlyStitch';
import type { DailyForecast } from '@/lib/types';

function makeDaily(date: string, avg: number): DailyForecast {
  // Build a DailyForecast whose avg (high+low)/2 equals `avg`.
  return {
    date,
    weatherCode: 0,
    highTemp: avg + 2,
    lowTemp: avg - 2,
    feelsLikeHigh: avg + 3,
    feelsLikeLow: avg - 3,
    precipitationSum: 0,
    precipitationProbability: 0,
    windSpeedMax: 10,
    uvIndexMax: 5,
    sunrise: `${date}T05:30`,
    sunset: `${date}T20:45`,
  };
}

describe('getMonthlyRange', () => {
  it('starts 30 days before today and ends on last day of current month', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const { start, end } = getMonthlyRange(today);
    expect(start.toFormat('yyyy-MM-dd')).toBe('2024-05-16');
    expect(end.toFormat('yyyy-MM-dd')).toBe('2024-06-30');
  });

  it('handles month-start boundary — range extends backward into prior month', () => {
    const today = DateTime.fromISO('2024-03-01', { zone: 'UTC' });
    const { start, end } = getMonthlyRange(today);
    expect(start.toFormat('yyyy-MM-dd')).toBe('2024-01-31');
    expect(end.toFormat('yyyy-MM-dd')).toBe('2024-03-31');
  });

  it('handles month-end (today is last day of month)', () => {
    const today = DateTime.fromISO('2024-06-30', { zone: 'UTC' });
    const { start, end } = getMonthlyRange(today);
    expect(start.toFormat('yyyy-MM-dd')).toBe('2024-05-31');
    expect(end.toFormat('yyyy-MM-dd')).toBe('2024-06-30');
  });
});

describe('stitchMonthlyData', () => {
  it('covers entire date range with one point per day', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const points = stitchMonthlyData(today, [], [], []);
    // From 2024-05-16 through 2024-06-30 inclusive = 46 days.
    expect(points).toHaveLength(46);
    expect(points[0].date).toBe('2024-05-16');
    expect(points[points.length - 1].date).toBe('2024-06-30');
  });

  it('all past: uses archive values for days before today', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const pastActual = [makeDaily('2024-06-13', 18), makeDaily('2024-06-14', 20)];
    const points = stitchMonthlyData(today, pastActual, [], []);

    const june13 = points.find((p) => p.date === '2024-06-13');
    const june14 = points.find((p) => p.date === '2024-06-14');
    expect(june13!.actual).toBe(18);
    expect(june14!.actual).toBe(20);
  });

  it('today boundary: forecast supplies today and upcoming days, archive supplies yesterday', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const pastActual = [makeDaily('2024-06-14', 20)];
    const forecastDaily = [makeDaily('2024-06-15', 22), makeDaily('2024-06-16', 24)];
    const points = stitchMonthlyData(today, pastActual, forecastDaily, []);

    expect(points.find((p) => p.date === '2024-06-14')!.actual).toBe(20);
    expect(points.find((p) => p.date === '2024-06-15')!.actual).toBe(22);
    expect(points.find((p) => p.date === '2024-06-16')!.actual).toBe(24);
  });

  it('forecast + past mix: correctly attributes data by date relative to today', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const pastActual = [makeDaily('2024-05-20', 15), makeDaily('2024-06-10', 19)];
    const forecastDaily = [makeDaily('2024-06-15', 22), makeDaily('2024-06-20', 25)];
    const points = stitchMonthlyData(today, pastActual, forecastDaily, []);

    expect(points.find((p) => p.date === '2024-05-20')!.actual).toBe(15);
    expect(points.find((p) => p.date === '2024-06-10')!.actual).toBe(19);
    expect(points.find((p) => p.date === '2024-06-15')!.actual).toBe(22);
    expect(points.find((p) => p.date === '2024-06-20')!.actual).toBe(25);
  });

  it('gap beyond forecast horizon: days later in month with no forecast data get null actual', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    // Forecast covers today + next 5 days only (not the full rest of the month).
    const forecastDaily = [
      makeDaily('2024-06-15', 22),
      makeDaily('2024-06-16', 23),
      makeDaily('2024-06-17', 24),
      makeDaily('2024-06-18', 25),
      makeDaily('2024-06-19', 26),
    ];
    const points = stitchMonthlyData(today, [], forecastDaily, []);

    // Days 20-30 should have actual=null.
    const june25 = points.find((p) => p.date === '2024-06-25');
    const june30 = points.find((p) => p.date === '2024-06-30');
    expect(june25!.actual).toBeNull();
    expect(june30!.actual).toBeNull();
    // But june 17 should have its forecast value.
    expect(points.find((p) => p.date === '2024-06-17')!.actual).toBe(24);
  });

  it('past days with missing archive data get null actual', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const pastActual = [makeDaily('2024-06-14', 20)]; // only yesterday
    const points = stitchMonthlyData(today, pastActual, [], []);

    expect(points.find((p) => p.date === '2024-06-14')!.actual).toBe(20);
    expect(points.find((p) => p.date === '2024-06-10')!.actual).toBeNull();
    expect(points.find((p) => p.date === '2024-05-20')!.actual).toBeNull();
  });

  it('historical baseline: maps prior-year same-calendar-day values onto each point', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const historicalBaseline = [
      makeDaily('2023-06-13', 17),
      makeDaily('2023-06-14', 18),
      makeDaily('2023-06-15', 19),
    ];
    const points = stitchMonthlyData(today, [], [], historicalBaseline);

    expect(points.find((p) => p.date === '2024-06-13')!.historical).toBe(17);
    expect(points.find((p) => p.date === '2024-06-14')!.historical).toBe(18);
    expect(points.find((p) => p.date === '2024-06-15')!.historical).toBe(19);
    // Days without baseline data → null.
    expect(points.find((p) => p.date === '2024-06-20')!.historical).toBeNull();
  });

  it('labels format the date in short and full form', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const points = stitchMonthlyData(today, [], [], []);

    const june1 = points.find((p) => p.date === '2024-06-01');
    expect(june1!.label).toBe('Jun 1');
    expect(june1!.fullLabel).toMatch(/Sat, Jun 1/);
  });

  it('computes avg temp as (high + low) / 2', () => {
    const today = DateTime.fromISO('2024-06-15', { zone: 'UTC' });
    const pastActual: DailyForecast[] = [
      {
        date: '2024-06-14',
        weatherCode: 0,
        highTemp: 30,
        lowTemp: 10,
        feelsLikeHigh: 31,
        feelsLikeLow: 9,
        precipitationSum: 0,
        precipitationProbability: 0,
        windSpeedMax: 10,
        uvIndexMax: 5,
        sunrise: '2024-06-14T05:30',
        sunset: '2024-06-14T20:45',
      },
    ];
    const points = stitchMonthlyData(today, pastActual, [], []);
    expect(points.find((p) => p.date === '2024-06-14')!.actual).toBe(20);
  });
});
