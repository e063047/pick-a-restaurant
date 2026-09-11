// js/geo.js

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('此瀏覽器不支援定位功能'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (error) => {
        reject(new Error('無法取得您的位置：' + error.message));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  });
}

export async function geocodeAddress(address) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
    encodeURIComponent(address);
  const response = await fetch(url, {
    headers: { 'Accept-Language': 'zh-TW' },
  });
  if (!response.ok) {
    throw new Error('地址查詢服務暫時無法使用');
  }
  const results = await response.json();
  if (results.length === 0) {
    throw new Error('找不到這個地址，請試試更完整的地址');
  }
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}
