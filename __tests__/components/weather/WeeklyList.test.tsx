import { describe, expect, it } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import { DateTime } from 'luxon';
import React from 'react';

import { WeeklyList } from '@/components/weather/WeeklyList';
import type { DailyForecast } from '@/lib/types';

function makeDaily(count: number, startDate: string): DailyForecast[] {
  const start = DateTime.fromISO(startDate, { zone: 'UTC' });
  return Array.from({ length: count }, (_, i) => ({
    date: start.plus({ days: i }).toFormat('yyyy-MM-dd'),
    weatherCode: 0,
    highTemp: 22.4 + i,
    lowTemp: 11.6 + i,
    feelsLikeHigh: 23 + i,
    feelsLikeLow: 10 + i,
    precipitationSum: 0,
    precipitationProbability: 20 + i,
    windSpeedMax: 12,
    uvIndexMax: 5,
    sunrise: `${start.plus({ days: i }).toFormat('yyyy-MM-dd')}T05:30`,
    sunset: `${start.plus({ days: i }).toFormat('yyyy-MM-dd')}T20:45`,
  }));
}

describe('WeeklyList', () => {
  it('renders a list labeled 14-day forecast', () => {
    render(<WeeklyList days={makeDaily(14, '2024-06-15')} timezone="UTC" />);
    expect(screen.getByRole('list', { name: '14-day forecast' })).toBeInTheDocument();
  });

  it('renders one list item per day', () => {
    render(<WeeklyList days={makeDaily(14, '2024-06-15')} timezone="UTC" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(14);
  });

  it('labels the first row "Today" with aria-current="date"', () => {
    render(<WeeklyList days={makeDaily(3, '2024-06-15')} timezone="UTC" />);
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('Today')).toBeInTheDocument();
    expect(items[0]).toHaveAttribute('aria-current', 'date');
  });

  it('labels the second row "Tomorrow"', () => {
    render(<WeeklyList days={makeDaily(3, '2024-06-15')} timezone="UTC" />);
    const items = screen.getAllByRole('listitem');
    expect(within(items[1]).getByText('Tomorrow')).toBeInTheDocument();
    expect(items[1]).not.toHaveAttribute('aria-current');
  });

  it('formats later rows as "EEE, MMM d"', () => {
    render(<WeeklyList days={makeDaily(3, '2024-06-15')} timezone="UTC" />);
    const items = screen.getAllByRole('listitem');
    // 2024-06-17 is a Monday
    expect(within(items[2]).getByText('Mon, Jun 17')).toBeInTheDocument();
  });

  it('rounds high and low temperatures', () => {
    render(<WeeklyList days={makeDaily(1, '2024-06-15')} timezone="UTC" />);
    const item = screen.getByRole('listitem');
    // 22.4 rounds to 22, 11.6 rounds to 12
    expect(within(item).getByText('22°')).toBeInTheDocument();
    expect(within(item).getByText('12°')).toBeInTheDocument();
  });

  it('displays precipitation probability', () => {
    render(<WeeklyList days={makeDaily(1, '2024-06-15')} timezone="UTC" />);
    expect(screen.getByText(/20%/)).toBeInTheDocument();
  });

  it('renders empty state when days is empty', () => {
    render(<WeeklyList days={[]} timezone="UTC" />);
    expect(screen.getByText('No forecast available')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('includes aria-label describing the weather condition for screen readers', () => {
    render(<WeeklyList days={makeDaily(1, '2024-06-15')} timezone="UTC" />);
    // weatherCode 0 → "Clear sky"
    expect(screen.getByLabelText('Clear sky')).toBeInTheDocument();
  });
});
