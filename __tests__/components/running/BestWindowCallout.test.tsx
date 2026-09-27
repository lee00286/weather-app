import { render, screen } from '@testing-library/react';

import { BestWindowCallout } from '@/components/running/BestWindowCallout';
import type { BestWindow } from '@/lib/running/bestWindow';

const win: BestWindow = {
  startTime: '2026-08-31T06:00',
  endTime: '2026-08-31T08:00',
  feelsLike: 12,
  usAqi: 30,
  note: '12°, low UV, air good',
};

const singleTimeWin: BestWindow = {
  startTime: '2026-08-31T06:00',
  endTime: '2026-08-31T06:00',
  feelsLike: 12,
  usAqi: 30,
  note: 'low UV, air good',
};

describe('BestWindowCallout', () => {
  it('shows the best time range and the note', () => {
    render(<BestWindowCallout window={win} timezone="America/Toronto" />);
    expect(screen.getByText(/Best time to run today/i)).toBeInTheDocument();
    expect(screen.getByText(/12°, low UV, air good/)).toBeInTheDocument();
  });

  it('renders a single formatted time with no en-dash when start equals end', () => {
    render(<BestWindowCallout window={singleTimeWin} timezone="America/Toronto" />);
    // formatHourlyTime('...T06:00', 'America/Toronto') => '6 AM'
    expect(screen.getByText(/Best time to run today: 6 AM$/)).toBeInTheDocument();
    // No en-dash range separator anywhere in the callout.
    expect(screen.queryByText(/–/)).toBeNull();
  });
});
