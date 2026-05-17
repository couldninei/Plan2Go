const INTEREST_MAP: Record<string, Record<string, string | string[]>> = {
  food:      { restaurants: '*' },
  adventure: { activities: ['adventure'], attractions: ['nature', 'entertainment'] },
  culture:   { activities: ['cultural'],  attractions: ['cultural', 'historical'] },
  shopping:  { attractions: ['entertainment'] },
  nature:    { activities: ['relaxation'], attractions: ['nature'] },
  nightlife: { activities: ['relaxation'], attractions: ['entertainment'] },
};

export function filterByDestination(items: any[], destination: string): any[] {
  if (!destination) return [];
  const target = destination.trim().toLowerCase();
  return items.filter((item) => item.city.toLowerCase() === target);
}

export function matchesInterests(item: any, interests: string[] | undefined, category: string): boolean {
  if (!interests || interests.length === 0) return true;

  for (const interest of interests) {
    const config = INTEREST_MAP[interest];
    if (!config) continue;

    const allowed = config[category];
    if (!allowed) continue;
    if (allowed === '*') return true;

    // attractions store their tag under `category`, activities under `type`
    const fieldName = category === 'activities' ? 'type' : 'category';
    if (Array.isArray(allowed) && allowed.includes(item[fieldName])) return true;
  }

  return false;
}


export function filterByInterests(items: any[], interests: string[] | undefined, category: string): any[] {
  return items.filter((item) => matchesInterests(item, interests, category));
}

export function applyFilters(items: any[], filters: { destination?: string; interests?: string[] }, category: string): any[] {
  let result = items;
  
  if (filters.destination) {
    result = filterByDestination(result, filters.destination);
  }
  
  if (filters.interests && filters.interests.length > 0) {
    result = filterByInterests(result, filters.interests, category);
  }
  
  return result;
}
