export interface AqiCategory {
  label: string;
  level: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
}

const BANDS: { min: number; category: AqiCategory }[] = [
  { min: 301, category: { label: 'Hazardous', level: 'hazardous' } },
  { min: 201, category: { label: 'Very Unhealthy', level: 'very-unhealthy' } },
  { min: 151, category: { label: 'Unhealthy', level: 'unhealthy' } },
  { min: 101, category: { label: 'Unhealthy for Sensitive Groups', level: 'unhealthy-sensitive' } },
  { min: 51, category: { label: 'Moderate', level: 'moderate' } },
  { min: 0, category: { label: 'Good', level: 'good' } },
];

export function getAqiCategory(usAqi: number): AqiCategory {
  return BANDS.find((b) => usAqi >= b.min)!.category;
}
