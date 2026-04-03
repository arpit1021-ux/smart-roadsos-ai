const mongoose = require('mongoose');

const serviceLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Service type is required'],
    enum: {
      values: ['hospital', 'police', 'ambulance'],
      message: 'Invalid service type'
    }
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
  phone: {
    type: String,
    trim: true
  },
  googlePlaceId: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  openingHours: [{
    day: String,
    open: String,
    close: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial index for location queries
serviceLocationSchema.index({ location: '2dsphere' });
serviceLocationSchema.index({ type: 1, name: 1 });

module.exports = mongoose.model('ServiceLocation', serviceLocationSchema);
