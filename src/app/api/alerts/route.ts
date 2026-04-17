import { NextResponse } from 'next/server';

import { fetchAlerts } from '@/lib/api/weather-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  if (latStr === null || lonStr === null) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat and lon', status: 400 },
      { status: 400 },
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return NextResponse.json(
      { error: 'Invalid lat: must be a number between -90 and 90', status: 400 },
      { status: 400 },
    );
  }

  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Invalid lon: must be a number between -180 and 180', status: 400 },
      { status: 400 },
    );
  }

  try {
    const alerts = await fetchAlerts(lat, lon);

    return NextResponse.json(alerts, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch alerts';
    return NextResponse.json({ error: message, status: 502 }, { status: 502 });
  }
}
