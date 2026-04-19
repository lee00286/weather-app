import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { AlertBanner } from '@/components/weather/AlertBanner';
import type { WeatherAlert } from '@/lib/types';

const makeAlert = (overrides: Partial<WeatherAlert> = {}): WeatherAlert => ({
  headline: 'Test Alert',
  severity: 'Moderate',
  event: 'Test Event',
  description: 'Detailed description of the alert.',
  effective: '2025-07-01T12:00:00Z',
  expires: '2025-07-01T18:00:00Z',
  ...overrides,
});

describe('AlertBanner', () => {
  it('renders nothing when no alerts', () => {
    const { container } = render(<AlertBanner alerts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders alert with headline', () => {
    render(<AlertBanner alerts={[makeAlert({ headline: 'Winter Storm Warning' })]} />);
    expect(screen.getByText('Winter Storm Warning')).toBeInTheDocument();
  });

  it('applies correct color for Extreme severity', () => {
    render(<AlertBanner alerts={[makeAlert({ severity: 'Extreme' })]} />);
    const banner = screen.getByText('Test Alert').closest('div[class*="bg-alert"]');
    expect(banner).toHaveClass('bg-alert-extreme', 'text-alert-extreme-text');
  });

  it('applies correct color for Severe severity', () => {
    render(<AlertBanner alerts={[makeAlert({ headline: 'Severe alert', severity: 'Severe' })]} />);
    const banner = screen.getByText('Severe alert').closest('div[class*="bg-alert"]');
    expect(banner).toHaveClass('bg-alert-severe', 'text-alert-severe-text');
  });

  it('applies correct color for Moderate severity', () => {
    render(
      <AlertBanner alerts={[makeAlert({ headline: 'Moderate alert', severity: 'Moderate' })]} />,
    );
    const banner = screen.getByText('Moderate alert').closest('div[class*="bg-alert"]');
    expect(banner).toHaveClass('bg-alert-moderate', 'text-alert-moderate-text');
  });

  it('applies correct color for Minor severity', () => {
    render(<AlertBanner alerts={[makeAlert({ headline: 'Minor alert', severity: 'Minor' })]} />);
    const banner = screen.getByText('Minor alert').closest('div[class*="bg-alert"]');
    expect(banner).toHaveClass('bg-alert-minor', 'text-alert-minor-text');
  });

  it('shows description when clicked (expandable)', async () => {
    const user = userEvent.setup();
    render(
      <AlertBanner
        alerts={[makeAlert({ headline: 'Expand me', description: 'Hidden details here.' })]}
      />,
    );

    expect(screen.queryByText('Hidden details here.')).not.toBeInTheDocument();

    await user.click(screen.getByText('Expand me'));

    expect(screen.getByText('Hidden details here.')).toBeInTheDocument();
  });

  it('hides alert when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    render(<AlertBanner alerts={[makeAlert({ headline: 'Dismiss me' })]} />);

    expect(screen.getByText('Dismiss me')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Dismiss alert: Dismiss me'));

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });
});
