import { getAqiCategory } from '@/lib/running/aqi';
import type { RunSafety } from '@/lib/running/runSafety';

const PRESENTATION: Record<
  RunSafety['rating'],
  { label: string; icon: string; className: string; badgeClassName: string }
> = {
  go: {
    label: 'GO to run',
    icon: '✓',
    className:
      'bg-gradient-to-br from-green-700 to-emerald-700 text-white dark:from-green-700 dark:to-emerald-800',
    badgeClassName: 'bg-white/25 text-white dark:bg-white/30',
  },
  caution: {
    label: 'CAUTION',
    icon: '!',
    className:
      'bg-gradient-to-br from-amber-300 to-amber-400 text-amber-950 dark:from-amber-400 dark:to-amber-500 dark:text-amber-950',
    badgeClassName: 'bg-amber-950/15 text-amber-950',
  },
  'no-go': {
    label: 'NOT NOW',
    icon: '✕',
    className:
      'bg-gradient-to-br from-red-700 to-rose-700 text-white dark:from-red-700 dark:to-rose-800',
    badgeClassName: 'bg-white/25 text-white dark:bg-white/30',
  },
};

interface RunStatusProps {
  safety: RunSafety;
  feelsLike: number;
  usAqi: number | null;
}

export function RunStatus({ safety, feelsLike, usAqi }: RunStatusProps) {
  const p = PRESENTATION[safety.rating];
  const aqi = usAqi !== null ? getAqiCategory(usAqi) : null;
  // The headline already surfaces the dominant reason; don't repeat it in the list.
  const details = safety.reasons.filter((reason) => reason.message !== safety.headline);

  return (
    <section
      role="status"
      aria-label="Running conditions"
      className={`relative overflow-hidden rounded-2xl p-5 shadow-lg sm:p-6 ${p.className}`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${p.badgeClassName}`}
        >
          {p.icon}
        </span>
        <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">{p.label}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${p.badgeClassName}`}>
          Feels like {Math.round(feelsLike)}°
        </span>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${p.badgeClassName}`}>
          {aqi ? `AQI ${Math.round(usAqi!)} ${aqi.label}` : 'Air quality unavailable'}
        </span>
      </div>

      <p className="mt-4 text-base font-medium leading-snug">{safety.headline}</p>

      {details.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm opacity-95">
          {details.map((reason, i) => (
            <li key={`${reason.rule}-${i}`} className="flex gap-2">
              <span aria-hidden="true" className="mt-0.5 shrink-0 opacity-70">
                •
              </span>
              <span>{reason.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
