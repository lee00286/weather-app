import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from '@jest/globals';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

import { useNavigateToLocation } from '@/hooks/useNavigateToLocation';

beforeEach(() => {
  mockPush.mockReset();
});

describe('useNavigateToLocation', () => {
  it('pushes the weather route with slug and coordinates', () => {
    const { result } = renderHook(() => useNavigateToLocation());

    result.current({
      name: 'Berlin',
      region: 'Berlin',
      country: 'Germany',
      lat: 52.53,
      lon: 13.38,
      url: '',
    });

    expect(mockPush).toHaveBeenCalledWith('/weather/berlin-berlin-germany?lat=52.53&lon=13.38');
  });

  it('preserves negative coordinates', () => {
    const { result } = renderHook(() => useNavigateToLocation());

    result.current({
      name: 'Toronto',
      region: 'Ontario',
      country: 'Canada',
      lat: 43.67,
      lon: -79.42,
      url: '',
    });

    expect(mockPush).toHaveBeenCalledWith('/weather/toronto-ontario-canada?lat=43.67&lon=-79.42');
  });
});
