const mongoose = require('mongoose');

const accidentReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: [
        {
          validator: function (coords) {
            return coords.length === 2 &&
                   coords[0] >= -180 && coords[0] <= 180 &&
                   coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates [longitude, latitude]'
        }
      ]
    }
  },
  address: {
    type: String,
    trim: true
  },
  speed: {
    type: Number,
    min: [0, 'Speed cannot be negative'],
    max: [500, 'Speed seems unrealistic']
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: {
      values: ['car', 'bike', 'motorcycle', 'truck', 'bus', 'bicycle', 'pedestrian'],
      message: 'Invalid vehicle type'
    }
  },
  crashType: {
    type: String,
    required: [true, 'Crash type is required'],
    enum: {
      values: ['head-on', 'side-impact', 'rear-end', 'rollover', 'pedestrian', 'single-vehicle', 'multi-vehicle'],
      message: 'Invalid crash type'
    }
  },
  severityPrediction: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    predictedAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['reported', 'enroute', 'arrived', 'transporting', 'hospital', 'closed'],
    default: 'reported'
  },
  assignedServices: [{
    type: {
      type: String,
      enum: ['ambulance', 'police', 'fire'],
      required: true
    },
    serviceId: {
      type: String,
      required: true
    },
    serviceName: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    eta: {
      type: Number,
      min: 0
    },
    arrivedAt: {
      type: Date
    }
  }],
  nearestHospital: {
    name: {
      type: String,
      trim: true
    },
    location: {
      coordinates: [Number],
      address: String
    },
    distance: {
      type: Number,
      min: 0
    },
    route: {
      type: String,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial index for location queries
accidentReportSchema.index({ location: '2dsphere' });
accidentReportSchema.index({ createdAt: -1 });
accidentReportSchema.index({ status: 1 });

module.exports = mongoose.model('AccidentReport', accidentReportSchema);
