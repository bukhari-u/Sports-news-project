const mongoose = require('mongoose');

const FixtureSchema = new mongoose.Schema({
  fixtureId: {
    type: String,
    required: true,
    unique: true
  },
  sport: {
    type: String,
    required: true
  },
  league: {
    type: String,
    required: true
  },
  homeTeam: {
    name: String,
    shortCode: String
  },
  awayTeam: {
    name: String,
    shortCode: String
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    default: 'TBD'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Live', 'Finished', 'Postponed', 'Cancelled', 'upcoming'],
    default: 'Scheduled'
  },
  round: String,
  competition: String,
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

// Indexes for better query performance
FixtureSchema.index({ sport: 1, date: 1 });
FixtureSchema.index({ league: 1 });
FixtureSchema.index({ status: 1 });
FixtureSchema.index({ isFeatured: 1 });
FixtureSchema.index({ isActive: 1 });

module.exports = mongoose.model('eFixture', FixtureSchema);