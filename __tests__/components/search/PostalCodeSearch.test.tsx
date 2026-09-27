import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

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

import { PostalCodeSearch } from '@/components/search/PostalCodeSearch';

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

const berlin = {
  name: 'Berlin',
  region: 'Berlin',
  country: 'Germany',
  lat: 52.53,
  lon: 13.38,
  url: '',
};

describe('PostalCodeSearch', () => {
  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockPush.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders a country selector, postal input, and Go button', () => {
    render(<PostalCodeSearch />);

    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Postal code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Germany' })).toBeInTheDocument();
  });

  it('geocodes and navigates on submit', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(berlin));

    render(<PostalCodeSearch />);

    await userEvent.type(screen.getByLabelText('Postal code'), '10115');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/weather/berlin-berlin-germany?lat=52.53&lon=13.38');
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/geocode');
    expect(calledUrl).toContain('country=de');
    expect(calledUrl).toContain('postal=10115');
  });

  it('uses the selected country in the request', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ ...berlin, name: 'Prague' }));

    render(<PostalCodeSearch />);

    await userEvent.selectOptions(screen.getByLabelText('Country'), 'cz');
    await userEvent.type(screen.getByLabelText('Postal code'), '11000');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('country=cz');
    expect(calledUrl).toContain('postal=11000');
  });

  it('triggers lookup when Enter is pressed in the postal input', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(berlin));

    render(<PostalCodeSearch />);

    await userEvent.type(screen.getByLabelText('Postal code'), '10115{Enter}');

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
  });

  it('shows a not-found message when no location matches', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'No location found for that postal code' }, 404),
    );

    render(<PostalCodeSearch />);

    await userEvent.type(screen.getByLabelText('Postal code'), '00000');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    await waitFor(() => {
      expect(screen.getByText(/no location found/i)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not fetch when the postal input is empty', async () => {
    render(<PostalCodeSearch />);

    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
