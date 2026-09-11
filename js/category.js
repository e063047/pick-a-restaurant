// js/category.js

export function classifyCategory(restaurant) {
  const cuisineParts = (restaurant.cuisine || '').split(';');

  if (cuisineParts.some((c) => ['dessert', 'cake', 'ice_cream', 'waffle'].includes(c))) {
    return '甜點';
  }
  if (cuisineParts.some((c) => ['coffee_shop', 'bubble_tea', 'tea'].includes(c))) {
    return '飲料';
  }
  if (['bakery', 'pastry', 'confectionery'].includes(restaurant.shop)) {
    return '甜點';
  }
  if (restaurant.shop === 'beverages') {
    return '飲料';
  }
  if (restaurant.amenity === 'ice_cream') {
    return '甜點';
  }
  if (['cafe', 'bar', 'pub'].includes(restaurant.amenity)) {
    return '飲料';
  }
  return '正餐';
}

export function filterByCategory(restaurants, categoryOption) {
  if (categoryOption === 'all') return restaurants;
  return restaurants.filter((r) => classifyCategory(r) === categoryOption);
}
