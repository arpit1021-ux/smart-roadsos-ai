const axios = require('axios');

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

const findNearbyPlaces = async (latitude, longitude, radius, type) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const typeMap = {
      hospital: 'hospital',
      police: 'police',
      ambulance: 'health' // Use health as general category
    };

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json`, {
      params: {
        location: `${latitude},${longitude}`,
        radius: radius * 1000, // convert km to meters
        type: typeMap[type] || 'health',
        keyword: type === 'hospital' ? 'hospital trauma emergency' :
                 type === 'police' ? 'police station' :
                 type === 'ambulance' ? 'ambulance emergency' : 'emergency',
        key: apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    return response.data.results.map(place => ({
      name: place.name,
      placeId: place.place_id,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      address: place.vicinity,
      rating: place.rating,
      types: place.types
    }));
  } catch (error) {
    console.error('Google Places error:', error);
    throw error;
  }
};

const getPlaceDetails = async (placeId) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,rating',
        key: apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Place Details API error: ${response.data.status}`);
    }

    return response.data.result;
  } catch (error) {
    console.error('Place Details error:', error);
    throw error;
  }
};

const calculateRoute = async (origin, destination, mode = 'driving') => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // origin and destination can be "lat,lng" strings or addresses
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/directions/json`, {
      params: {
        origin: typeof origin === 'object' ? `${origin.lat},${origin.lng}` : origin,
        destination: typeof destination === 'object' ? `${destination.lat},${destination.lng}` : destination,
        mode,
        key: apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance,
      duration: leg.duration,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance,
        duration: step.duration,
        start_location: step.start_location,
        end_location: step.end_location
      }))
    };
  } catch (error) {
    console.error('Directions error:', error);
    throw error;
  }
};

const reverseGeocode = async (latitude, longitude) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
      params: {
        latlng: `${latitude},${longitude}`,
        key: apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding error: ${response.data.status}`);
    }

    if (response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

module.exports = {
  findNearbyPlaces,
  getPlaceDetails,
  calculateRoute,
  reverseGeocode
};
