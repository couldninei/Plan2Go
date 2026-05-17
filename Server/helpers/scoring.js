const RATING_WEIGHT = 0.7; 
const AFFORDABILITY_WEIGHT = 0.3; 

function scoreItem(item, priceField, maxPrice) {
  const rating = item.rating || 0;
  const price = item[priceField] || 0;
  const affordability = maxPrice > 0 ? 1 - price / maxPrice : 1;
  return rating * RATING_WEIGHT + affordability * 5 * AFFORDABILITY_WEIGHT;
}

function rankItems(items, priceField) {
  if (items.length === 0) return [];
  const maxPrice = Math.max(...items.map((i) => i[priceField] || 0), 1);
  return [...items]
    .map((item) => ({ item, score: scoreItem(item, priceField, maxPrice) }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

function pickFromTop(rankedItems, count) {
  if (rankedItems.length === 0 || count <= 0) return [];

  const poolSize = Math.max(count * 2, Math.ceil(rankedItems.length / 2));
  const pool = rankedItems.slice(0, poolSize);

  const picks = [];
  const available = [...pool];
  while (picks.length < count && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    picks.push(available.splice(idx, 1)[0]);
  }
  return picks;
}

module.exports = { scoreItem, rankItems, pickFromTop };
