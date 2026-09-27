export interface Country {
  code: string;
  label: string;
}

// ISO alpha-2 codes drive the Nominatim countrycodes param.
export const SUPPORTED_COUNTRIES: readonly Country[] = [
  { code: 'de', label: 'Germany' },
  { code: 'fr', label: 'France' },
  { code: 'ch', label: 'Switzerland' },
  { code: 'at', label: 'Austria' },
  { code: 'cz', label: 'Czech Republic' },
];

export function isSupportedCountry(code: string): boolean {
  const normalized = code.toLowerCase();
  return SUPPORTED_COUNTRIES.some((country) => country.code === normalized);
}
