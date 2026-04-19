import type { SeasonalNotice } from '@/lib/types';

const HURRICANE_LOCATIONS = [
  'atlantic',
  'miami',
  'houston',
  'new orleans',
  'tampa',
  'nassau',
  'havana',
  'kingston',
  'san juan',
  'santo domingo',
  'cancun',
  'gulf',
  'caribbean',
];

export function getSeasonalNotices(
  locationName: string,
  weather: { temperature: number; uvIndex: number },
  date: Date,
): SeasonalNotice[] {
  const notices: SeasonalNotice[] = [];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const nameLower = locationName.toLowerCase();

  // Cherry blossom: Toronto, April 15 - May 10
  if (nameLower.includes('toronto')) {
    const inRange = (month === 4 && day >= 15) || (month === 5 && day <= 10);
    if (inRange) {
      notices.push({
        id: 'cherry-blossom',
        message: 'Cherry blossom season in Toronto! Check High Park for peak blooms.',
        type: 'seasonal',
        icon: '🌸',
      });
    }
  }

  // Hurricane season: Atlantic/Caribbean/Gulf cities, June 1 - November 30
  if (HURRICANE_LOCATIONS.some((loc) => nameLower.includes(loc))) {
    if (month >= 6 && month <= 11) {
      notices.push({
        id: 'hurricane-season',
        message: 'Hurricane season is active. Stay informed about tropical weather developments.',
        type: 'info',
        icon: '🌀',
      });
    }
  }

  // Frost tip: any location, temperature <= 0
  if (weather.temperature <= 0) {
    notices.push({
      id: 'frost-tip',
      message: 'Frost conditions — protect sensitive plants and watch for icy surfaces.',
      type: 'tip',
      icon: '❄️',
    });
  }

  // UV warning: any location, UV index > 8
  if (weather.uvIndex > 8) {
    notices.push({
      id: 'uv-warning',
      message: 'Very high UV index — wear sunscreen, a hat, and seek shade during midday.',
      type: 'info',
      icon: '☀️',
    });
  }

  // Heat advisory: any location, temperature > 35
  if (weather.temperature > 35) {
    notices.push({
      id: 'heat-advisory',
      message:
        'Extreme heat — stay hydrated, avoid prolonged outdoor activity, and check on others.',
      type: 'info',
      icon: '🔥',
    });
  }

  return notices;
}
