import { LocationSearch } from '@/components/search/LocationSearch';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Home() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center bg-white px-4 dark:bg-gray-950"
    >
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-2xl flex-col items-center pt-[20vh]">
        <h1 className="mb-8 text-4xl font-light tracking-tight text-gray-900 dark:text-gray-50">
          Weather
        </h1>
        <LocationSearch />
      </div>
    </main>
  );
}
