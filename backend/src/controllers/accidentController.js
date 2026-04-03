const AccidentReport = require('../models/AccidentReport');
const User = require('../models/User');
const { predictSeverity } = require('../services/aiService');
const { sendSMS } = require('../services/smsService');

// @desc    Report a new accident
// @route   POST /api/accidents
// @access  Private
exports.reportAccident = async (req, res, next) => {
  try {
    const { speed, vehicleType, crashType, address } = req.body;
    const { latitude, longitude } = req.body.location || {};

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    // Predict severity using AI module
    const prediction = await predictSeverity({
      speed,
      vehicleType,
      crashType,
      location: { latitude, longitude },
      timestamp: new Date()
    });

    // Create accident report
    const accident = await AccidentReport.create({
      userId: req.user._id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      address: address || '',
      speed: speed || 0,
      vehicleType,
      crashType,
      severityPrediction: {
        level: prediction.level,
        confidence: prediction.confidence
      },
      status: 'reported'
    });

    // Populate user info
    await accident.populate('userId', 'username phone emergencyContacts');

    // Send SMS alerts to emergency contacts (async, don't block response)
    if (req.user.phone || (req.user.emergencyContacts && req.user.emergencyContacts.length > 0)) {
      sendSMSAlert(req.user, accident).catch(console.error);
    }

    // Broadcast to WebSocket room
    const io = req.app.get('io');
    if (io) {
      io.emit('new_accident', {
        type: 'NEW_ACCIDENT',
        payload: accident
      });
    }

    res.status(201).json({
      success: true,
      accident
    });
  } catch (error) {
    console.error('Report accident error:', error);
    next(error);
  }
};

// @desc    Get user's accident reports
// @route   GET /api/accidents
// @access  Private
exports.getMyAccidents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const accidents = await AccidentReport.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AccidentReport.countDocuments(query);

    res.status(200).json({
      success: true,
      count: accidents.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      accidents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single accident report
// @route   GET /api/accidents/:id
// @access  Private
exports.getAccident = async (req, res, next) => {
  try {
    const accident = await AccidentReport.findById(req.params.id)
      .populate('userId', 'username phone');

    if (!accident) {
      return res.status(404).json({
        success: false,
        message: 'Accident report not found'
      });
    }

    // Check ownership (or allow admin access)
    if (accident.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this accident'
      });
    }

    res.status(200).json({
      success: true,
      accident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update accident status
// @route   PUT /api/accidents/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const accident = await AccidentReport.findById(req.params.id);

    if (!accident) {
      return res.status(404).json({
        success: false,
        message: 'Accident report not found'
      });
    }

    // Update status
    accident.status = status;

    // Handle status-specific timestamps
    if (status === 'arrived' && !accident.assignedServices.find(s => s.type === 'ambulance')?.arrivedAt) {
      const ambulance = accident.assignedServices.find(s => s.type === 'ambulance');
      if (ambulance) {
        ambulance.arrivedAt = new Date();
      }
    }

    await accident.save();
    await accident.populate('userId', 'username phone');

    // Broadcast update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`accident_${accident._id}`).emit('status_update', {
        type: 'STATUS_UPDATE',
        accidentId: accident._id,
        status,
        accident
      });
    }

    res.status(200).json({
      success: true,
      accident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby accidents (for admin/dashboard)
// @route   GET /api/accidents/nearby
// @access  Private
exports.getNearbyAccidents = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50 } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Convert km to radians for MongoDB
    const radians = parseFloat(radius) / 6371; // Earth's radius in km

    const accidents = await AccidentReport.find({
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
    .limit(100)
    .populate('userId', 'username');

    res.status(200).json({
      success: true,
      count: accidents.length,
      accidents
    });
  } catch (error) {
    next(error);
  }
};

// Send SMS alerts (called internally)
async function sendSMSAlert(user, accident) {
  try {
    const contacts = user.emergencyContacts || [];
    if (contacts.length === 0 && !user.phone) {
      return;
    }

    const message = `EMERGENCY ALERT: Road accident reported at ${accident.address || 'location'}. ` +
                   `Severity: ${accident.severityPrediction.level.toUpperCase()}. ` +
                   `Track updates: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/accident/${accident._id}`;

    const recipients = [];

    if (user.phone) {
      recipients.push(user.phone);
    }

    contacts.forEach(contact => {
      if (contact.phone) {
        recipients.push(contact.phone);
      }
    });

    // Send SMS to all recipients
    for (const phone of recipients) {
      await sendSMS(phone, message);
    }

    console.log(`SMS alerts sent to ${recipients.length} recipients`);
  } catch (error) {
    console.error('Failed to send SMS alerts:', error);
  }
}
