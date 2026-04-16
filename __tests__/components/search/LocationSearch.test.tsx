import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

// Must use global jest.mock for hoisting to work with next/jest SWC transform
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

import { LocationSearch } from '@/components/search/LocationSearch';

const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
const originalFetch = global.fetch;

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

const mockResults = [
  {
    name: 'Toronto',
    region: 'Ontario',
    country: 'Canada',
    lat: 43.67,
    lon: -79.42,
    url: 'toronto-ontario-canada',
  },
  {
    name: 'Tokyo',
    region: 'Tokyo',
    country: 'Japan',
    lat: 35.69,
    lon: 139.69,
    url: 'tokyo-tokyo-japan',
  },
];

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

describe('LocationSearch', () => {
  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockPush.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders input with placeholder and search button', () => {
    render(<LocationSearch />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText('Search city or postal code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('clicking search button with valid input shows results', async () => {
    mockResponse(mockResults);

    render(<LocationSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search city or postal code');
    const button = screen.getByRole('button', { name: 'Search' });

    await userEvent.type(input, 'Toronto');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Toronto')).toBeInTheDocument();
    });

    expect(screen.getByText(/Ontario/)).toBeInTheDocument();
    expect(screen.getByText(/Canada/)).toBeInTheDocument();
  });

  it('pressing Enter in input triggers search', async () => {
    mockResponse(mockResults);

    render(<LocationSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search city or postal code');
    await userEvent.type(input, 'Toronto{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Toronto')).toBeInTheDocument();
    });
  });

  it('shows "No results found" for empty results', async () => {
    mockResponse([]);

    render(<LocationSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search city or postal code');
    await userEvent.type(input, 'asdfghjkl{Enter}');

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('shows loading state while searching', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<LocationSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search city or postal code');
    await userEvent.type(input, 'Toronto{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  it('navigates on result click', async () => {
    mockResponse(mockResults);

    render(<LocationSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search city or postal code');
    await userEvent.type(input, 'Tor{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Toronto')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Toronto'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/weather/toronto-ontario-canada'),
    );
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('lat=43.67'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('lon=-79.42'));
  });

  it('respects 200 char max length', () => {
    render(<LocationSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search city or postal code');
    expect(input).toHaveAttribute('maxLength', '200');
  });

  it('does NOT auto-search on typing (no fetch until button click or Enter)', async () => {
    render(<LocationSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search city or postal code');
    await userEvent.type(input, 'Toronto');

    // No fetch should have been called — search only triggers on explicit action
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows error state for API failures', async () => {
    mockResponse({ error: 'Server error' }, 500);

    render(<LocationSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search city or postal code');
    await userEvent.type(input, 'Toronto{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });
});
