import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';

import type { LocationSearchResult } from '@/lib/types';

import { useLocationSearch } from '@/hooks/useLocationSearch';

const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

afterEach(() => {
  global.fetch = originalFetch;
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createMockResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  } as unknown as Response;
}

function mockResponse(body: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce(createMockResponse(body, status));
}

const mockResults: LocationSearchResult[] = [
  {
    name: 'Toronto',
    region: 'Ontario',
    country: 'Canada',
    lat: 43.67,
    lon: -79.42,
    url: 'toronto-ontario-canada',
  },
];

describe('useLocationSearch', () => {
  it('returns empty array when query is too short (< 2 chars)', () => {
    const { result } = renderHook(() => useLocationSearch('T'), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns empty array when query is empty', () => {
    const { result } = renderHook(() => useLocationSearch(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches results for valid query', async () => {
    mockResponse(mockResults);

    const { result } = renderHook(() => useLocationSearch('Toronto'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });

    expect(result.current.data![0].name).toBe('Toronto');
    expect(result.current.data![0].region).toBe('Ontario');
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/search?q=Toronto');
  });

  it('returns loading state while fetching', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useLocationSearch('Toronto'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
  });

  it('handles API error gracefully', async () => {
    mockResponse({ error: 'Server error' }, 500);

    const { result } = renderHook(() => useLocationSearch('Toronto'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('caches results (same query does not refetch within staleTime)', async () => {
    mockResponse(mockResults);

    const wrapper = createWrapper();

    const { result, unmount } = renderHook(() => useLocationSearch('Toronto'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });

    unmount();

    // Re-render with same query — should use cache
    const { result: result2 } = renderHook(() => useLocationSearch('Toronto'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result2.current.data).toHaveLength(1);
    });

    // Only one fetch call — the second render used cache
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
