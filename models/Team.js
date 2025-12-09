const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['Football', 'Basketball', 'Cricket', 'Baseball', 'Hockey', 'Tennis', 'Formula 1', 'Rugby', 'Golf', 'Boxing', 'MMA', 'Olympics']
  },
  league: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  logo: {
    type: String,
    default: 'TBD'
  },
  stats: {
    overall: {
      position: Number,
      played: Number,
      wins: Number,
      draws: Number,
      losses: Number,
      points: Number,
      trophies: Number,
      championships: Number,
      worldCups: Number,
      worldSeries: Number,
      stanleyCups: Number,
      rating: Number
    },
    home: {
      position: Number,
      played: Number,
      wins: Number,
      draws: Number,
      losses: Number,
      points: Number,
      rating: Number
    },
    away: {
      position: Number,
      played: Number,
      wins: Number,
      draws: Number,
      losses: Number,
      points: Number,
      rating: Number
    }
  },
  keyPlayers: [String],
  schedule: [{
    date: Date,
    opponent: String,
    location: String,
    time: String
  }],
  roster: [{
    name: String,
    position: String,
    number: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for better query performance
teamSchema.index({ sport: 1, league: 1, country: 1 });
teamSchema.index({ featured: 1 });
teamSchema.index({ teamId: 1 });

module.exports = mongoose.model('Team', teamSchema);