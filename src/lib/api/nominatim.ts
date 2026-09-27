import type { LocationSearchResult } from '@/lib/types';

const SEARCH_BASE = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'weather-app (postal-code lookup)';
const TIMEOUT_MS = 8000;

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  suburb?: string;
  state?: string;
  region?: string;
  country?: string;
  postcode?: string;
}

interface NominatimPlace {
  lat: string;
  lon: string;
  address: NominatimAddress;
}

function pickName(address: NominatimAddress): string {
  return (
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    address.suburb ??
    address.postcode ??
    ''
  );
}

export async function geocodePostalCode(
  countryCode: string,
  postal: string,
): Promise<LocationSearchResult | null> {
  const url = new URL(SEARCH_BASE);
  url.searchParams.set('postalcode', postal);
  url.searchParams.set('countrycodes', countryCode);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '1');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim geocode error: ${response.status} ${response.statusText}`);
    }

    const data: NominatimPlace[] = await response.json();
    const place = data[0];

    if (!place) {
      return null;
    }

    return {
      name: pickName(place.address),
      region: place.address.state ?? place.address.region ?? '',
      country: place.address.country ?? '',
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      url: '',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
