
const express = require('express');
const router = express.Router();
const {
  getExploreItems,
  getExploreFilters,
  CURRENCY,
} = require('../services/exploreService');
 
router.get('/explore', (req, res) => {
  try {
    const { type, city, search } = req.query;
    const items = getExploreItems({ type, city, search });
    res.json({
      currency: CURRENCY,
      count: items.length,
      items,
    });
  } catch (err) {
    console.error('Explore endpoint failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
 
router.get('/explore/filters', (req, res) => {
  try {
    res.json(getExploreFilters());
  } catch (err) {
    console.error('Explore filters endpoint failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
 
module.exports = router;