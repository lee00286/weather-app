import { getRunSafety } from '@/lib/running/runSafety';
import type { RunConditions } from '@/lib/running/types';

function base(overrides: Partial<RunConditions> = {}): RunConditions {
  return {
    feelsLike: 12,
    temperature: 12,
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

describe('getRunSafety', () => {
  it('clean conditions → go with no reasons', () => {
    const s = getRunSafety(base());
    expect(s.rating).toBe('go');
    expect(s.reasons).toHaveLength(0);
    expect(s.headline).toBeTruthy();
  });

  it('AQI 51–150 → caution, >=151 → no-go, null → skipped', () => {
    expect(getRunSafety(base({ usAqi: 51 })).rating).toBe('caution');
    expect(getRunSafety(base({ usAqi: 150 })).rating).toBe('caution');
    expect(getRunSafety(base({ usAqi: 151 })).rating).toBe('no-go');
    const skipped = getRunSafety(base({ usAqi: null }));
    expect(skipped.reasons.some((r) => r.rule === 'aqi')).toBe(false);
    expect(skipped.rating).toBe('go');
  });

  it('heat thresholds on feels-like', () => {
    expect(getRunSafety(base({ feelsLike: 32 })).rating).toBe('caution');
    expect(getRunSafety(base({ feelsLike: 38 })).rating).toBe('no-go');
  });

  it('cold thresholds on feels-like', () => {
    expect(getRunSafety(base({ feelsLike: -15 })).rating).toBe('caution');
    expect(getRunSafety(base({ feelsLike: -25 })).rating).toBe('no-go');
  });

  it('very high UV → caution', () => {
    expect(getRunSafety(base({ uvIndex: 8 })).rating).toBe('caution');
  });

  it('thunderstorm 95 → caution, hail 96/99 → no-go', () => {
    expect(getRunSafety(base({ weatherCode: 95 })).rating).toBe('caution');
    expect(getRunSafety(base({ weatherCode: 96 })).rating).toBe('no-go');
    expect(getRunSafety(base({ weatherCode: 99 })).rating).toBe('no-go');
  });

  it('humidity >= 85 alone → caution', () => {
    const s = getRunSafety(base({ humidity: 85, feelsLike: 10 }));
    expect(s.rating).toBe('caution');
    expect(s.reasons.some((r) => r.rule === 'humidity')).toBe(true);
  });

  it('humidity >= 70 with feels-like >= 24 → caution (compounding heat)', () => {
    expect(getRunSafety(base({ humidity: 70, feelsLike: 24 })).rating).toBe('caution');
    // 70% but cool → no humidity reason
    expect(
      getRunSafety(base({ humidity: 70, feelsLike: 20 })).reasons.some((r) => r.rule === 'humidity'),
    ).toBe(false);
  });

  it('rating is the worst level across rules', () => {
    const s = getRunSafety(base({ usAqi: 60, feelsLike: 39 })); // caution + no-go
    expect(s.rating).toBe('no-go');
    expect(s.reasons.length).toBeGreaterThanOrEqual(2);
  });

  const alert = (severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor', headline = 'Storm') => ({
    headline,
    severity,
    event: 'Event',
    description: 'desc',
    effective: '2026-08-31T00:00',
    expires: '2026-08-31T23:59',
  });

  it('an active Extreme or Severe alert forces no-go', () => {
    expect(getRunSafety(base({ activeAlerts: [alert('Extreme')] })).rating).toBe('no-go');
    expect(getRunSafety(base({ activeAlerts: [alert('Severe')] })).rating).toBe('no-go');
  });

  it('an active Moderate or Minor alert is a caution', () => {
    expect(getRunSafety(base({ activeAlerts: [alert('Moderate')] })).rating).toBe('caution');
    expect(getRunSafety(base({ activeAlerts: [alert('Minor')] })).rating).toBe('caution');
  });

  it('each active alert contributes its own reason (multiple supported)', () => {
    const s = getRunSafety(
      base({ activeAlerts: [alert('Severe', 'Thunderstorm'), alert('Moderate', 'Squall watch')] }),
    );
    const alertReasons = s.reasons.filter((r) => r.rule === 'alert');
    expect(alertReasons).toHaveLength(2);
    expect(s.reasons.some((r) => r.message.includes('Thunderstorm'))).toBe(true);
    expect(s.rating).toBe('no-go'); // worst-of: Severe wins
  });

  it('no active alerts leaves the verdict unchanged', () => {
    expect(getRunSafety(base({ activeAlerts: [] })).rating).toBe('go');
  });
});
