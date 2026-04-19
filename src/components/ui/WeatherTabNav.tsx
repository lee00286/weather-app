'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface WeatherTabNavProps {
  slug: string;
}

const TABS = [
  { key: 'daily', label: 'Daily', suffix: '' },
  { key: 'weekly', label: 'Weekly', suffix: '/weekly' },
  { key: 'monthly', label: 'Monthly', suffix: '/monthly' },
] as const;

function isActive(pathname: string, basePath: string, suffix: string): boolean {
  if (suffix === '') {
    return pathname === basePath || pathname === `${basePath}/`;
  }
  return pathname === `${basePath}${suffix}` || pathname === `${basePath}${suffix}/`;
}

export function WeatherTabNav({ slug }: WeatherTabNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = `/weather/${slug}`;
  const query = searchParams.toString();

  return (
    <div className="sticky top-[57px] z-10 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <nav aria-label="Weather views" className="mx-auto flex max-w-2xl gap-1 px-4">
        {TABS.map((tab) => {
          const href = query ? `${basePath}${tab.suffix}?${query}` : `${basePath}${tab.suffix}`;
          const active = isActive(pathname, basePath, tab.suffix);
          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`-mb-px inline-block border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-400 ${
                active
                  ? 'border-blue-600 text-gray-900 dark:border-blue-400 dark:text-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
