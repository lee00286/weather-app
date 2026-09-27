'use client';

import { useState } from 'react';

import type { WeatherAlert } from '@/lib/types';

const SEVERITY_STYLES: Record<WeatherAlert['severity'], string> = {
  Extreme: 'bg-alert-extreme text-alert-extreme-text',
  Severe: 'bg-alert-severe text-alert-severe-text',
  Moderate: 'bg-alert-moderate text-alert-moderate-text',
  Minor: 'bg-alert-minor text-alert-minor-text',
};

export function AlertBanner({ alerts }: { alerts: WeatherAlert[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // WeatherAPI can return multiple alerts sharing a headline, so identity is a
  // stable index-based id (from the original array) rather than the headline —
  // otherwise dismiss/expand would act on every same-headline alert at once.
  const withIds = (alerts ?? []).map((alert, i) => ({ alert, id: `${alert.headline}#${i}` }));
  const visible = withIds.filter(({ id }) => !dismissed.has(id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2" role="alert">
      {visible.map(({ alert, id }) => {
        const isExpanded = expanded.has(id);

        return (
          <div key={id} className={`rounded-2xl px-4 py-3 ${SEVERITY_STYLES[alert.severity]}`}>
            <div className="flex items-start justify-between gap-2">
              <button
                className="flex-1 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-400"
                onClick={() => {
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) {
                      next.delete(id);
                    } else {
                      next.add(id);
                    }
                    return next;
                  });
                }}
                aria-expanded={isExpanded}
              >
                {alert.headline}
              </button>
              <button
                onClick={() => {
                  setDismissed((prev) => new Set(prev).add(id));
                }}
                aria-label={`Dismiss alert: ${alert.headline}`}
                className="shrink-0 text-sm font-bold opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-400"
              >
                &times;
              </button>
            </div>
            {isExpanded && <p className="mt-2 text-sm opacity-90">{alert.description}</p>}
          </div>
        );
      })}
    </div>
  );
}
