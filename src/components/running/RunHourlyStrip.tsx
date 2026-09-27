import type { HourPoint } from '@/lib/running/bestWindow';
import { getRunSafety, type RunSafety } from '@/lib/running/runSafety';
import { formatHourlyTime } from '@/lib/timezone';

const DOT: Record<RunSafety['rating'], { className: string; title: string }> = {
  go: { className: 'bg-green-600 dark:bg-green-500', title: 'Go' },
  caution: { className: 'bg-amber-600 dark:bg-amber-400', title: 'Caution' },
  'no-go': { className: 'bg-red-500', title: 'Not now' },
};

interface RunHourlyStripProps {
  hours: HourPoint[];
  timezone: string;
}

export function RunHourlyStrip({ hours, timezone }: RunHourlyStripProps) {
  return (
    <section aria-label="Hourly running outlook">
      <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-50">Next hours</h2>
      <div className="relative">
        <ul className="flex gap-2 overflow-x-auto pb-1 [scroll-snap-type:x_mandatory] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {hours.map((h) => {
            const dot = DOT[getRunSafety(h.conditions).rating];
            return (
              <li
                key={h.time}
                className="flex min-w-[3.75rem] flex-col items-center gap-2 rounded-xl bg-gray-50 px-2 py-3 dark:bg-gray-800/50 [scroll-snap-align:start]"
              >
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {formatHourlyTime(h.time, timezone)}
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${dot.className}`}
                  title={dot.title}
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {Math.round(h.conditions.feelsLike)}°
                </span>
              </li>
            );
          })}
        </ul>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/90 to-transparent dark:from-gray-900/90"
        />
      </div>
    </section>
  );
}
