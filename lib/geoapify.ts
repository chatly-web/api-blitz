export type ResolvedPlace = {
  formatted: string;
  name?: string;
  neighborhood?: string;
  city?: string;
};

function getGeoapifyKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GEOAPIFY_KEY || process.env.PUBLIC_GEOAPIFY_KEY || process.env.GEOAPIFY_KEY;
}

export async function reverseGeocodeGeoapify(lat: number, lng: number, signal?:AbortSignal): Promise<ResolvedPlace | null> {
  const apiKey = getGeoapifyKey();
  if (!apiKey) return null;
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&apiKey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(8000)]):AbortSignal.timeout(8000)});
    if (!response.ok) return null;
    const data = await response.json();
    const result = data.results?.[0];
    if (!result) return null;
    const neighborhood = result.suburb || result.district || result.neighbourhood || result.city_block || result.quarter;
    return {
      formatted: result.formatted || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      name: result.name,
      neighborhood: neighborhood || undefined,
      city: result.city || result.county,
    };
  } catch {
    return null;
  }
}

export function getMapTileConfig() {
  const apiKey = getGeoapifyKey();
  if (apiKey) {
    return {
      url: `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${encodeURIComponent(apiKey)}`,
      attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 20,
      provider: 'Geoapify (osm-bright)' as const,
    };
  }
  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 19,
    provider: 'OpenStreetMap' as const,
  };
}
