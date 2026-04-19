import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { TemperatureChart } from '@/components/charts/TemperatureChart';
import type { HourlyForecast } from '@/lib/types';

function makeHourly(count: number): HourlyForecast[] {
  return Array.from({ length: count }, (_, i) => ({
    time: `2024-06-15T${String(i).padStart(2, '0')}:00`,
    temperature: 15 + i,
    feelsLike: 14 + i,
    weatherCode: 0,
    precipitationProbability: 0,
    precipitation: 0,
    windSpeed: 10,
    windDirection: 180,
    uvIndex: 3,
    humidity: 50,
  }));
}

describe('TemperatureChart', () => {
  it('renders with an accessible label when data is provided', () => {
    render(<TemperatureChart hours={makeHourly(24)} timezone="UTC" />);
    expect(screen.getByLabelText('Hourly temperature chart')).toBeInTheDocument();
  });

  it('renders empty state message when hours array is empty', () => {
    render(<TemperatureChart hours={[]} timezone="UTC" />);
    expect(screen.getByText('No temperature data')).toBeInTheDocument();
    expect(screen.queryByLabelText('Hourly temperature chart')).not.toBeInTheDocument();
  });

  it('does not crash with a single data point', () => {
    render(<TemperatureChart hours={makeHourly(1)} timezone="UTC" />);
    expect(screen.getByLabelText('Hourly temperature chart')).toBeInTheDocument();
  });

  it('renders without crashing on a 25-hour fall-back DST day', () => {
    render(<TemperatureChart hours={makeHourly(25)} timezone="America/New_York" />);
    expect(screen.getByLabelText('Hourly temperature chart')).toBeInTheDocument();
  });
});
