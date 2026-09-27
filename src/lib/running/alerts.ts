import { DateTime } from 'luxon';

import type { WeatherAlert } from '@/lib/types';

// Alerts whose active window (effective ≤ t < expires) contains the reference time.
// Unparseable timestamps fail safe toward inclusion so a malformed alert still warns.
export function activeAlertsAt(
  alerts: WeatherAlert[],
  isoTime: string,
  timezone: string,
): WeatherAlert[] {
  const t = DateTime.fromISO(isoTime, { zone: timezone });
  return alerts.filter((a) => {
    const eff = DateTime.fromISO(a.effective, { zone: timezone });
    const exp = DateTime.fromISO(a.expires, { zone: timezone });
    return (!eff.isValid || t >= eff) && (!exp.isValid || t < exp);
  });
}
