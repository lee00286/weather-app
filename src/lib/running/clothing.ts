import type { RunConditions } from '@/lib/running/types';

export interface Outfit {
  torso: string;
  legs: string;
}

export interface ClothingRecommendation {
  tierLabel: string;
  options: Outfit[];
  accessories: string[];
  modifiers: string[];
}

const LONG_PANTS = 'long pants (tights, joggers, or track pants)';

interface Tier {
  min: number;
  label: string;
  options: Outfit[];
  accessories: string[];
}

// Ordered high → low; first tier whose `min` is <= feelsLike wins.
const TIERS: Tier[] = [
  {
    min: 24,
    label: 'Hot',
    options: [{ torso: 'singlet', legs: 'shorts' }],
    accessories: ['cap', 'sunglasses', 'hydrate'],
  },
  { min: 18, label: 'Warm', options: [{ torso: 'tee', legs: 'shorts' }], accessories: [] },
  {
    min: 12,
    label: 'Mild',
    options: [
      { torso: 'tee', legs: 'shorts' },
      { torso: 'long-sleeve', legs: 'shorts' },
      { torso: 'tee', legs: 'capris' },
    ],
    accessories: [],
  },
  {
    min: 7,
    label: 'Cool',
    options: [
      { torso: 'long-sleeve', legs: 'shorts' },
      { torso: 'tee', legs: LONG_PANTS },
      { torso: 'long-sleeve', legs: 'capris' },
    ],
    accessories: ['light gloves (optional)'],
  },
  {
    min: 2,
    label: 'Cold',
    options: [
      { torso: 'long-sleeve', legs: LONG_PANTS },
      { torso: 'tee + light jacket', legs: LONG_PANTS },
    ],
    accessories: ['gloves', 'headband'],
  },
  {
    min: -4,
    label: 'Very cold',
    options: [{ torso: 'thermal + jacket', legs: LONG_PANTS }],
    accessories: ['gloves', 'hat', 'buff'],
  },
  {
    min: -Infinity,
    label: 'Freezing',
    options: [{ torso: 'layered thermal + windproof', legs: LONG_PANTS }],
    accessories: ['heavy gloves', 'hat', 'face cover'],
  },
];

function isPrecipitating(c: RunConditions): boolean {
  // WMO codes >= 51 are drizzle/rain/snow/showers/thunderstorm; fog (45,48) is below.
  return c.precipitation > 0.2 || c.weatherCode >= 51;
}

export function getClothing(c: RunConditions): ClothingRecommendation {
  const tier = TIERS.find((t) => c.feelsLike >= t.min)!;

  const modifiers: string[] = [];
  if (isPrecipitating(c)) modifiers.push('water-resistant shell + cap brim');
  if (c.uvIndex >= 6 && c.isDay) modifiers.push('sunglasses + sunscreen');
  if (c.windSpeed >= 30) modifiers.push('windproof layer');

  return { tierLabel: tier.label, options: tier.options, accessories: tier.accessories, modifiers };
}
