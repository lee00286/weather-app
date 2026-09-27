import { getClothing } from '@/lib/running/clothing';
import type { RunConditions } from '@/lib/running/types';

function base(overrides: Partial<RunConditions> = {}): RunConditions {
  return {
    feelsLike: 15,
    temperature: 15,
    humidity: 50,
    windSpeed: 5,
    uvIndex: 2,
    precipitation: 0,
    weatherCode: 0,
    usAqi: 20,
    isDay: true,
    ...overrides,
  };
}

describe('getClothing tiers', () => {
  it('Hot (>=24) → singlet + shorts with cap/sunglasses/hydrate', () => {
    const rec = getClothing(base({ feelsLike: 26, uvIndex: 2 }));
    expect(rec.tierLabel).toBe('Hot');
    expect(rec.options).toEqual([{ torso: 'singlet', legs: 'shorts' }]);
    expect(rec.accessories).toEqual(['cap', 'sunglasses', 'hydrate']);
  });

  it('Warm (18–24) → tee + shorts', () => {
    const rec = getClothing(base({ feelsLike: 20 }));
    expect(rec.tierLabel).toBe('Warm');
    expect(rec.options).toEqual([{ torso: 'tee', legs: 'shorts' }]);
  });

  it('Mild (12–18) offers three options', () => {
    const rec = getClothing(base({ feelsLike: 12 }));
    expect(rec.tierLabel).toBe('Mild');
    expect(rec.options).toHaveLength(3);
    expect(rec.options).toContainEqual({ torso: 'long-sleeve', legs: 'shorts' });
  });

  it('Cool (7–12) includes the tee + long-pants tradeoff', () => {
    const rec = getClothing(base({ feelsLike: 8 }));
    expect(rec.tierLabel).toBe('Cool');
    const legs = rec.options.map((o) => o.legs);
    expect(legs.some((l) => l.startsWith('long pants'))).toBe(true);
    expect(rec.accessories).toContain('light gloves (optional)');
  });

  it('boundaries are inclusive at the lower bound (exactly 12 → Mild, 11.9 → Cool)', () => {
    expect(getClothing(base({ feelsLike: 12 })).tierLabel).toBe('Mild');
    expect(getClothing(base({ feelsLike: 11.9 })).tierLabel).toBe('Cool');
  });

  it('Freezing (< -4) → layered + long pants', () => {
    const rec = getClothing(base({ feelsLike: -10 }));
    expect(rec.tierLabel).toBe('Freezing');
    expect(rec.accessories).toContain('face cover');
  });
});

describe('getClothing modifiers', () => {
  it('adds a rain shell when precipitating', () => {
    expect(getClothing(base({ precipitation: 1 })).modifiers).toContain(
      'water-resistant shell + cap brim',
    );
    expect(getClothing(base({ weatherCode: 61 })).modifiers).toContain(
      'water-resistant shell + cap brim',
    );
  });

  it('adds sun protection for high UV during the day only', () => {
    expect(getClothing(base({ uvIndex: 7, isDay: true })).modifiers).toContain(
      'sunglasses + sunscreen',
    );
    expect(getClothing(base({ uvIndex: 7, isDay: false })).modifiers).not.toContain(
      'sunglasses + sunscreen',
    );
  });

  it('adds a windproof note in strong wind', () => {
    expect(getClothing(base({ windSpeed: 35 })).modifiers).toContain('windproof layer');
  });
});
