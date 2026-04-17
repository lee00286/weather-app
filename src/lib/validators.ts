import { DateTime } from 'luxon';

export function validateLocationParams(
  searchParams: Record<string, string | undefined>,
): { lat: number; lon: number; tz: string | null } | null {
  const { lat: latStr, lon: lonStr, tz } = searchParams;

  if (latStr === undefined || lonStr === undefined) {
    return null;
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return null;
  }

  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return null;
  }

  if (tz !== undefined && tz !== '') {
    if (tz === 'auto' || DateTime.now().setZone(tz).isValid) {
      return { lat, lon, tz };
    }
    return null;
  }

  return { lat, lon, tz: null };
}
