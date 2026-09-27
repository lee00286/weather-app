'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { generateSlug } from '@/lib/slug';
import type { LocationSearchResult } from '@/lib/types';

export function useNavigateToLocation() {
  const router = useRouter();

  return useCallback(
    (result: LocationSearchResult) => {
      const slug = generateSlug(result.name, result.region, result.country);
      const params = new URLSearchParams({
        lat: String(result.lat),
        lon: String(result.lon),
      });
      router.push(`/weather/${slug}?${params.toString()}`);
    },
    [router],
  );
}
