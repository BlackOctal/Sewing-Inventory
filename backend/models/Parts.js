// models/Part.js - MongoDB schema for parts
const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
  partName: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  modelName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    floor: {
      type: Number,
      required: true
    },
    rack: {
      type: Number,
      required: true
    },
    row: {
      type: Number,
      required: true
    },
    column: {
      type: Number,
      required: true
    },
    boxNumber: {
      type: String,
      required: true,
      trim: true
    },
    boxColor: {
      type: String,
      required: true,
      trim: true
    }
  },
  price: {
    landingPrice: {
      type: Number,
      required: true
    },
    retailPrice: {
      type: Number,
      required: true
    }
  },
  quantity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create text indexes for search functionality
PartSchema.index({ 
  partName: 'text', 
  partNumber: 'text',
  modelName: 'text'
});

// Update the 'updatedAt' field on save
PartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Part', PartSchema);