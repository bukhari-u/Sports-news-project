const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
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
  // UPDATED: Followed sports array with enhanced fields
  followedSports: [{
    sportId: String,
    sportName: String,
    category: String,
    icon: String,
    description: String,
    popularity: Number,
    followedAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

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
  return user;
};

module.exports = mongoose.model('User', userSchema);