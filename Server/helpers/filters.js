const INTEREST_MAP = {
  food:      { restaurants: '*' },
  adventure: { activities: ['adventure'], attractions: ['nature', 'entertainment'] },
  culture:   { activities: ['cultural'],  attractions: ['cultural', 'historical'] },
  shopping:  { attractions: ['entertainment'] },
  nature:    { activities: ['relaxation'], attractions: ['nature'] },
  nightlife: { activities: ['relaxation'], attractions: ['entertainment'] },
};

function filterByDestination(items, destination) {
  if (!destination) return [];
  const target = destination.trim().toLowerCase();
  return items.filter((item) => item.city.toLowerCase() === target);
}

function matchesInterests(item, interests, category) {
  if (!interests || interests.length === 0) return true;

  for (const interest of interests) {
    const config = INTEREST_MAP[interest];
    if (!config) continue;

    const allowed = config[category];
    if (!allowed) continue;
    if (allowed === '*') return true;

    const fieldName = category === 'activities' ? 'type' : 'category';
    if (allowed.includes(item[fieldName])) return true;
  }
  return false;
}


function filterByInterests(items, interests, category) {
  return items.filter((item) => matchesInterests(item, interests, category));
}

module.exports = {
  INTEREST_MAP,
  filterByDestination,
  filterByInterests,
  matchesInterests,
};
