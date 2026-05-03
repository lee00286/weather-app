'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log so the failure shows up in browser devtools and Vercel logs.
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-gray-950"
    >
      <div className="flex max-w-md flex-col items-center text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The app hit an unexpected error. Try again, or return to the search page.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-50 dark:hover:bg-gray-900 dark:focus-visible:ring-blue-400"
          >
            Back to search
          </Link>
        </div>
      </div>
    </main>
  );
}
