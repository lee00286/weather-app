export interface Location {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  slug: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  pressure: number;
  uvIndex: number;
  highTemp: number;
  lowTemp: number;
  isDay: boolean;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  humidity: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  highTemp: number;
  lowTemp: number;
  feelsLikeHigh: number;
  feelsLikeLow: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezone: string;
  locationName: string;
}

export interface WeatherAlert {
  headline: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor';
  event: string;
  description: string;
  effective: string;
  expires: string;
}

export interface LocationSearchResult {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

export interface SeasonalNotice {
  id: string;
  message: string;
  type: 'info' | 'tip' | 'seasonal';
  icon?: string;
}

export interface ApiErrorResponse {
  error: string;
  status: number;
}
