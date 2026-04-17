import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useWeather } from '@/hooks/useWeather';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockWeatherData = {
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
  daily: [],
  timezone: 'America/Toronto',
  locationName: '',
};

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = originalFetch;
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('useWeather', () => {
  it('fetches from correct endpoint with lat/lon params', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
    }) as jest.Mock;

    renderHook(() => useWeather('43.65', '-79.38'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/weather?lat=43.65&lon=-79.38&tz=auto'),
      );
    });
  });

  it('returns loading state initially', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;

    const { result } = renderHook(() => useWeather('43.65', '-79.38'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns data on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
    }) as jest.Mock;

    const { result } = renderHook(() => useWeather('43.65', '-79.38'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockWeatherData);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
    }) as jest.Mock;

    const { result } = renderHook(() => useWeather('43.65', '-79.38'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.data).toBeUndefined();
  });

  it('does not fetch when lat or lon is empty', () => {
    global.fetch = jest.fn() as jest.Mock;

    renderHook(() => useWeather('', ''), { wrapper: createWrapper() });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
