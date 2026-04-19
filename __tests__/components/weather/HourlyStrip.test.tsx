import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { HourlyStrip } from '@/components/weather/HourlyStrip';
import type { HourlyForecast } from '@/lib/types';

function makeHourly(date: string, hours: number): HourlyForecast[] {
  return Array.from({ length: hours }, (_, i) => ({
    time: `${date}T${String(i).padStart(2, '0')}:00`,
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

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('HourlyStrip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders hourly items with time and temperature', () => {
    const hours = makeHourly('2024-06-15', 24);
    render(<HourlyStrip hours={hours} timezone="UTC" isToday />);

    expect(screen.getByText('1 AM')).toBeInTheDocument();
    expect(screen.getByText('16°')).toBeInTheDocument();
    // "Now" replaces the 12 PM label when today
    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByText('12 AM')).toBeInTheDocument();
  });

  it('does not show "Now" label when not today', () => {
    const hours = makeHourly('2024-06-20', 24);
    render(<HourlyStrip hours={hours} timezone="UTC" isToday={false} />);

    expect(screen.queryByText('Now')).not.toBeInTheDocument();
    expect(screen.getByText('12 PM')).toBeInTheDocument();
  });

  it('renders empty state for empty hours array', () => {
    render(<HourlyStrip hours={[]} timezone="UTC" isToday />);
    expect(screen.getByText(/No hourly data/)).toBeInTheDocument();
  });
});
