const path = require('path');
const fs = require('fs');

const DATA_PATH = path.join(__dirname, '..', 'data', 'travel_dataset_thb.json');
const dataset = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const CURRENCY = dataset.metadata?.currency || 'THB';

function normalizeHotel(h) {
  return {
    id: h.id,
    type: 'hotel',
    name: h.name,
    city: h.city,
    country: h.country,
    description: h.description,
    rating: h.rating,
    price: h.price_per_night,
    priceUnit: 'per night',
    meta: { hotelType: h.type, amenities: h.amenities || [] },
  };
}

function normalizeRestaurant(r) {
  return {
    id: r.id,
    type: 'restaurant',
    name: r.name,
    city: r.city,
    country: r.country,
    description: r.description,
    rating: r.rating,
    price: r.average_cost_per_person,
    priceUnit: 'per person',
    meta: { cuisine: r.cuisine, mustTry: r.must_try || [] },
  };
}

function normalizeAttraction(a) {
  return {
    id: a.id,
    type: 'attraction',
    name: a.name,
    city: a.city,
    country: a.country,
    description: a.description,
    rating: a.rating,
    price: a.ticket_price,
    priceUnit: 'per person',
    meta: { category: a.category, estimatedTime: a.estimated_time },
  };
}

function normalizeActivity(a) {
  return {
    id: a.id,
    type: 'activity',
    name: a.name,
    city: a.city,
    country: a.country,
    description: a.description,
    rating: a.rating,
    price: a.price_per_person,
    priceUnit: 'per person',
    meta: { activityType: a.type, duration: a.duration },
  };
}

function normalizeTransport(t) {
  return {
    id: t.id,
    type: 'transport',
    name: t.name,
    city: t.city,
    country: t.country,
    description: t.description,
    rating: t.rating,
    price: t.average_cost_per_trip,
    priceUnit: 'per trip',
    meta: { transportType: t.type, availability: t.availability },
  };
}

const ALL_ITEMS = [
  ...dataset.hotels.map(normalizeHotel),
  ...dataset.restaurants.map(normalizeRestaurant),
  ...dataset.attractions.map(normalizeAttraction),
  ...dataset.activities.map(normalizeActivity),
  ...dataset.local_transport.map(normalizeTransport),
];

function getExploreItems({ type, city, search } = {}) {
  let items = ALL_ITEMS;

  if (type && type !== 'all') {
    items = items.filter((i) => i.type === type);
  }
  if (city && city !== 'all') {
    items = items.filter(
      (i) => i.city.toLowerCase() === city.toLowerCase()
    );
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  }

  return items;
}

function getExploreFilters() {
  const cities = [...new Set(ALL_ITEMS.map((i) => i.city))].sort();
  const types = ['hotel', 'restaurant', 'attraction', 'activity', 'transport'];
  return { cities, types };
}

module.exports = { getExploreItems, getExploreFilters, CURRENCY };