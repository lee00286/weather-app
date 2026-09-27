'use client';

import { useCallback, useState } from 'react';

import { useNavigateToLocation } from '@/hooks/useNavigateToLocation';
import { SUPPORTED_COUNTRIES } from '@/lib/countries';
import type { LocationSearchResult } from '@/lib/types';

type Status = 'idle' | 'loading' | 'not-found' | 'error';

const fieldBase =
  'rounded-xl border border-gray-300 bg-white py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder-gray-500 dark:focus-visible:ring-blue-400';

export function PostalCodeSearch() {
  const navigate = useNavigateToLocation();
  const [country, setCountry] = useState(SUPPORTED_COUNTRIES[0].code);
  const [postal, setPostal] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const lookup = useCallback(async () => {
    const trimmed = postal.trim();
    if (trimmed.length === 0) {
      return;
    }

    setStatus('loading');

    try {
      const params = new URLSearchParams({ country, postal: trimmed });
      const response = await fetch(`/api/geocode?${params.toString()}`);

      if (response.status === 404) {
        setStatus('not-found');
        return;
      }

      if (!response.ok) {
        setStatus('error');
        return;
      }

      const result: LocationSearchResult = await response.json();
      navigate(result);
    } catch {
      setStatus('error');
    }
  }, [country, postal, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookup();
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    setStatus('idle');
  };

  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostal(e.target.value);
    setStatus('idle');
  };

  return (
    <div className="w-full max-w-lg">
      <div className="flex flex-col gap-2">
        <div className="relative w-full">
          <label htmlFor="postal-country" className="sr-only">
            Country
          </label>
          <select
            id="postal-country"
            value={country}
            onChange={handleCountryChange}
            className={`${fieldBase} appearance-none pl-4 pr-10 w-full`}
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex gap-2">
          <label htmlFor="postal-code" className="sr-only">
            Postal code
          </label>
          <input
            id="postal-code"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Postal code"
            maxLength={12}
            value={postal}
            onChange={handlePostalChange}
            onKeyDown={handleKeyDown}
            className={`flex-1 ${fieldBase} px-4`}
          />

          <button
            type="button"
            onClick={lookup}
            disabled={status === 'loading'}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
          >
            Go
          </button>
        </div>
      </div>

      {status !== 'idle' && (
        <p role="status" className="mt-2 px-1 text-sm text-gray-500 dark:text-gray-400">
          {status === 'loading' && 'Searching...'}
          {status === 'not-found' && 'No location found for that postal code.'}
          {status === 'error' && 'Something went wrong. Please try again.'}
        </p>
      )}
    </div>
  );
}
