import { render, screen } from '@testing-library/react';

import { RunStatus } from '@/components/running/RunStatus';
import type { RunSafety } from '@/lib/running/runSafety';

const go: RunSafety = { rating: 'go', reasons: [], headline: 'Great conditions for a run' };
const noGo: RunSafety = {
  rating: 'no-go',
  reasons: [{ rule: 'aqi', level: 'no-go', message: 'Unhealthy air' }],
  headline: 'Unhealthy air',
};
const caution: RunSafety = {
  rating: 'caution',
  reasons: [{ rule: 'heat', level: 'caution', message: 'Hot — slow down and hydrate' }],
  headline: 'Hot — slow down and hydrate',
};

describe('RunStatus', () => {
  it('shows a GO label, headline, feels-like and AQI category', () => {
    render(<RunStatus safety={go} feelsLike={14} usAqi={32} />);
    expect(screen.getByText('GO to run')).toBeInTheDocument();
    expect(screen.getByText('Great conditions for a run')).toBeInTheDocument();
    expect(screen.getByText(/14°/)).toBeInTheDocument();
    expect(screen.getByText(/Good/)).toBeInTheDocument();
  });

  it('shows NOT NOW for no-go and notes when AQI is unavailable', () => {
    render(<RunStatus safety={noGo} feelsLike={30} usAqi={null} />);
    expect(screen.getByText('NOT NOW')).toBeInTheDocument();
    expect(screen.getByText(/Air quality unavailable/i)).toBeInTheDocument();
  });

  it('shows CAUTION for the caution rating', () => {
    render(<RunStatus safety={caution} feelsLike={32} usAqi={60} />);
    expect(screen.getByText('CAUTION')).toBeInTheDocument();
  });
});
