const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  tournamentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'finished', 'cancelled'],
    default: 'upcoming'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  teams: {
    type: Number,
    required: true
  },
  currentStage: String,
  format: String,
  prizeMoney: String,
  defendingChampion: String,
  description: String,
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tournament', tournamentSchema);