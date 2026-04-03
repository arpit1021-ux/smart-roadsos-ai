const ServiceLocation = require('../models/ServiceLocation');
const axios = require('axios');

// @desc    Get nearby emergency services
// @route   GET /api/services/nearby
// @access  Public
exports.getNearbyServices = async (req, res, next) => {
  try {
    const { lat, lng, type, radius = 10 } = req.query;

    if (!lat || !lng || !type) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and type are required'
      });
    }

    // Convert km to radians for MongoDB
    const radians = parseFloat(radius) / 6371;

    const services = await ServiceLocation.find({
      type,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radians
        }
      }
    })
    .limit(50)
    .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate route between two points
// @route   GET /api/services/route
// @access  Public
exports.calculateRoute = async (req, res, next) => {
  try {
    const { origin, destination, mode = 'driving' } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    // origin and destination format: "lat,lng"
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Google Maps API key not configured'
      });
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json`;
    const params = {
      origin,
      destination,
      mode,
      key: apiKey
    };

    const response = await axios.get(url, { params });

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        message: `Directions error: ${response.data.status}`,
        error: response.data.error_message
      });
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    res.status(200).json({
      success: true,
      route: {
        distance: leg.distance,
        duration: leg.duration,
        polyline: route.overview_polyline.points,
        steps: leg.steps,
        start_location: leg.start_location,
        end_location: leg.end_location
      }
    });
  } catch (error) {
    console.error('Calculate route error:', error);
    next(error);
  }
};

// @desc    Cache services from Google Places (admin utility)
// @route   POST /api/services/cache
// @access  Private (admin only in production)
exports.cacheServices = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10000, type } = req.body;

    if (!lat || !lng || !type) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and type are required'
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Google Maps API key not configured'
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
    const params = {
      location: `${lat},${lng}`,
      radius,
      type: type === 'hospital' ? 'hospital' : type === 'police' ? 'police' : 'health',
      keyword: type === 'hospital' ? 'hospital trauma' : type === 'police' ? 'police station' : 'ambulance',
      key: apiKey
    };

    const response = await axios.get(url, { params });
    const places = response.data.results;

    const cachedServices = [];
    const existingPlaceIds = new Set(
      await ServiceLocation.find({ type }).distinct('googlePlaceId')
    );

    for (const place of places) {
      if (existingPlaceIds.has(place.place_id)) {
        continue; // Skip if already cached
      }

      const service = await ServiceLocation.create({
        name: place.name,
        type,
        location: {
          type: 'Point',
          coordinates: [place.geometry.location.lng, place.geometry.location.lat]
        },
        address: place.vicinity,
        googlePlaceId: place.place_id,
        rating: place.rating,
        phone: '' // Would need Place Details API for phone
      });

      cachedServices.push(service);
    }

    res.status(200).json({
      success: true,
      cached: cachedServices.length,
      services: cachedServices
    });
  } catch (error) {
    console.error('Cache services error:', error);
    next(error);
  }
};
