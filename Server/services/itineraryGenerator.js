const path = require('path');
const fs = require('fs');

const { filterByDestination, filterByInterests } = require('../helpers/filters');
const { rankItems, pickFromTop } = require('../helpers/scoring');

const DATA_PATH = path.join(__dirname, '..', 'data', 'travel_dataset_thb.json');
const dataset = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const HOTEL_BUDGET_SHARE = 0.4;

function selectHotel(hotels, totalBudget, days) {
  if (hotels.length === 0) return null;

  const maxPerNight = (totalBudget * HOTEL_BUDGET_SHARE) / days;
  const affordable = hotels.filter((h) => h.price_per_night <= maxPerNight);
  const pool = affordable.length > 0 ? affordable : hotels;

  const ranked = rankItems(pool, 'price_per_night');
  return pickFromTop(ranked, 1)[0] || null;
}

function buildThingsToDoPool(attractions, activities) {
  return [...attractions, ...activities].map((item) => ({
    ...item,
    ticket_price: item.ticket_price ?? item.price_per_person ?? 0,
  }));
}

function buildDays({ days, attractions, restaurants, remainingBudget }) {
  const rankedAttractions = rankItems(attractions, 'ticket_price');
  const rankedRestaurants = rankItems(restaurants, 'average_cost_per_person');

  const usedAttractionIds = new Set();
  const usedRestaurantIds = new Set();
  let spent = 0;
  let budgetReached = false;
  const dayPlans = [];

  for (let d = 1; d <= days; d++) {
    const dayPlan = { day: d, activities: [], restaurants: [] };

    const attractionTarget = 2 + Math.floor(Math.random() * 2);
    const available = rankedAttractions.filter((a) => !usedAttractionIds.has(a.id));
    const candidates = pickFromTop(available, attractionTarget);

    for (const att of candidates) {
      const cost = att.ticket_price || 0;
      if (spent + cost > remainingBudget) {
        budgetReached = true;
        break;
      }
      dayPlan.activities.push(att);
      usedAttractionIds.add(att.id);
      spent += cost;
    }

    const restaurantTarget = 1 + Math.floor(Math.random() * 2);
    const availableRest = rankedRestaurants.filter((r) => !usedRestaurantIds.has(r.id));
    const candidateRest = pickFromTop(availableRest, restaurantTarget);

    for (const rst of candidateRest) {
      const cost = rst.average_cost_per_person || 0;
      if (spent + cost > remainingBudget) {
        budgetReached = true;
        break;
      }
      dayPlan.restaurants.push(rst);
      usedRestaurantIds.add(rst.id);
      spent += cost;
    }

    dayPlans.push(dayPlan);

    if (budgetReached) {
      for (let r = d + 1; r <= days; r++) {
        dayPlans.push({ day: r, activities: [], restaurants: [], note: 'budget exhausted' });
      }
      break;
    }
  }

  return { days: dayPlans, spent };
}

function generateItinerary({ destination, budget, days, interests }) {
  const cityHotels = filterByDestination(dataset.hotels, destination);
  const cityAttractions = filterByDestination(dataset.attractions, destination);
  const cityRestaurants = filterByDestination(dataset.restaurants, destination);
  const cityActivities = filterByDestination(dataset.activities, destination);

  if (cityHotels.length === 0 && cityAttractions.length === 0) {
    return { error: `No data available for destination "${destination}".` };
  }

  const matchedAttr = filterByInterests(cityAttractions, interests, 'attractions');
  const matchedAct = filterByInterests(cityActivities, interests, 'activities');
  const matchedRst = filterByInterests(cityRestaurants, interests, 'restaurants');

  const thingsToDo = buildThingsToDoPool(
    matchedAttr.length + matchedAct.length > 0 ? matchedAttr : cityAttractions,
    matchedAttr.length + matchedAct.length > 0 ? matchedAct : cityActivities,
  );
  const restaurants = matchedRst.length > 0 ? matchedRst : cityRestaurants;

  const hotel = selectHotel(cityHotels, budget, days);
  const hotelCost = hotel ? hotel.price_per_night * days : 0;
  const remainingBudget = Math.max(budget - hotelCost, 0);

  const { days: dayPlans, spent } = buildDays({
    days,
    attractions: thingsToDo,
    restaurants,
    remainingBudget,
  });

  return {
    destination,
    interests,
    currency: dataset.metadata?.currency || 'THB',
    budget,
    hotel,
    total_estimated_cost: hotelCost + spent,
    days: dayPlans,
  };
}

module.exports = { generateItinerary };
