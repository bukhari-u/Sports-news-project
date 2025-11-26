const mongoose = require('mongoose');

const FixtureSchema = new mongoose.Schema({
  fixtureId: {
    type: String,
    unique: true,
    sparse: true // This allows multiple null values
  },
  teams: {
    home: {
      name: String,
      logo: String,
      form: [String]
    },
    away: {
      name: String,
      logo: String,
      form: [String]
    }
  },
  time: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  league: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    default: 'TBD'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Live', 'Finished', 'Postponed', 'Cancelled','upcoming'],
    default: 'Scheduled'
  },
  round: String,
  season: String,
  referee: String,
  attendance: Number,
  odds: {
    homeWin: Number,
    draw: Number,
    awayWin: Number
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  importance: {
    type: String,
    enum: ['low', 'medium', 'high', 'premium'],
    default: 'medium'
  },
  previousMeetings: [{
    date: Date,
    homeScore: Number,
    awayScore: Number,
    competition: String
  }]
}, {
  timestamps: true
});

// Your existing indexes...
FixtureSchema.index({ sport: 1, date: 1 });
FixtureSchema.index({ league: 1 });
FixtureSchema.index({ status: 1 });
FixtureSchema.index({ isFeatured: 1 });
FixtureSchema.index({ 'teams.home.name': 1, 'teams.away.name': 1 });

// ... rest of your Fixture schema code

module.exports = mongoose.model('Fixture', FixtureSchema);