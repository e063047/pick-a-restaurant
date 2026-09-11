// js/mapsLink.js

export function buildGoogleMapsLink(name, lat, lon) {
  const query = encodeURIComponent(`${name} ${lat},${lon}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
