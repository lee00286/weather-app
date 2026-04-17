import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { CurrentWeather } from '@/components/weather/CurrentWeather';
import type { CurrentWeather as CurrentWeatherData } from '@/lib/types';

const mockData: CurrentWeatherData = {
  temperature: 18.3,
  feelsLike: 15.1,
  weatherCode: 2,
  humidity: 65,
  windSpeed: 12,
  windDirection: 180,
  precipitation: 0,
  pressure: 1013,
  uvIndex: 5,
  highTemp: 22.4,
  lowTemp: 11.8,
  isDay: true,
};

describe('CurrentWeather', () => {
  it('renders temperature rounded', () => {
    render(<CurrentWeather data={mockData} timezone="America/Toronto" />);
    expect(screen.getByText('18°')).toBeInTheDocument();
  });

  it('renders weather condition label', () => {
    render(<CurrentWeather data={mockData} timezone="America/Toronto" />);
    expect(screen.getByText('Partly cloudy')).toBeInTheDocument();
  });

  it('renders feels like temperature', () => {
    render(<CurrentWeather data={mockData} timezone="America/Toronto" />);
    expect(screen.getByText('Feels like 15°')).toBeInTheDocument();
  });

  it('renders high and low temperatures', () => {
    render(<CurrentWeather data={mockData} timezone="America/Toronto" />);
    expect(screen.getByText('H: 22° L: 12°')).toBeInTheDocument();
  });

  it('renders correct icon for clear sky', () => {
    const clearData = { ...mockData, weatherCode: 0 };
    render(<CurrentWeather data={clearData} timezone="America/Toronto" />);
    expect(screen.getByText('Clear sky')).toBeInTheDocument();
  });

  it('renders correct icon for rain', () => {
    const rainData = { ...mockData, weatherCode: 63 };
    render(<CurrentWeather data={rainData} timezone="America/Toronto" />);
    expect(screen.getByText('Moderate rain')).toBeInTheDocument();
  });
});
