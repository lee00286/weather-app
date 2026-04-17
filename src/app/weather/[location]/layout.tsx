import Link from 'next/link';

function decodeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function WeatherLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  const locationName = decodeSlug(location);

  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            aria-label="Back to search"
            className="text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-50 dark:focus-visible:ring-blue-400"
          >
            &larr;
          </Link>
          <h1 className="flex-1 truncate text-lg font-medium text-gray-900 dark:text-gray-50">
            {locationName}
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-4">{children}</div>
    </main>
  );
}
