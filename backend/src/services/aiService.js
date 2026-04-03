const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Predict accident severity using the AI module
 * @param {Object} data - Accident data
 * @param {number} data.speed - Speed in km/h
 * @param {string} data.vehicleType - Type of vehicle
 * @param {string} data.crashType - Type of crash
 * @param {Object} data.location - { latitude, longitude }
 * @param {Date} data.timestamp - When accident occurred
 * @returns {Object} - { level, confidence }
 */
const predictSeverity = async (data) => {
  try {
    // Make request to AI service
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
      speed: data.speed || 0,
      vehicle_type: data.vehicleType || 'car',
      crash_type: data.crashType || 'single-vehicle',
      timestamp: data.timestamp ? data.timestamp.toISOString() : new Date().toISOString(),
      location: data.location || null
    }, {
      timeout: 5000 // 5 second timeout
    });

    if (response.data && response.data.success) {
      return {
        level: response.data.severity,
        confidence: response.data.confidence || 0.5,
        details: response.data.details || {}
      };
    }

    // Fallback: Use rule-based prediction if AI service fails
    return ruleBasedPrediction(data);
  } catch (error) {
    console.error('AI service error:', error.message);
    // Fallback to rule-based prediction
    return ruleBasedPrediction(data);
  }
};

/**
 * Rule-based severity prediction (fallback)
 * @param {Object} data
 * @returns {Object}
 */
const ruleBasedPrediction = (data) => {
  const { speed, vehicleType, crashType } = data;
  let score = 0;

  // Speed factor (0-50 points)
  if (speed >= 100) score += 50;
  else if (speed >= 80) score += 40;
  else if (speed >= 60) score += 30;
  else if (speed >= 40) score += 20;
  else if (speed >= 20) score += 10;

  // Vehicle vulnerability factor (0-25 points)
  const vulnerableVehicles = ['bicycle', 'pedestrian', 'motorcycle', 'bike'];
  if (vulnerableVehicles.includes(vehicleType)) {
    score += 25;
  } else if (vehicleType === 'car') {
    score += 15;
  } else {
    score += 10;
  }

  // Crash type severity (0-25 points)
  const severeCrashes = ['head-on', 'multi-vehicle', 'rollover'];
  const moderateCrashes = ['side-impact', 'rear-end'];
  if (severeCrashes.includes(crashType)) {
    score += 25;
  } else if (moderateCrashes.includes(crashType)) {
    score += 15;
  } else {
    score += 10;
  }

  // Determine level
  let level;
  if (score >= 70) {
    level = 'critical';
  } else if (score >= 50) {
    level = 'high';
  } else if (score >= 30) {
    level = 'medium';
  } else {
    level = 'low';
  }

  const confidence = 0.7; // Rule-based has moderate confidence

  return {
    level,
    confidence,
    score,
    method: 'rule-based',
    reason: `Score: ${score} (speed: ${speed} km/h, vehicle: ${vehicleType}, crash: ${crashType})`
  };
};

/**
 * Train the ML model (run separately)
 */
const trainModel = async () => {
  console.log('Model training should be done separately using train_model.py');
  console.log('Run: python ai-module/train_model.py');
};

module.exports = {
  predictSeverity,
  trainModel
};
