import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { HourlyCalendar } from '@/components/weather/HourlyCalendar';
import type { DailyForecast } from '@/lib/types';

function makeDaily(dates: string[]): DailyForecast[] {
  return dates.map((date) => ({
    date,
    weatherCode: 0,
    highTemp: 22,
    lowTemp: 12,
    feelsLikeHigh: 21,
    feelsLikeLow: 11,
    precipitationSum: 0,
    precipitationProbability: 0,
    windSpeedMax: 15,
    uvIndexMax: 5,
    sunrise: `${date}T06:00`,
    sunset: `${date}T20:00`,
  }));
}

describe('HourlyCalendar', () => {
  it('renders month label based on selected date', () => {
    const daily = makeDaily(['2024-06-15']);
    render(
      <HourlyCalendar
        dailyData={daily}
        selectedDate="2024-06-15"
        todayIso="2024-06-15"
        onSelectDate={() => {}}
      />,
    );
    expect(screen.getByText('June 2024')).toBeInTheDocument();
  });

  it('navigates between months', async () => {
    const daily = makeDaily(['2024-06-15']);
    render(
      <HourlyCalendar
        dailyData={daily}
        selectedDate="2024-06-15"
        todayIso="2024-06-15"
        onSelectDate={() => {}}
      />,
    );

    await userEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText('July 2024')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByText('June 2024')).toBeInTheDocument();
  });

  it('calls onSelectDate when a day is clicked', async () => {
    const daily = makeDaily(['2024-06-15']);
    const onSelect = jest.fn();
    render(
      <HourlyCalendar
        dailyData={daily}
        selectedDate="2024-06-15"
        todayIso="2024-06-15"
        onSelectDate={onSelect}
      />,
    );

    await userEvent.click(screen.getByText('20'));
    expect(onSelect).toHaveBeenCalledWith('2024-06-20');
  });
});
