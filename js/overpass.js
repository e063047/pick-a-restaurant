// js/overpass.js

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function buildQuery(lat, lon, radiusMeters) {
  return `[out:json][timeout:25];
(
  node["amenity"~"^(restaurant|fast_food|cafe|bar|pub)$"](around:${radiusMeters},${lat},${lon});
  node["shop"~"^(bakery|pastry|confectionery|beverages)$"](around:${radiusMeters},${lat},${lon});
);
out body;`;
}

function parseElement(el) {
  const tags = el.tags || {};
  if (!tags.name) return null;
  const address =
    tags['addr:full'] ||
    [tags['addr:city'], tags['addr:street'], tags['addr:housenumber']]
      .filter(Boolean)
      .join('');
  return {
    id: el.id,
    name: tags.name,
    lat: el.lat,
    lon: el.lon,
    amenity: tags.amenity || null,
    shop: tags.shop || null,
    cuisine: tags.cuisine || null,
    dietVegetarian: tags['diet:vegetarian'] === 'yes',
    dietVegan: tags['diet:vegan'] === 'yes',
    openingHours: tags.opening_hours || null,
    phone: tags.phone || tags['contact:phone'] || null,
    address: address || null,
  };
}

async function queryEndpoint(endpoint, query) {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new Error(`Overpass 查詢失敗：HTTP ${response.status}`);
  }
  return response.json();
}

export async function queryRestaurants(lat, lon, radiusMeters) {
  const query = buildQuery(lat, lon, radiusMeters);
  let lastError = null;
  for (const endpoint of ENDPOINTS) {
    try {
      const data = await queryEndpoint(endpoint, query);
      return (data.elements || []).map(parseElement).filter((r) => r !== null);
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error('查詢餐廳資料失敗，請稍後再試：' + (lastError ? lastError.message : ''));
}
