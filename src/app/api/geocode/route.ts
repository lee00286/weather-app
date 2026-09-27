import { NextResponse } from 'next/server';

import { geocodePostalCode } from '@/lib/api/nominatim';
import { isSupportedCountry } from '@/lib/countries';

// Supported countries use purely numeric postal codes (spaces allowed for CZ).
const POSTAL_PATTERN = /^[0-9 ]{2,12}$/;

function badRequest(message: string) {
  return NextResponse.json({ error: message, status: 400 }, { status: 400 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country')?.trim().toLowerCase() ?? '';
  const postal = searchParams.get('postal')?.trim() ?? '';

  if (!country || !postal) {
    return badRequest('Missing required parameters: country, postal');
  }

  if (!isSupportedCountry(country)) {
    return badRequest('Unsupported country');
  }

  if (!POSTAL_PATTERN.test(postal)) {
    return badRequest('Invalid postal code');
  }

  try {
    const result = await geocodePostalCode(country, postal);

    if (!result) {
      return NextResponse.json(
        { error: 'No location found for that postal code', status: 404 },
        { status: 404 },
      );
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to geocode postal code';
    return NextResponse.json({ error: message, status: 502 }, { status: 502 });
  }
}
