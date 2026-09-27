import { render, screen } from '@testing-library/react';

import { RunHourlyStrip } from '@/components/running/RunHourlyStrip';
import type { RunConditions } from '@/lib/running/types';

function cond(feelsLike: number, over: Partial<RunConditions> = {}): RunConditions {
  return {
    feelsLike,
    temperature: feelsLike,
    humidity: 50,
    windSpeed: 5,
    uvIndex: 2,
    precipitation: 0,
    weatherCode: 0,
    usAqi: 20,
    isDay: true,
    ...over,
  };
}

const hours = [
  { time: '2026-08-31T09:00', conditions: cond(14) },
  { time: '2026-08-31T10:00', conditions: cond(40) }, // hot → caution/no-go
];

describe('RunHourlyStrip', () => {
  it('renders one entry per hour with a labeled rating dot', () => {
    render(<RunHourlyStrip hours={hours} timezone="America/Toronto" />);
    expect(screen.getByText(/14°/)).toBeInTheDocument();
    // dots expose their rating as accessible text (title/sr-only), not color alone
    expect(screen.getAllByTitle(/go|caution|not now/i).length).toBe(2);
  });
});
