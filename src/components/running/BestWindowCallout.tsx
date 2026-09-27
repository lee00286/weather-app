import type { BestWindow } from '@/lib/running/bestWindow';
import { formatHourlyTime } from '@/lib/timezone';

interface BestWindowCalloutProps {
  window: BestWindow;
  timezone: string;
}

export function BestWindowCallout({ window, timezone }: BestWindowCalloutProps) {
  const start = formatHourlyTime(window.startTime, timezone);
  const end = formatHourlyTime(window.endTime, timezone);
  const range = start === end ? start : `${start}–${end}`;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-900 dark:bg-blue-950/40">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg dark:bg-blue-900/60"
      >
        ⏱
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Best time to run today: {range}
        </p>
        <p className="mt-1 text-sm text-blue-700/90 dark:text-blue-300/90">{window.note}</p>
      </div>
    </div>
  );
}
