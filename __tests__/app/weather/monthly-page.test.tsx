import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

import MonthlyForecast from '@/app/weather/[location]/monthly/page';
import type { DailyForecast, WeatherData } from '@/lib/types';

function wrap(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function setSearchParams(query: string) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(query));
}

function makeDaily(date: string, avg: number): DailyForecast {
  return {
    date,
    weatherCode: 0,
    highTemp: avg + 2,
    lowTemp: avg - 2,
    feelsLikeHigh: avg + 3,
    feelsLikeLow: avg - 3,
    precipitationSum: 0,
    precipitationProbability: 10,
    windSpeedMax: 12,
    uvIndexMax: 5,
    sunrise: `${date}T05:30`,
    sunset: `${date}T20:45`,
  };
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
  daily: Array.from({ length: 14 }, (_, i) => {
    const day = 15 + i;
    return makeDaily(`2024-06-${String(day).padStart(2, '0')}`, 20 + i * 0.5);
  }),
  timezone: 'America/Toronto',
  locationName: 'Toronto',
};

const mockArchive: DailyForecast[] = Array.from({ length: 29 }, (_, i) => {
  const day = 16 + i;
  const month = day > 31 ? 6 : 5;
  const adjusted = day > 31 ? day - 31 : day;
  return makeDaily(`2024-0${month}-${String(adjusted).padStart(2, '0')}`, 16 + i * 0.3);
});

const originalFetch = global.fetch;

beforeEach(() => {
  mockUseSearchParams.mockReset();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('MonthlyForecast page', () => {
  it('shows invalid-coords fallback when lat/lon are missing', () => {
    setSearchParams('');
    wrap(<MonthlyForecast />);
    expect(screen.getByText('Invalid or missing coordinates.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to search' })).toBeInTheDocument();
  });

  it('shows invalid-coords fallback when lat is out of range', () => {
    setSearchParams('lat=200&lon=0');
    wrap(<MonthlyForecast />);
    expect(screen.getByText('Invalid or missing coordinates.')).toBeInTheDocument();
  });

  it('shows invalid-coords fallback when lat is NaN', () => {
    setSearchParams('lat=abc&lon=0');
    wrap(<MonthlyForecast />);
    expect(screen.getByText('Invalid or missing coordinates.')).toBeInTheDocument();
  });

  it('renders the monthly trend chart when both queries succeed', async () => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/weather')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWeatherData) });
      }
      if (url.includes('/api/history')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockArchive) });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    }) as jest.Mock;

    setSearchParams('lat=43.65&lon=-79.38');
    wrap(<MonthlyForecast />);

    await waitFor(() => {
      expect(screen.getByLabelText('Monthly temperature trend chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Monthly temperature trend')).toBeInTheDocument();
  });

  it('renders error state when weather fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 502 }) as jest.Mock;
    setSearchParams('lat=43.65&lon=-79.38');

    wrap(<MonthlyForecast />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load weather data.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders error state when history fetch fails', async () => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/weather')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWeatherData) });
      }
      return Promise.resolve({ ok: false, status: 502 });
    }) as jest.Mock;
    setSearchParams('lat=43.65&lon=-79.38');

    wrap(<MonthlyForecast />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load weather data.')).toBeInTheDocument();
    });
  });
});
