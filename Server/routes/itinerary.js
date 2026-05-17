const express = require('express');
const router = express.Router();

const { generateItinerary } = require('../services/itineraryGenerator');

router.post('/generate-itinerary', (req, res) => {
  const { destination, budget, days, interests } = req.body || {};

  const errors = [];
  if (!destination || typeof destination !== 'string') {
    errors.push('destination must be a non-empty string');
  }
  if (typeof budget !== 'number' || budget <= 0) {
    errors.push('budget must be a positive number');
  }
  if (typeof days !== 'number' || days < 1) {
    errors.push('days must be a positive integer');
  }
  if (!Array.isArray(interests)) {
    errors.push('interests must be an array');
  }
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const itinerary = generateItinerary({
      destination,
      budget,
      days: Math.floor(days),
      interests,
    });

    if (itinerary.error) {
      return res.status(404).json(itinerary);
    }
    return res.json(itinerary);
  } catch (err) {
    console.error('Itinerary generation failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
