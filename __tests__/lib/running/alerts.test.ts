import { activeAlertsAt } from '@/lib/running/alerts';
import type { WeatherAlert } from '@/lib/types';

function alert(overrides: Partial<WeatherAlert> = {}): WeatherAlert {
  return {
    headline: 'Test alert',
    severity: 'Severe',
    event: 'Test Event',
    description: 'desc',
    effective: '2026-08-31T10:00',
    expires: '2026-08-31T13:00',
    ...overrides,
  };
}

describe('activeAlertsAt', () => {
  it('includes an alert when the time is inside [effective, expires)', () => {
    expect(activeAlertsAt([alert()], '2026-08-31T11:00', 'UTC')).toHaveLength(1);
  });

  it('excludes an alert before it becomes effective', () => {
    expect(activeAlertsAt([alert()], '2026-08-31T09:00', 'UTC')).toHaveLength(0);
  });

  it('excludes an alert after it expires', () => {
    expect(activeAlertsAt([alert()], '2026-08-31T13:00', 'UTC')).toHaveLength(0);
  });

  it('treats effective as inclusive and expires as exclusive', () => {
    expect(activeAlertsAt([alert()], '2026-08-31T10:00', 'UTC')).toHaveLength(1); // == effective
    expect(activeAlertsAt([alert()], '2026-08-31T12:59', 'UTC')).toHaveLength(1); // < expires
  });

  it('fails safe (includes) when a timestamp is unparseable', () => {
    expect(activeAlertsAt([alert({ expires: 'not-a-date' })], '2026-08-31T23:00', 'UTC')).toHaveLength(1);
  });

  it('returns an empty array when there are no alerts', () => {
    expect(activeAlertsAt([], '2026-08-31T11:00', 'UTC')).toEqual([]);
  });
});
