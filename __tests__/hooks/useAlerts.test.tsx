import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useAlerts } from '@/hooks/useAlerts';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockAlerts = [
  {
    headline: 'Severe Thunderstorm Warning',
    severity: 'Severe' as const,
    event: 'Thunderstorm',
    description: 'A severe thunderstorm is approaching.',
    effective: '2025-07-01T12:00:00Z',
    expires: '2025-07-01T18:00:00Z',
  },
];

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = originalFetch;
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('useAlerts', () => {
  it('fetches from correct endpoint with lat/lon params', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAlerts),
    }) as jest.Mock;

    renderHook(() => useAlerts('43.65', '-79.38'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/alerts?lat=43.65&lon=-79.38'),
      );
    });
  });

  it('returns loading state initially', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;

    const { result } = renderHook(() => useAlerts('43.65', '-79.38'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns data on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAlerts),
    }) as jest.Mock;

    const { result } = renderHook(() => useAlerts('43.65', '-79.38'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockAlerts);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
    }) as jest.Mock;

    const { result } = renderHook(() => useAlerts('43.65', '-79.38'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.data).toBeUndefined();
  });

  it('does not fetch when lat or lon is empty', () => {
    global.fetch = jest.fn() as jest.Mock;

    renderHook(() => useAlerts('', ''), { wrapper: createWrapper() });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
