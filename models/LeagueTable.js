const mongoose = require('mongoose');

const leagueTableSchema = new mongoose.Schema({
  leagueName: {
    type: String,
    required: true,
    unique: true
  },
  sport: {
    type: String,
    required: true
  },
  table: [{
    position: Number,
    team: String,
    played: Number,
    wins: Number,
    draws: Number,
    losses: Number,
    points: Number
  }],
  season: {
    type: String,
    default: '2024'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeagueTable', leagueTableSchema);