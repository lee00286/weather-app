import { NextResponse } from 'next/server';

import { searchLocations } from '@/lib/api/weather-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Missing required parameter: q', status: 400 },
      { status: 400 },
    );
  }

  if (query.length > 200) {
    return NextResponse.json(
      { error: 'Query too long: maximum 200 characters', status: 400 },
      { status: 400 },
    );
  }

  try {
    const results = await searchLocations(query);

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search locations';
    return NextResponse.json({ error: message, status: 502 }, { status: 502 });
  }
}
