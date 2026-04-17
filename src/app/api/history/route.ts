import { NextResponse } from 'next/server';

import { fetchHistorical } from '@/lib/api/open-meteo';
import { validateLocationParams } from '@/lib/validators';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: start_date and end_date', status: 400 },
      { status: 400 },
    );
  }

  if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
    return NextResponse.json(
      { error: 'Invalid date format: use YYYY-MM-DD', status: 400 },
      { status: 400 },
    );
  }

  if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
    return NextResponse.json(
      { error: 'Invalid date: the provided date does not exist', status: 400 },
      { status: 400 },
    );
  }

  try {
    const timezone = params.tz ?? 'auto';
    const data = await fetchHistorical(params.lat, params.lon, timezone, startDate, endDate);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch historical data';
    return NextResponse.json({ error: message, status: 502 }, { status: 502 });
  }
}
