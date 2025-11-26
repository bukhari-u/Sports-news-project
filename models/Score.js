const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  matchId: {
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
  teams: {
    home: {
      name: String,
      logo: String,
      score: String
    },
    away: {
      name: String,
      logo: String,
      score: String
    }
  },
  status: {
    type: String,
    enum: ['live', 'finished', 'upcoming'],
    required: true
  },
  minute: String,
  venue: String,
  time: {
    type: Date,
    required: true
  },
  competition: String,
  matchDetails: {
    venue: String,
    time: String
  },
  stats: mongoose.Schema.Types.Mixed,
  teamStats: mongoose.Schema.Types.Mixed,
  highlights: {
    videoId: String,
    summary: String
  },
  preview: mongoose.Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for better query performance
scoreSchema.index({ status: 1, time: -1 });
scoreSchema.index({ sport: 1, league: 1 });
scoreSchema.index({ matchId: 1 });

module.exports = mongoose.model('Score', scoreSchema);