const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  sport: { 
    type: String, 
    required: true, 
    trim: true 
  },
  league: { 
    type: String, 
    required: true, 
    trim: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  excerpt: { 
    type: String 
  },
  content: { 
    type: String 
  },
  img: { 
    type: String 
  },
  author: { 
    type: String 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  teams: {
    home: String,
    away: String
  },
  score: String,
  status: {
    type: String,
    enum: ['Live', 'Finished', 'Upcoming', 'Cancelled'],
    default: 'Finished'
  },
  venue: String,
  meta_external_id: String,
  isFavorite: {
    type: Boolean,
    default: false
  },
  youtubeId: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [String]
}, { 
  timestamps: true 
});

// Index for better query performance
NewsSchema.index({ sport: 1, date: -1 });
NewsSchema.index({ league: 1 });
NewsSchema.index({ 'teams.home': 1, 'teams.away': 1 });
NewsSchema.index({ status: 1 });
NewsSchema.index({ isFavorite: 1 });
NewsSchema.index({ tags: 1 });

// Virtual for formatted date
NewsSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Instance method to toggle favorite
NewsSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

// Static method to get featured news
NewsSchema.statics.getFeatured = function(limit = 5) {
  return this.find({})
    .sort({ date: -1, views: -1 })
    .limit(limit)
    .exec();
};

// Static method to get by sport
NewsSchema.statics.getBySport = function(sport, limit = 10) {
  return this.find({ sport })
    .sort({ date: -1 })
    .limit(limit)
    .exec();
};

module.exports = mongoose.model('News', NewsSchema);