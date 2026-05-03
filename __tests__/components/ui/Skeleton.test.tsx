import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  CurrentWeatherSkeleton,
  HourlyForecastSkeleton,
  Skeleton,
  WeatherDetailsSkeleton,
} from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders a pulsing block hidden from assistive tech', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    const block = container.firstElementChild!;
    expect(block).toHaveAttribute('aria-hidden', 'true');
    expect(block.className).toMatch(/animate-pulse/);
    expect(block.className).toMatch(/rounded\b/);
    expect(block.className).not.toMatch(/rounded-full/);
  });

  it('renders as a circle when circle prop is true', () => {
    const { container } = render(<Skeleton circle className="h-6 w-6" />);
    expect(container.firstElementChild!.className).toMatch(/rounded-full/);
  });
});

describe('CurrentWeatherSkeleton', () => {
  it('exposes status role with screen-reader text', () => {
    render(<CurrentWeatherSkeleton />);
    const region = screen.getByRole('status', { name: 'Loading current weather' });
    expect(region).toBeInTheDocument();
    expect(region.textContent).toContain('Loading current weather');
  });
});

describe('WeatherDetailsSkeleton', () => {
  it('renders four skeleton cards inside a status region', () => {
    const { container } = render(<WeatherDetailsSkeleton />);
    expect(screen.getByRole('status', { name: 'Loading weather details' })).toBeInTheDocument();
    // Four animated blocks.
    expect(container.querySelectorAll('.animate-pulse').length).toBe(4);
  });
});

describe('HourlyForecastSkeleton', () => {
  it('renders six hour-tile placeholders plus two chart-shaped blocks', () => {
    const { container } = render(<HourlyForecastSkeleton />);
    expect(screen.getByRole('status', { name: 'Loading hourly forecast' })).toBeInTheDocument();
    // 6 tiles × 3 blocks each = 18, plus 2 chart blocks = 20.
    expect(container.querySelectorAll('.animate-pulse').length).toBe(20);
  });
});
