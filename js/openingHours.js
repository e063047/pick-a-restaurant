// js/openingHours.js
// 依賴全域的 window.opening_hours（由 index.html 載入的 opening_hours.js 函式庫提供）

export function isOpenAt(openingHoursString, date) {
  if (!openingHoursString) return null;
  try {
    const oh = new window.opening_hours(openingHoursString);
    return oh.getState(date);
  } catch (err) {
    return null;
  }
}
