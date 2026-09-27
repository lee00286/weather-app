import type { WeatherAlert } from '@/lib/types';

export interface RunConditions {
  feelsLike: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
  weatherCode: number;
  usAqi: number | null;
  isDay: boolean;
  // Government weather alerts active at this time (empty/omitted when none).
  activeAlerts?: WeatherAlert[];
}
