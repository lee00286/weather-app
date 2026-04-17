export type WeatherCategory = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog';

export interface WeatherCodeInfo {
  label: string;
  icon: string;
  category: WeatherCategory;
}

const weatherCodeMap: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear sky', icon: 'sun', category: 'clear' },
  1: { label: 'Mainly clear', icon: 'cloud-sun', category: 'cloudy' },
  2: { label: 'Partly cloudy', icon: 'cloud-sun', category: 'cloudy' },
  3: { label: 'Overcast', icon: 'cloud-sun', category: 'cloudy' },
  45: { label: 'Fog', icon: 'fog', category: 'fog' },
  48: { label: 'Depositing rime fog', icon: 'fog', category: 'fog' },
  51: { label: 'Light drizzle', icon: 'light-rain', category: 'rain' },
  53: { label: 'Moderate drizzle', icon: 'light-rain', category: 'rain' },
  55: { label: 'Dense drizzle', icon: 'light-rain', category: 'rain' },
  61: { label: 'Slight rain', icon: 'rain', category: 'rain' },
  63: { label: 'Moderate rain', icon: 'rain', category: 'rain' },
  65: { label: 'Heavy rain', icon: 'rain', category: 'rain' },
  71: { label: 'Slight snow fall', icon: 'snow', category: 'snow' },
  73: { label: 'Moderate snow fall', icon: 'snow', category: 'snow' },
  75: { label: 'Heavy snow fall', icon: 'snow', category: 'snow' },
  80: { label: 'Slight rain showers', icon: 'rain', category: 'rain' },
  81: { label: 'Moderate rain showers', icon: 'rain', category: 'rain' },
  82: { label: 'Violent rain showers', icon: 'rain', category: 'rain' },
  85: { label: 'Slight snow showers', icon: 'snow', category: 'snow' },
  86: { label: 'Heavy snow showers', icon: 'snow', category: 'snow' },
  95: { label: 'Thunderstorm', icon: 'storm', category: 'storm' },
  96: { label: 'Thunderstorm with slight hail', icon: 'storm', category: 'storm' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'storm', category: 'storm' },
};

export function getWeatherInfo(code: number): WeatherCodeInfo {
  const info = weatherCodeMap[code];
  if (!info) {
    throw new Error(`Unknown WMO weather code: ${code}`);
  }
  return info;
}

export function getIconEmoji(icon: string): string {
  switch (icon) {
    case 'sun':
      return '\u2600\uFE0F';
    case 'cloud-sun':
      return '\u26C5';
    case 'fog':
      return '\uD83C\uDF2B\uFE0F';
    case 'light-rain':
      return '\uD83C\uDF26\uFE0F';
    case 'rain':
      return '\uD83C\uDF27\uFE0F';
    case 'snow':
      return '\u2744\uFE0F';
    case 'storm':
      return '\u26C8\uFE0F';
    default:
      return '\u2600\uFE0F';
  }
}
