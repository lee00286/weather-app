import { describe, expect, it, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Must use global jest.mock for hoisting to work with next/jest SWC transform.
const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

import { WeatherTabNav } from '@/components/ui/WeatherTabNav';

describe('WeatherTabNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockUseSearchParams.mockReset();
    mockUseSearchParams.mockReturnValue(new URLSearchParams('lat=43.65&lon=-79.38'));
  });

  it('renders three tabs: Daily, Weekly, Monthly', () => {
    mockUsePathname.mockReturnValue('/weather/toronto');
    render(<WeatherTabNav slug="toronto" />);
    expect(screen.getByRole('link', { name: 'Daily' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Weekly' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Monthly' })).toBeInTheDocument();
  });

  it('marks Daily as active on the base route', () => {
    mockUsePathname.mockReturnValue('/weather/toronto');
    render(<WeatherTabNav slug="toronto" />);
    expect(screen.getByRole('link', { name: 'Daily' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Weekly' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Monthly' })).not.toHaveAttribute('aria-current');
  });

  it('marks Weekly as active on the /weekly route', () => {
    mockUsePathname.mockReturnValue('/weather/toronto/weekly');
    render(<WeatherTabNav slug="toronto" />);
    expect(screen.getByRole('link', { name: 'Weekly' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Daily' })).not.toHaveAttribute('aria-current');
  });

  it('marks Monthly as active on the /monthly route', () => {
    mockUsePathname.mockReturnValue('/weather/toronto/monthly');
    render(<WeatherTabNav slug="toronto" />);
    expect(screen.getByRole('link', { name: 'Monthly' })).toHaveAttribute('aria-current', 'page');
  });

  it('preserves lat/lon query params across tab links', () => {
    mockUsePathname.mockReturnValue('/weather/toronto');
    render(<WeatherTabNav slug="toronto" />);
    expect(screen.getByRole('link', { name: 'Daily' })).toHaveAttribute(
      'href',
      '/weather/toronto?lat=43.65&lon=-79.38',
    );
    expect(screen.getByRole('link', { name: 'Weekly' })).toHaveAttribute(
      'href',
      '/weather/toronto/weekly?lat=43.65&lon=-79.38',
    );
    expect(screen.getByRole('link', { name: 'Monthly' })).toHaveAttribute(
      'href',
      '/weather/toronto/monthly?lat=43.65&lon=-79.38',
    );
  });

  it('omits query string when there are no search params', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''));
    mockUsePathname.mockReturnValue('/weather/toronto');
    render(<WeatherTabNav slug="toronto" />);
    expect(screen.getByRole('link', { name: 'Weekly' })).toHaveAttribute(
      'href',
      '/weather/toronto/weekly',
    );
  });

  it('uses nav landmark labeled "Weather views"', () => {
    mockUsePathname.mockReturnValue('/weather/toronto');
    render(<WeatherTabNav slug="toronto" />);
    expect(screen.getByRole('navigation', { name: 'Weather views' })).toBeInTheDocument();
  });

  it('treats trailing slash as active', () => {
    mockUsePathname.mockReturnValue('/weather/toronto/weekly/');
    render(<WeatherTabNav slug="toronto" />);
    expect(screen.getByRole('link', { name: 'Weekly' })).toHaveAttribute('aria-current', 'page');
  });
});
