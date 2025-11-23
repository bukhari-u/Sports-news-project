// models/News.js - Enhanced version
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  sport: { type: String, required: true, trim: true },
  league: { type: String, required: true, trim: true },
  title: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String },
  img: { type: String },
  author: { type: String },
  date: { type: Date, default: Date.now },
  teams: {
    home: String,
    away: String
  },
  score: String,
  status: String,
  venue: String,
  meta_external_id: String
}, { 
  timestamps: true 
});

// Index for better query performance
NewsSchema.index({ sport: 1, date: -1 });
NewsSchema.index({ league: 1 });
NewsSchema.index({ 'teams.home': 1, 'teams.away': 1 });

module.exports = mongoose.model('News', NewsSchema);