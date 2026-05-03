import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { useMonthlyWeather } from '@/hooks/useMonthlyWeather';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = originalFetch;
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('useMonthlyWeather', () => {
  it('fetches two windows (past-actual + historical baseline) from /api/history', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    global.fetch = fetchMock as jest.Mock;

    renderHook(() => useMonthlyWeather('43.65', '-79.38', 'America/Toronto'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const calls = fetchMock.mock.calls.map((c) => c[0] as string);
    calls.forEach((url) => {
      expect(url).toContain('/api/history');
      expect(url).toContain('lat=43.65');
      expect(url).toContain('lon=-79.38');
      expect(url).toContain('tz=America%2FToronto');
      expect(url).toContain('start_date=');
      expect(url).toContain('end_date=');
    });
  });

  it('does not fetch when lat/lon/timezone are empty', () => {
    global.fetch = jest.fn() as jest.Mock;

    renderHook(() => useMonthlyWeather('', '', ''), { wrapper: createWrapper() });
    renderHook(() => useMonthlyWeather('43.65', '-79.38', ''), { wrapper: createWrapper() });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns { pastActual, historicalBaseline } on success', async () => {
    const past = [
      {
        date: '2024-05-20',
        weatherCode: 0,
        highTemp: 22,
        lowTemp: 12,
        feelsLikeHigh: 23,
        feelsLikeLow: 11,
        precipitationSum: 0,
        precipitationProbability: 0,
        windSpeedMax: 10,
        uvIndexMax: 5,
        sunrise: '2024-05-20T05:30',
        sunset: '2024-05-20T20:45',
      },
    ];
    const baseline = [
      {
        date: '2023-05-20',
        weatherCode: 0,
        highTemp: 20,
        lowTemp: 10,
        feelsLikeHigh: 21,
        feelsLikeLow: 9,
        precipitationSum: 0,
        precipitationProbability: 0,
        windSpeedMax: 10,
        uvIndexMax: 5,
        sunrise: '2023-05-20T05:30',
        sunset: '2023-05-20T20:45',
      },
    ];

    // Dispatch by the year in the URL's start_date — Promise.all runs both calls in
    // parallel so call order is non-deterministic. The baseline window is shifted
    // one year back from the past-actual window.
    const currentYear = new Date().getFullYear();
    const priorYear = currentYear - 1;
    global.fetch = jest.fn().mockImplementation((url: string) => {
      const match = new URL(url, 'http://localhost').searchParams.get('start_date');
      const year = match ? parseInt(match.slice(0, 4), 10) : currentYear;
      const isBaseline = year <= priorYear;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(isBaseline ? baseline : past),
      });
    }) as jest.Mock;

    const { result } = renderHook(() => useMonthlyWeather('43.65', '-79.38', 'America/Toronto'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data!.pastActual).toEqual(past);
    expect(result.current.data!.historicalBaseline).toEqual(baseline);
  });

  it('returns error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 502 }) as jest.Mock;

    const { result } = renderHook(() => useMonthlyWeather('43.65', '-79.38', 'America/Toronto'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.data).toBeUndefined();
  });
});
