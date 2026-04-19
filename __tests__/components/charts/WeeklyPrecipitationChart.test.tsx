import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { WeeklyPrecipitationChart } from '@/components/charts/WeeklyPrecipitationChart';
import type { DailyForecast } from '@/lib/types';

function makeDaily(count: number): DailyForecast[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2024-06-${String(i + 1).padStart(2, '0')}`,
    weatherCode: 0,
    highTemp: 20 + i,
    lowTemp: 10 + i,
    feelsLikeHigh: 21 + i,
    feelsLikeLow: 9 + i,
    precipitationSum: i * 0.5,
    precipitationProbability: i * 6,
    windSpeedMax: 15,
    uvIndexMax: 6,
    sunrise: `2024-06-${String(i + 1).padStart(2, '0')}T05:30`,
    sunset: `2024-06-${String(i + 1).padStart(2, '0')}T20:45`,
  }));
}

describe('WeeklyPrecipitationChart', () => {
  it('renders with an accessible label when data is provided', () => {
    render(<WeeklyPrecipitationChart days={makeDaily(14)} timezone="UTC" />);
    expect(screen.getByLabelText('14-day precipitation chart')).toBeInTheDocument();
  });

  it('renders empty state when days array is empty', () => {
    render(<WeeklyPrecipitationChart days={[]} timezone="UTC" />);
    expect(screen.getByText('No precipitation data')).toBeInTheDocument();
    expect(screen.queryByLabelText('14-day precipitation chart')).not.toBeInTheDocument();
  });

  it('renders with a single day', () => {
    render(<WeeklyPrecipitationChart days={makeDaily(1)} timezone="UTC" />);
    expect(screen.getByLabelText('14-day precipitation chart')).toBeInTheDocument();
  });

  it('renders the chart heading', () => {
    render(<WeeklyPrecipitationChart days={makeDaily(7)} timezone="UTC" />);
    expect(screen.getByText('Daily precipitation chance')).toBeInTheDocument();
  });
});
