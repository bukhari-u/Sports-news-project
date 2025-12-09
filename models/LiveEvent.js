const mongoose = require('mongoose');

const LiveEventSchema = new mongoose.Schema({
  sport: {
    type: String,
    required: true
  },
  teams: {
    home: String,
    away: String
  },
  score: {
    type: String,
    default: '0-0'
  },
  status: {
    type: String,
    enum: ['Live', 'Finished', 'Upcoming'],
    default: 'Live'
  },
  minute: {
    type: String,
    default: '0'
  },
  league: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    default: 'TBD'
  },
  youtubeId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Use existing model if compiled, otherwise create new one
module.exports = mongoose.models.LiveEvent || mongoose.model('LiveEvent', LiveEventSchema);