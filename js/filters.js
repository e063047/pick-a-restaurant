// js/filters.js
import { isOpenAt } from './openingHours.js';

export function filterByDiet(restaurants, dietOption) {
  if (dietOption === 'all') return restaurants;
  if (dietOption === 'vegetarian') {
    return restaurants.filter((r) => r.dietVegetarian || r.dietVegan);
  }
  if (dietOption === 'meat') {
    return restaurants.filter((r) => !(r.dietVegetarian || r.dietVegan));
  }
  throw new Error('未知的葷素選項：' + dietOption);
}

export function filterByOpeningHours(restaurants, dateTime) {
  return restaurants
    .map((r) => {
      const state = isOpenAt(r.openingHours, dateTime);
      const openStatus = state === null ? 'unknown' : state ? 'open' : 'closed';
      return { ...r, openStatus };
    })
    .filter((r) => r.openStatus !== 'closed');
}
