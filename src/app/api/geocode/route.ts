import { NextRequest } from 'next/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const PHOTON_URL = 'https://photon.komoot.io';
const REQUEST_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'en',
  'User-Agent': 'AzmarMandi/1.0 (https://azmar-mandi-pwa.vercel.app)',
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: Record<string, string>;
};

function normalizeResult(result: NominatimResult) {
  const address = result.address ?? {};
  return {
    lat: Number(result.lat),
    lng: Number(result.lon),
    name:
      result.name ||
      address.road ||
      address.neighbourhood ||
      address.suburb ||
      address.city ||
      address.town ||
      address.village ||
      'Selected location',
    displayName: result.display_name,
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  const suggestionsRequested = request.nextUrl.searchParams.get('suggest') === '1';
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');

  let endpoint: URL;

  if (query) {
    if (query.length < 3 || query.length > 160) {
      return Response.json({ error: 'Enter at least 3 characters.' }, { status: 400 });
    }

    if (suggestionsRequested) {
      endpoint = new URL('/api', PHOTON_URL);
      endpoint.searchParams.set('q', query);
      endpoint.searchParams.set('lang', 'en');
      endpoint.searchParams.set('limit', '3');
      endpoint.searchParams.set('lat', '8.475091650738907');
      endpoint.searchParams.set('lon', '76.94724385255535');
      endpoint.searchParams.set('location_bias_scale', '0.2');
    } else {
      endpoint = new URL('/search', NOMINATIM_URL);
      endpoint.searchParams.set('q', query);
      endpoint.searchParams.set('format', 'jsonv2');
      endpoint.searchParams.set('addressdetails', '1');
      endpoint.searchParams.set('countrycodes', 'in');
      endpoint.searchParams.set('limit', '5');
    }
  } else if (lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    endpoint = new URL('/reverse', NOMINATIM_URL);
    endpoint.searchParams.set('lat', lat);
    endpoint.searchParams.set('lon', lng);
    endpoint.searchParams.set('format', 'jsonv2');
    endpoint.searchParams.set('addressdetails', '1');
    endpoint.searchParams.set('zoom', '18');
  } else {
    return Response.json({ error: 'Provide an address or valid coordinates.' }, { status: 400 });
  }

  try {
    const response = await fetch(endpoint, {
      headers: REQUEST_HEADERS,
      cache: 'no-store',
    });

    if (!response.ok) {
      return Response.json({ error: 'Location service is temporarily unavailable.' }, { status: 502 });
    }

    const payload = await response.json();

    if (query && suggestionsRequested) {
      const features = (payload as {
        features?: Array<{
          geometry: { coordinates: [number, number] };
          properties: Record<string, string | undefined>;
        }>;
      }).features ?? [];
      const results = features.map(({ geometry, properties }) => {
        const addressParts = [
          properties.name,
          [properties.housenumber, properties.street].filter(Boolean).join(' '),
          properties.locality || properties.district,
          properties.city,
          properties.state,
          properties.postcode,
          properties.country,
        ].filter((part, index, parts) => Boolean(part) && parts.indexOf(part) === index);

        return {
          lat: geometry.coordinates[1],
          lng: geometry.coordinates[0],
          name: properties.name || properties.street || properties.city || 'Selected location',
          displayName: addressParts.join(', '),
        };
      });
      return Response.json({ results });
    }

    if (query) {
      const results = (payload as NominatimResult[]).map(normalizeResult);
      return Response.json({ results });
    }

    return Response.json({ result: normalizeResult(payload as NominatimResult) });
  } catch {
    return Response.json({ error: 'Unable to contact the location service.' }, { status: 502 });
  }
}
