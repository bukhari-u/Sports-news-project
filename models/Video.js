// models/Video.js - UPDATED
const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  // Required fields
  title: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  
  // Video identification
  videoId: String,
  youtubeId: String,
  
  // Video metadata
  description: String,
  duration: String,
  thumbnail: String,
  category: [String],
  type: {
    type: String,
    enum: ['video', 'live'],
    default: 'video'
  },
  
  // Engagement metrics
  views: {
    type: String,
    default: '0'
  },
  viewers: {
    type: String,
    default: '0'
  },
  
  // Status and features
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['live', 'upcoming', 'finished'],
    default: 'finished'
  },
  
  // Additional fields
  tags: [String],
  publishedAt: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
VideoSchema.index({ sport: 1, isActive: 1 });
VideoSchema.index({ featured: -1, createdAt: -1 });
VideoSchema.index({ category: 1 });

module.exports = mongoose.models.Video || mongoose.model('Video', VideoSchema);