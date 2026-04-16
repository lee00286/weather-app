import { LocationSearch } from '@/components/search/LocationSearch';

export default function Home() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center bg-white px-4 dark:bg-gray-950"
    >
      <div className="flex w-full max-w-2xl flex-col items-center pt-[20vh]">
        <h1 className="mb-8 text-4xl font-light tracking-tight text-gray-900 dark:text-gray-50">
          Weather
        </h1>
        <LocationSearch />
      </div>
    </main>
  );
}
