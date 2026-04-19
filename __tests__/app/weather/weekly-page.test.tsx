import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Must use global jest.mock for hoisting to work with next/jest SWC transform.
const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

import WeeklyForecast from '@/app/weather/[location]/weekly/page';
import type { DailyForecast, WeatherData } from '@/lib/types';

function wrap(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function setSearchParams(query: string) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(query));
}

function makeDaily(count: number): DailyForecast[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2024-06-${String(i + 1).padStart(2, '0')}`,
    weatherCode: 0,
    highTemp: 22 + i,
    lowTemp: 12 + i,
    feelsLikeHigh: 23 + i,
    feelsLikeLow: 11 + i,
    precipitationSum: 0,
    precipitationProbability: 10 + i,
    windSpeedMax: 12,
    uvIndexMax: 5,
    sunrise: `2024-06-${String(i + 1).padStart(2, '0')}T05:30`,
    sunset: `2024-06-${String(i + 1).padStart(2, '0')}T20:45`,
  }));
}

const mockWeatherData: WeatherData = {
  current: {
    temperature: 18,
    feelsLike: 15,
    weatherCode: 2,
    humidity: 65,
    windSpeed: 12,
    windDirection: 180,
    precipitation: 0,
    pressure: 1013,
    uvIndex: 5,
    highTemp: 22,
    lowTemp: 12,
    isDay: true,
  },
  hourly: [],
  daily: makeDaily(14),
  timezone: 'America/Toronto',
  locationName: 'Toronto',
};

const originalFetch = global.fetch;

beforeEach(() => {
  mockUseSearchParams.mockReset();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('WeeklyForecast page', () => {
  it('shows invalid-coords fallback when lat/lon are missing', () => {
    setSearchParams('');
    wrap(<WeeklyForecast />);
    expect(screen.getByText('Invalid or missing coordinates.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to search' })).toBeInTheDocument();
  });

  it('shows invalid-coords fallback when lat is out of range', () => {
    setSearchParams('lat=200&lon=0');
    wrap(<WeeklyForecast />);
    expect(screen.getByText('Invalid or missing coordinates.')).toBeInTheDocument();
  });

  it('shows invalid-coords fallback when lat is NaN', () => {
    setSearchParams('lat=abc&lon=0');
    wrap(<WeeklyForecast />);
    expect(screen.getByText('Invalid or missing coordinates.')).toBeInTheDocument();
  });

  it('renders weekly list + charts when data loads', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
    }) as jest.Mock;
    setSearchParams('lat=43.65&lon=-79.38');

    wrap(<WeeklyForecast />);

    await waitFor(() => {
      expect(screen.getByRole('list', { name: '14-day forecast' })).toBeInTheDocument();
    });

    expect(screen.getByLabelText('14-day temperature range chart')).toBeInTheDocument();
    expect(screen.getByLabelText('14-day precipitation chart')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(14);
  });

  it('renders error state when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
    }) as jest.Mock;
    setSearchParams('lat=43.65&lon=-79.38');

    wrap(<WeeklyForecast />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load weather data.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
