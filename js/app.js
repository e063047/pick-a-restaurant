// js/app.js
import { getUserLocation, geocodeAddress } from './geo.js';
import { queryRestaurants } from './overpass.js';
import { filterByDiet, filterByOpeningHours } from './filters.js';
import { sampleRandom } from './sample.js';
import { buildGoogleMapsLink } from './mapsLink.js';
import { Wheel } from './wheel.js';

function pad(n) {
  return String(n).padStart(2, '0');
}

const formSection = document.getElementById('form-section');
const wheelSection = document.getElementById('wheel-section');
const resultSection = document.getElementById('result-section');
const statusMessage = document.getElementById('status-message');
const distanceSelect = document.getElementById('distance-select');
const dietSelect = document.getElementById('diet-select');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const addressInput = document.getElementById('address-input');
const searchBtn = document.getElementById('search-btn');
const spinBtn = document.getElementById('spin-btn');
const restartBtn = document.getElementById('restart-btn');
const restartBtn2 = document.getElementById('restart-btn-2');
const wheelCanvas = document.getElementById('wheel-canvas');

const now = new Date();
dateInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
timeInput.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

let currentWheel = null;

function setStatus(message) {
  statusMessage.textContent = message || '';
}

function showSection(section) {
  [formSection, wheelSection, resultSection].forEach((s) => {
    s.hidden = s !== section;
  });
}

async function resolveLocation() {
  const manualAddress = addressInput.value.trim();
  if (manualAddress) {
    return geocodeAddress(manualAddress);
  }
  try {
    return await getUserLocation();
  } catch (err) {
    addressInput.hidden = false;
    throw new Error('無法自動定位，請在下方輸入地址後再試一次');
  }
}

async function handleSearch() {
  searchBtn.disabled = true;
  setStatus('查詢中，可能需要幾秒鐘...');
  try {
    const { lat, lon } = await resolveLocation();
    const radius = Number(distanceSelect.value);
    const dateTimeValue = new Date(`${dateInput.value}T${timeInput.value}:00`);

    const rawRestaurants = await queryRestaurants(lat, lon, radius);
    const dietFiltered = filterByDiet(rawRestaurants, dietSelect.value);
    const openFiltered = filterByOpeningHours(dietFiltered, dateTimeValue);

    if (openFiltered.length === 0) {
      setStatus('這範圍內沒有符合條件的餐廳，試試看擴大距離或改選「全部」');
      return;
    }

    const candidates = sampleRandom(openFiltered, 10);
    setStatus('');
    showSection(wheelSection);
    currentWheel = new Wheel(wheelCanvas, candidates);
    currentWheel.draw();
  } catch (err) {
    setStatus(err.message);
  } finally {
    searchBtn.disabled = false;
  }
}

function handleSpin() {
  spinBtn.disabled = true;
  currentWheel.spin((winner) => {
    spinBtn.disabled = false;
    showResult(winner);
  });
}

function showResult(restaurant) {
  document.getElementById('result-name').textContent = restaurant.name;
  document.getElementById('result-address').textContent = restaurant.address || '地址未知';
  document.getElementById('result-phone').textContent = restaurant.phone || '電話未知';
  const statusText = { open: '營業中', closed: '休息中', unknown: '營業時間未知' }[restaurant.openStatus];
  document.getElementById('result-open-status').textContent = statusText;
  const dietText = restaurant.dietVegan
    ? '素食（全素）'
    : restaurant.dietVegetarian
    ? '素食（蛋奶素）'
    : '一般餐廳';
  document.getElementById('result-diet').textContent = dietText;
  const link = document.getElementById('maps-link');
  link.href = buildGoogleMapsLink(restaurant.name, restaurant.lat, restaurant.lon);
  showSection(resultSection);
}

function handleRestart() {
  addressInput.value = '';
  addressInput.hidden = true;
  setStatus('');
  showSection(formSection);
}

searchBtn.addEventListener('click', handleSearch);
spinBtn.addEventListener('click', handleSpin);
restartBtn.addEventListener('click', handleRestart);
restartBtn2.addEventListener('click', handleRestart);
