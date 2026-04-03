const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  reportAccident,
  getMyAccidents,
  getAccident,
  updateStatus,
  getNearbyAccidents
} = require('../controllers/accidentController');
const { protect, protectAdmin } = require('../middleware/auth');

const accidentValidation = [
  body('location').isObject().withMessage('Location is required'),
  body('location.latitude').isFloat().withMessage('Valid latitude required'),
  body('location.longitude').isFloat().withMessage('Valid longitude required'),
  body('vehicleType').isIn([
    'car', 'bike', 'motorcycle', 'truck', 'bus', 'bicycle', 'pedestrian'
  ]).withMessage('Invalid vehicle type'),
  body('crashType').isIn([
    'head-on', 'side-impact', 'rear-end', 'rollover',
    'pedestrian', 'single-vehicle', 'multi-vehicle'
  ]).withMessage('Invalid crash type'),
  body('speed')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Speed must be between 0 and 500 km/h')
];

// Routes
router.post('/', protect, accidentValidation, reportAccident);
router.get('/', protect, getMyAccidents);
router.get('/nearby', protect, getNearbyAccidents);
router.get('/:id', protect, getAccident);
router.put('/:id/status', protect, updateStatus);

module.exports = router;
