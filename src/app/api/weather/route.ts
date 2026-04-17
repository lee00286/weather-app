import { NextResponse } from 'next/server';

import { fetchForecast } from '@/lib/api/open-meteo';
import { validateLocationParams } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const params = validateLocationParams({
    lat: searchParams.get('lat') ?? undefined,
    lon: searchParams.get('lon') ?? undefined,
    tz: searchParams.get('tz') ?? undefined,
  });

  if (!params) {
    return NextResponse.json(
      { error: 'Invalid or missing parameters: lat and lon are required', status: 400 },
      { status: 400 },
    );
  }

  try {
    const timezone = params.tz ?? 'auto';
    const data = await fetchForecast(params.lat, params.lon, timezone);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch weather data';
    return NextResponse.json({ error: message, status: 502 }, { status: 502 });
  }
}
