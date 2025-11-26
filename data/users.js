const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
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
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  // User preferences and tracking
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
  followedSports: [{
    sportId: String,
    sportName: String,
    category: String,
    icon: String,
    description: String,
    popularity: Number,
    followedAt: { type: Date, default: Date.now }
  }],
  // User profile and preferences
  profile: {
    fullName: String,
    avatar: String,
    bio: String,
    location: String,
    favoriteSports: [String],
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      matchReminders: { type: Boolean, default: true }
    }
  },
  // Account status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: Date,
  loginCount: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(12);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update last login method
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return await this.save();
};

// Check if user exists by email or username
userSchema.statics.userExists = async function(email, username = null) {
  try {
    const query = {
      $or: [{ email: email.toLowerCase() }]
    };
    
    if (username) {
      query.$or.push({ username: username.trim() });
    }
    
    const existingUser = await this.findOne(query);
    return {
      exists: !!existingUser,
      user: existingUser,
      field: existingUser ? 
        (existingUser.email === email.toLowerCase() ? 'email' : 'username') : 
        null
    };
  } catch (error) {
    throw new Error('Error checking user existence: ' + error.message);
  }
};

// Find user by email
userSchema.statics.findByEmail = async function(email) {
  try {
    return await this.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
  } catch (error) {
    throw new Error('Error finding user by email: ' + error.message);
  }
};

// Find user by username
userSchema.statics.findByUsername = async function(username) {
  try {
    return await this.findOne({ 
      username: username.trim(),
      isActive: true 
    });
  } catch (error) {
    throw new Error('Error finding user by username: ' + error.message);
  }
};

// Find user by ID
userSchema.statics.findById = async function(id) {
  try {
    return await this.findOne({ 
      _id: id,
      isActive: true 
    });
  } catch (error) {
    throw new Error('Error finding user by ID: ' + error.message);
  }
};

// Create new user
userSchema.statics.createUser = async function(userData) {
  try {
    const { username, email, password, profile } = userData;
    
    // Validate required fields
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }
    
    // Check if user already exists
    const existingUser = await this.userExists(email, username);
    if (existingUser.exists) {
      throw new Error(`User with this ${existingUser.field} already exists`);
    }
    
    // Create new user
    const user = new this({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      profile: profile || {}
    });
    
    // Save user to database
    await user.save();
    
    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    
    return userObject;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};

// Authenticate user (login)
userSchema.statics.authenticate = async function(email, password) {
  try {
    // Find user by email
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Update last login
    await user.updateLastLogin();
    
    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    
    return userObject;
  } catch (error) {
    throw new Error('Authentication failed: ' + error.message);
  }
};

// Update user profile
userSchema.methods.updateProfile = async function(profileData) {
  try {
    this.profile = { ...this.profile, ...profileData };
    await this.save();
    
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
  } catch (error) {
    throw new Error('Error updating profile: ' + error.message);
  }
};

// Follow/Unfollow team
userSchema.methods.followTeam = async function(teamData) {
  try {
    const { teamId, teamName, sport, league, logo, action } = teamData;
    
    if (action === 'follow') {
      // Add to followed teams if not already following
      const alreadyFollowing = this.followedTeams.some(team => team.teamId === teamId);
      if (!alreadyFollowing) {
        this.followedTeams.push({
          teamId,
          teamName,
          sport,
          league,
          logo,
          followedAt: new Date()
        });
      }
    } else if (action === 'unfollow') {
      // Remove from followed teams
      this.followedTeams = this.followedTeams.filter(team => team.teamId !== teamId);
    }
    
    await this.save();
    return this.followedTeams;
  } catch (error) {
    throw new Error('Error updating team follow: ' + error.message);
  }
};

// Follow/Unfollow player
userSchema.methods.followPlayer = async function(playerData) {
  try {
    const { playerId, playerName, sport, position, team, nationality, image, action } = playerData;
    
    if (action === 'follow') {
      // Add to followed players if not already following
      const alreadyFollowing = this.followedPlayers.some(player => player.playerId === playerId);
      if (!alreadyFollowing) {
        this.followedPlayers.push({
          playerId,
          playerName,
          sport,
          position,
          team,
          nationality,
          image,
          followedAt: new Date()
        });
      }
    } else if (action === 'unfollow') {
      // Remove from followed players
      this.followedPlayers = this.followedPlayers.filter(player => player.playerId !== playerId);
    }
    
    await this.save();
    return this.followedPlayers;
  } catch (error) {
    throw new Error('Error updating player follow: ' + error.message);
  }
};

// Follow/Unfollow sport
userSchema.methods.followSport = async function(sportData) {
  try {
    const { sportId, sportName, category, icon, description, popularity, action } = sportData;
    
    if (action === 'follow') {
      // Add to followed sports if not already following
      const alreadyFollowing = this.followedSports.some(sport => sport.sportId === sportId);
      if (!alreadyFollowing) {
        this.followedSports.push({
          sportId,
          sportName,
          category,
          icon,
          description,
          popularity,
          followedAt: new Date()
        });
      }
    } else if (action === 'unfollow') {
      // Remove from followed sports
      this.followedSports = this.followedSports.filter(sport => sport.sportId !== sportId);
    }
    
    await this.save();
    return this.followedSports;
  } catch (error) {
    throw new Error('Error updating sport follow: ' + error.message);
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const User = this.toObject();
  delete User.password;
  return User;
};

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'followedTeams.teamId': 1 });
userSchema.index({ 'followedPlayers.playerId': 1 });
userSchema.index({ 'followedSports.sportId': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;