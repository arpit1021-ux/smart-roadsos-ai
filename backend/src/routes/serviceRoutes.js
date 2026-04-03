const express = require('express');
const router = express.Router();
const {
  getNearbyServices,
  calculateRoute,
  cacheServices
} = require('../controllers/serviceController');

// Routes
router.get('/nearby', getNearbyServices);
router.get('/route', calculateRoute);
router.post('/cache', cacheServices);

module.exports = router;