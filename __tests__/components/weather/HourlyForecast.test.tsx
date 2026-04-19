import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { HourlyForecast } from '@/components/weather/HourlyForecast';
import type { DailyForecast, HourlyForecast as HourlyForecastType } from '@/lib/types';

function makeHourly(date: string, hours: number): HourlyForecastType[] {
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

Element.prototype.scrollIntoView = jest.fn();

describe('HourlyForecast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders today heading and hourly cards by default', () => {
    const hourly = [...makeHourly('2024-06-15', 24), ...makeHourly('2024-06-16', 24)];
    const daily = makeDaily(['2024-06-15', '2024-06-16']);
    render(<HourlyForecast hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    expect(screen.getByText('Today, hourly')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
  });

  it('renders calendar with daily high/low temps', () => {
    const hourly = makeHourly('2024-06-15', 24);
    const daily = makeDaily(['2024-06-15']);
    render(<HourlyForecast hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    expect(screen.getByText('22°/12°')).toBeInTheDocument();
  });

  it('switches selected date when calendar day is clicked', async () => {
    const hourly = [...makeHourly('2024-06-15', 24), ...makeHourly('2024-06-16', 24)];
    const daily = makeDaily(['2024-06-15', '2024-06-16']);
    render(<HourlyForecast hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    await userEvent
      .setup({ advanceTimers: jest.advanceTimersByTime })
      .click(screen.getByText('16'));

    expect(screen.getByText(/Sunday, June 16/)).toBeInTheDocument();
    expect(screen.queryByText('Now')).not.toBeInTheDocument();
  });

  it('shows charts when there is hourly data for the selected day', () => {
    const hourly = makeHourly('2024-06-15', 24);
    const daily = makeDaily(['2024-06-15']);
    render(<HourlyForecast hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    expect(screen.getByLabelText('Hourly temperature chart')).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly precipitation chart')).toBeInTheDocument();
  });

  it('does not render charts for a day with no hourly data', async () => {
    const hourly = makeHourly('2024-06-15', 24);
    const daily = makeDaily(['2024-06-15', '2024-06-20']);
    render(<HourlyForecast hourlyData={hourly} dailyData={daily} timezone="UTC" />);

    await userEvent
      .setup({ advanceTimers: jest.advanceTimersByTime })
      .click(screen.getByText('20'));

    expect(screen.queryByLabelText('Hourly temperature chart')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Hourly precipitation chart')).not.toBeInTheDocument();
  });
});
