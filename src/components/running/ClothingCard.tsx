import { Card } from '@/components/ui/Card';
import type { ClothingRecommendation } from '@/lib/running/clothing';

interface ClothingCardProps {
  recommendation: ClothingRecommendation;
}

export function ClothingCard({ recommendation }: ClothingCardProps) {
  const { options, accessories, modifiers, tierLabel } = recommendation;
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">What to wear</h2>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {tierLabel}
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {options.map((outfit, i) => (
          <li
            key={i}
            className="flex flex-col gap-1 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-900 dark:bg-gray-800/60 dark:text-gray-50 sm:flex-row sm:items-center sm:gap-3"
          >
            {i > 0 && (
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 sm:hidden">
                or
              </span>
            )}
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="text-base">
                👕
              </span>
              <span className="font-medium">{outfit.torso}</span>
            </span>
            <span aria-hidden="true" className="hidden text-gray-400 dark:text-gray-500 sm:inline">
              ·
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="text-base">
                🩳
              </span>
              <span className="font-medium">{outfit.legs}</span>
            </span>
          </li>
        ))}
      </ul>

      {(accessories.length > 0 || modifiers.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {accessories.map((item) => (
            <span
              key={`a-${item}`}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
            >
              <span aria-hidden="true">🧤</span>
              {item}
            </span>
          ))}
          {modifiers.map((item) => (
            <span
              key={`m-${item}`}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
            >
              <span aria-hidden="true">⚠️</span>
              {item}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
