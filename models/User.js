// models/User.js - UPDATED with pinnedPlayerId field
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

   isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Pinned player feature
  pinnedPlayerId: {
    type: String,
    default: null
  },
  
  // User preferences and follows
  followedTeams: [{
    teamId: Number,
    teamName: String,
    sport: String,
    league: String,
    logo: String,
    followedAt: { type: Date, default: Date.now }
  }],
  
  followedMatches: [{
    matchId: String,
    homeTeam: String,
    awayTeam: String,
    sport: String,
    league: String,
    venue: String,
    time: Date,
    followedAt: { type: Date, default: Date.now }
  }],
  
  followedPlayers: [{
    playerId: String,
    playerName: String,
    sport: String,
    position: String,
    team: String,
    nationality: String,
    image: String,
    followedAt: { type: Date, default: Date.now }
  }],
  
  followedSports: [{
    sportId: String,
    sportName: String,
    category: String,
    icon: String,
    description: String,
    popularity: Number,
    followedAt: { type: Date, default: Date.now }
  }],
  
  // Match reminders
  matchReminders: [{
    matchId: String,
    homeTeam: String,
    awayTeam: String,
    sport: String,
    league: String,
    venue: String,
    time: Date,
    remindedAt: { type: Date, default: Date.now }
  }],
  
  // Tournament reminders
  tournamentReminders: [{
    tournamentId: String,
    tournamentName: String,
    sport: String,
    startDate: String,
    endDate: String,
    remindedAt: { type: Date, default: Date.now }
  }],
  
  // Video preferences
  savedVideos: [{
    videoId: String,
    title: String,
    sport: String,
    category: String,
    duration: String,
    thumbnail: String,
    savedAt: { type: Date, default: Date.now }
  }],
  
  watchedVideos: [{
    videoId: String,
    title: String,
    duration: String,
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // User settings
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    favoriteSports: [String],
    favoriteTeams: [String],
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' }
  },

  
  
  // Profile information
  profile: {
    firstName: String,
    lastName: String,
    bio: { type: String, maxlength: 500 },
    location: String,
    favoritePlayer: String,
    favoriteTeam: String,
    avatar: String,
    coverPhoto: String
  },
  
  // Account status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  
  // Security
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date

}, { 
  timestamps: true 
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'followedPlayers.playerId': 1 });
userSchema.index({ 'followedTeams.teamId': 1 });
userSchema.index({ pinnedPlayerId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  return user;
};

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Method to check if user follows a player
userSchema.methods.isFollowingPlayer = function(playerId) {
  return this.followedPlayers.some(player => player.playerId === playerId);
};

// Method to check if user follows a team
userSchema.methods.isFollowingTeam = function(teamId) {
  return this.followedTeams.some(team => team.teamId === teamId);
};

// Method to check if user follows a sport
userSchema.methods.isFollowingSport = function(sportId) {
  return this.followedSports.some(sport => sport.sportId === sportId);
};

// Method to get user's pinned player data (to be populated from Players collection)
userSchema.methods.getPinnedPlayer = function() {
  // This would typically be used with population
  return this.pinnedPlayerId;
};

// Static method to find by email (case insensitive)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by username (case insensitive)
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: new RegExp(`^${username}$`, 'i') });
};

module.exports = mongoose.model('User', userSchema);