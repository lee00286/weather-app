import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { WeatherDetails } from '@/components/weather/WeatherDetails';
import type { CurrentWeather } from '@/lib/types';

const mockData: CurrentWeather = {
  temperature: 18,
  feelsLike: 15,
  weatherCode: 2,
  humidity: 65,
  windSpeed: 12.4,
  windDirection: 225,
  precipitation: 2.5,
  pressure: 1013,
  uvIndex: 8.3,
  highTemp: 22,
  lowTemp: 12,
  isDay: true,
};

describe('WeatherDetails', () => {
  it('renders wind speed and direction', () => {
    render(<WeatherDetails data={mockData} />);
    expect(screen.getByText('12 km/h')).toBeInTheDocument();
    expect(screen.getByText('SW')).toBeInTheDocument();
  });

  it('renders humidity percentage', () => {
    render(<WeatherDetails data={mockData} />);
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('renders UV index with label', () => {
    render(<WeatherDetails data={mockData} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Very High')).toBeInTheDocument();
  });

  it('renders precipitation', () => {
    render(<WeatherDetails data={mockData} />);
    expect(screen.getByText('2.5 mm')).toBeInTheDocument();
  });

  it('renders all four detail cards', () => {
    render(<WeatherDetails data={mockData} />);
    expect(screen.getByText('Wind')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('UV Index')).toBeInTheDocument();
    expect(screen.getByText('Precipitation')).toBeInTheDocument();
  });
});
