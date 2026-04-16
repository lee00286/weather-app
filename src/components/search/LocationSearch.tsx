'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { useLocationSearch } from '@/hooks/useLocationSearch';
import { generateSlug } from '@/lib/slug';
import type { LocationSearchResult } from '@/lib/types';

export function LocationSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: results = [], isLoading, error } = useLocationSearch(searchQuery);

  const hasSearched = searchQuery.length >= 2;

  const triggerSearch = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length >= 2) {
      setSearchQuery(trimmed);
    }
  }, [inputValue]);

  const navigateToResult = useCallback(
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 200) {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch();
    }
  };

  const showNoResults = hasSearched && !isLoading && !error && results.length === 0;
  const showResults = hasSearched && results.length > 0;
  const showLoading = hasSearched && isLoading;
  const showError = hasSearched && !isLoading && !!error;

  return (
    <div className="w-full max-w-lg">
      <div className="flex gap-2">
        <label htmlFor="location-search" className="sr-only">
          Search for a location
        </label>
        <input
          id="location-search"
          type="text"
          placeholder="Search city or postal code"
          maxLength={200}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder-gray-500 dark:focus-visible:ring-blue-400"
        />
        <button
          type="button"
          onClick={triggerSearch}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
        >
          Search
        </button>
      </div>

      {hasSearched && (
        <ul
          aria-label="Search results"
          className="mt-3 w-full divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900"
        >
          {showLoading && (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" role="status">
              Searching...
            </li>
          )}

          {showError && (
            <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
              Something went wrong. Please try again.
            </li>
          )}

          {showNoResults && (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No results found</li>
          )}

          {showResults &&
            results.map((result) => (
              <li
                key={`${result.lat}-${result.lon}`}
                className="cursor-pointer px-4 py-3 text-sm text-gray-900 transition-colors hover:bg-gray-50 dark:text-gray-50 dark:hover:bg-gray-800"
                onClick={() => navigateToResult(result)}
              >
                {result.name && <span className="font-medium">{result.name}</span>}
                {result.region && (
                  <span className="text-gray-500 dark:text-gray-400">, {result.region}</span>
                )}
                {result.country && (
                  <span className="text-gray-500 dark:text-gray-400">, {result.country}</span>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
