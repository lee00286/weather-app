import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useAirQuality } from '@/hooks/useAirQuality';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const mockAq = { currentUsAqi: 32, hourly: [], timezone: 'America/Toronto' };

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => mockAq });
});
afterEach(() => jest.resetAllMocks());

describe('useAirQuality', () => {
  it('fetches /api/air-quality with coords and returns data', async () => {
    const { result } = renderHook(() => useAirQuality('43.65', '-79.38'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.currentUsAqi).toBe(32);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/api/air-quality?');
    expect(url).toContain('lat=43.65');
  });

  it('is disabled without coords', () => {
    const { result } = renderHook(() => useAirQuality('', ''), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});
