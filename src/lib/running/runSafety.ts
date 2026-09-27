import type { RunConditions } from '@/lib/running/types';

export interface SafetyReason {
  rule: 'aqi' | 'heat' | 'cold' | 'uv' | 'storm' | 'humidity' | 'alert';
  message: string;
  level: 'caution' | 'no-go';
}

export interface RunSafety {
  rating: 'go' | 'caution' | 'no-go';
  reasons: SafetyReason[];
  headline: string;
}

const r = (n: number) => Math.round(n);

export function getRunSafety(c: RunConditions): RunSafety {
  const reasons: SafetyReason[] = [];

  if (c.usAqi !== null) {
    if (c.usAqi >= 151) {
      reasons.push({
        rule: 'aqi',
        level: 'no-go',
        message: `Unhealthy air (US AQI ${r(c.usAqi)}) — move the run indoors`,
      });
    } else if (c.usAqi >= 51) {
      reasons.push({
        rule: 'aqi',
        level: 'caution',
        message: `Moderate air (US AQI ${r(c.usAqi)}) — ease off if you're sensitive`,
      });
    }
  }

  if (c.feelsLike >= 38)
    reasons.push({
      rule: 'heat',
      level: 'no-go',
      message: `Extreme heat (feels like ${r(c.feelsLike)}°) — high heat-illness risk`,
    });
  else if (c.feelsLike >= 32)
    reasons.push({
      rule: 'heat',
      level: 'caution',
      message: `Hot (feels like ${r(c.feelsLike)}°) — slow down and hydrate`,
    });

  if (c.feelsLike <= -25)
    reasons.push({
      rule: 'cold',
      level: 'no-go',
      message: `Extreme cold (feels like ${r(c.feelsLike)}°) — frostbite risk`,
    });
  else if (c.feelsLike <= -15)
    reasons.push({
      rule: 'cold',
      level: 'caution',
      message: `Very cold (feels like ${r(c.feelsLike)}°) — cover exposed skin`,
    });

  if (c.uvIndex >= 8)
    reasons.push({
      rule: 'uv',
      level: 'caution',
      message: `Very high UV (${r(c.uvIndex)}) — sunscreen, hat, prefer shade`,
    });

  if (c.weatherCode >= 96)
    reasons.push({
      rule: 'storm',
      level: 'no-go',
      message: 'Thunderstorm with hail — do not run outside',
    });
  else if (c.weatherCode === 95)
    reasons.push({
      rule: 'storm',
      level: 'caution',
      message: 'Thunderstorms nearby — lightning risk',
    });

  if (c.humidity >= 85) {
    reasons.push({
      rule: 'humidity',
      level: 'caution',
      message: `Very humid (${r(c.humidity)}%) — sweat won't evaporate; slow your pace and hydrate`,
    });
  } else if (c.humidity >= 70 && c.feelsLike >= 24) {
    reasons.push({
      rule: 'humidity',
      level: 'caution',
      message: `Humid and warm (${r(c.humidity)}%) — it'll feel harder; ease your pace`,
    });
  }

  // Government weather alerts active now: Extreme/Severe block the run, others caution.
  for (const alert of c.activeAlerts ?? []) {
    const level: SafetyReason['level'] =
      alert.severity === 'Extreme' || alert.severity === 'Severe' ? 'no-go' : 'caution';
    reasons.push({
      rule: 'alert',
      level,
      message: `${alert.headline} — ${level === 'no-go' ? 'do not run outside' : 'stay alert'}`,
    });
  }

  const rating: RunSafety['rating'] = reasons.some((x) => x.level === 'no-go')
    ? 'no-go'
    : reasons.length > 0
      ? 'caution'
      : 'go';

  return { rating, reasons, headline: buildHeadline(rating, reasons, c) };
}

function buildHeadline(
  rating: RunSafety['rating'],
  reasons: SafetyReason[],
  c: RunConditions,
): string {
  if (rating === 'go') {
    if (c.feelsLike >= 24) return 'Warm but clear — hydrate and go';
    if (c.feelsLike >= 7) return 'Great conditions for a run';
    return 'Cold but clear — bundle up and go';
  }
  const dominant = reasons.find((x) => x.level === 'no-go') ?? reasons[0];
  return dominant.message;
}
