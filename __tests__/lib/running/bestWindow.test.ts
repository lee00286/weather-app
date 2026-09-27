import { getBestWindow } from '@/lib/running/bestWindow';
import type { RunConditions } from '@/lib/running/types';

function cond(feelsLike: number, over: Partial<RunConditions> = {}): RunConditions {
  return {
    feelsLike,
    temperature: feelsLike,
    humidity: 50,
    windSpeed: 5,
    uvIndex: 2,
    precipitation: 0,
    weatherCode: 0,
    usAqi: 20,
    isDay: true,
    ...over,
  };
}
function hp(hour: number, feelsLike: number, over: Partial<RunConditions> = {}) {
  return {
    time: `2026-08-31T${String(hour).padStart(2, '0')}:00`,
    conditions: cond(feelsLike, over),
  };
}

describe('getBestWindow', () => {
  it('returns null when nothing is runnable (all no-go)', () => {
    const hours = [hp(12, 45), hp(13, 46)]; // extreme heat → no-go
    expect(getBestWindow(hours)).toBeNull();
  });

  it('picks the hour closest to the ideal running temp as the anchor', () => {
    const hours = [hp(6, 12), hp(12, 28), hp(18, 20)];
    const w = getBestWindow(hours)!;
    expect(w.startTime).toContain('T06:00');
  });

  it('extends the window across adjacent comfortable hours', () => {
    const hours = [hp(6, 11), hp(7, 12), hp(8, 13), hp(9, 25)];
    const w = getBestWindow(hours)!;
    expect(w.startTime).toContain('T06:00');
    expect(w.endTime).toContain('T08:00');
  });

  it('does not extend across a no-go hour', () => {
    const hours = [hp(6, 12), hp(7, 45), hp(8, 12)]; // middle hour extreme heat
    const w = getBestWindow(hours)!;
    expect(w.startTime).toBe(w.endTime); // isolated
  });

  it('carries representative conditions and a note', () => {
    const w = getBestWindow([hp(6, 12, { usAqi: 30 })])!;
    expect(w.feelsLike).toBe(12);
    expect(w.usAqi).toBe(30);
    expect(w.note).toMatch(/12°/);
  });
});
