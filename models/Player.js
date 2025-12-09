const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  currentClub: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  height: {
    type: String
  },
  weight: {
    type: String
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  stats: {
    type: Map,
    of: String
  },
  trophies: {
    type: Map,
    of: Number
  },
  career: [{
    year: String,
    club: String,
    achievement: String,
    details: String,
    apps: Number,
    goals: Number,
    points: Number,
    wins: Number,
    championships: Number,
    superBowls: Number,
    mvps: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);