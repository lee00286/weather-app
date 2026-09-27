/**
 * Tests for the RunningPage component (Task 12).
 *
 * Determinism strategy: the page's buildHours filters to today's remaining hours
 * using DateTime.now(). To avoid flakiness from hardcoded timestamps, we freeze
 * the Luxon clock to 2026-08-31T05:00 UTC and supply hourly entries at 06:00
 * same day — always in the future relative to the frozen "now".
 */
import { Settings } from 'luxon';

// Fix "now" to 2026-08-31T05:00:00 UTC before any module runs.
const FIXED_NOW_MS = new Date('2026-08-31T05:00:00.000Z').getTime();
Settings.now = () => FIXED_NOW_MS;

import { render, screen } from '@testing-library/react';

import RunningPage from '@/app/weather/[location]/running/page';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('lat=43.65&lon=-79.38'),
}));

// Hourly entry at 2026-08-31T06:00 — same day, later than frozen "now" of T05:00.
// The weather timezone is 'UTC' so DateTime.fromISO('2026-08-31T06:00', { zone: 'UTC' })
// is 06:00 UTC which is after 05:00 UTC, so buildHours will include it.
const weather = {
  current: {
    temperature: 14,
    feelsLike: 14,
    weatherCode: 0,
    humidity: 50,
    windSpeed: 5,
    windDirection: 200,
    precipitation: 0,
    pressure: 1012,
    uvIndex: 2,
    highTemp: 18,
    lowTemp: 9,
    isDay: true,
  },
  hourly: [
    {
      time: '2026-08-31T06:00',
      temperature: 14,
      feelsLike: 14,
      weatherCode: 0,
      precipitationProbability: 0,
      precipitation: 0,
      windSpeed: 5,
      windDirection: 200,
      uvIndex: 2,
      humidity: 50,
    },
  ],
  daily: [],
  timezone: 'UTC',
  locationName: 'Test City',
};

const aq = {
  currentUsAqi: 32,
  hourly: [{ time: '2026-08-31T06:00', usAqi: 30, pm25: 5, pm10: 10 }],
  timezone: 'UTC',
};

jest.mock('@/hooks/useWeather', () => ({ useWeather: jest.fn() }));
jest.mock('@/hooks/useAirQuality', () => ({ useAirQuality: jest.fn() }));
jest.mock('@/hooks/useAlerts', () => ({ useAlerts: jest.fn() }));

import { useWeather } from '@/hooks/useWeather';
import { useAirQuality } from '@/hooks/useAirQuality';
import { useAlerts } from '@/hooks/useAlerts';

beforeEach(() => {
  (useAlerts as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null });
});

describe('RunningPage', () => {
  it('renders status, clothing and hourly strip on success', () => {
    (useWeather as jest.Mock).mockReturnValue({ data: weather, isLoading: false, error: null });
    (useAirQuality as jest.Mock).mockReturnValue({ data: aq, isLoading: false, error: null });

    render(<RunningPage />);
    expect(screen.getByLabelText('Running conditions')).toBeInTheDocument();
    expect(screen.getByText('What to wear')).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly running outlook')).toBeInTheDocument();
    expect(screen.getByText(/AQI 32/)).toBeInTheDocument();
  });

  it('flips the verdict to NOT NOW when a severe government alert is active', () => {
    (useWeather as jest.Mock).mockReturnValue({ data: weather, isLoading: false, error: null });
    (useAirQuality as jest.Mock).mockReturnValue({ data: aq, isLoading: false, error: null });
    (useAlerts as jest.Mock).mockReturnValue({
      data: [
        {
          headline: 'Severe thunderstorm warning in effect',
          severity: 'Severe',
          event: 'Severe Thunderstorm',
          description: 'Damaging winds and hail.',
          effective: '2026-08-31T00:00:00.000Z',
          expires: '2026-08-31T23:59:00.000Z',
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<RunningPage />);
    expect(screen.getByText('NOT NOW')).toBeInTheDocument();
    expect(screen.getByText(/Severe thunderstorm warning in effect/)).toBeInTheDocument();
  });

  it('degrades gracefully when AQI fails but weather works', () => {
    (useWeather as jest.Mock).mockReturnValue({ data: weather, isLoading: false, error: null });
    (useAirQuality as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('down'),
    });

    render(<RunningPage />);
    expect(screen.getByText('What to wear')).toBeInTheDocument();
    expect(screen.getByText(/Air quality unavailable/i)).toBeInTheDocument();
  });

  it('shows the page error state when weather fails', () => {
    (useWeather as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('down'),
    });
    (useAirQuality as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<RunningPage />);
    expect(screen.getByText(/Unable to load weather data/i)).toBeInTheDocument();
  });
});

afterAll(() => {
  // Restore Luxon's real clock so other test files are not affected.
  Settings.now = () => Date.now();
});
