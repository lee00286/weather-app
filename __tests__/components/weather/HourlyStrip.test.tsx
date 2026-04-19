import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { HourlyStrip } from '@/components/weather/HourlyStrip';
import type { DailyForecast, HourlyForecast } from '@/lib/types';

// Use a fixed "today" for all tests
const TODAY = '2024-06-15';

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

function makeDaily(dates: string[]): DailyForecast[] {
  return dates.map((date) => ({
    date,
    weatherCode: 0,
    highTemp: 22,
    lowTemp: 12,
    feelsLikeHigh: 21,
    feelsLikeLow: 11,
    precipitationSum: 0,
    precipitationProbability: 0,
    windSpeedMax: 15,
    uvIndexMax: 5,
    sunrise: `${date}T06:00`,
    sunset: `${date}T20:00`,
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
    const hourly = makeHourly(TODAY, 24);
    const daily = makeDaily([TODAY]);
    render(<HourlyStrip hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    // Shows all hours including past ones
    expect(screen.getByText('1 AM')).toBeInTheDocument();
    expect(screen.getByText('16°')).toBeInTheDocument();
    // "Now" appears on the current hour (12 PM), not the first item
    expect(screen.getByText('Now')).toBeInTheDocument();
    // 12 AM still shows as a regular time
    expect(screen.getByText('12 AM')).toBeInTheDocument();
  });

  it('shows calendar with daily high/low temps', () => {
    const hourly = makeHourly(TODAY, 5);
    const daily = makeDaily([TODAY]);
    render(<HourlyStrip hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    expect(screen.getByText('22°/12°')).toBeInTheDocument();
  });

  it('shows no hourly data message for dates without hourly data', async () => {
    jest.useRealTimers();
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2024-06-15T12:00:00Z'));

    const hourly = makeHourly(TODAY, 5);
    const daily = makeDaily([TODAY, '2024-06-20']);
    render(<HourlyStrip hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    await userEvent
      .setup({ advanceTimers: jest.advanceTimersByTime })
      .click(screen.getByText('20'));

    expect(screen.getByText(/No hourly data/)).toBeInTheDocument();
  });

  it('can navigate between months', async () => {
    jest.useRealTimers();
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2024-06-15T12:00:00Z'));

    const hourly = makeHourly(TODAY, 5);
    const daily = makeDaily([TODAY]);
    render(<HourlyStrip hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    expect(screen.getByText('June 2024')).toBeInTheDocument();

    await userEvent
      .setup({ advanceTimers: jest.advanceTimersByTime })
      .click(screen.getByLabelText('Next month'));
    expect(screen.getByText('July 2024')).toBeInTheDocument();

    await userEvent
      .setup({ advanceTimers: jest.advanceTimersByTime })
      .click(screen.getByLabelText('Previous month'));
    expect(screen.getByText('June 2024')).toBeInTheDocument();
  });
});
