const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import models
const User = require('./models/User');

// Enhanced middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session middleware with better configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'sports-app-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportsdb';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Authentication Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password
    });

    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };

    res.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account'
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({
      success: true,
      user: req.session.user
    });
  } else {
    res.json({
      success: false,
      user: null
    });
  }
});

// Follow/Unfollow team endpoint
app.post('/api/user/follow-team', async (req, res) => {
  console.log('🔔 Follow team request received:', req.body);
  
  if (!req.session.user) {
    console.log('⚠️ No user session found');
    return res.status(401).json({
      success: false,
      message: 'Please log in to follow teams'
    });
  }

  const { teamId, teamName, sport, league, logo, action } = req.body;

  console.log('📋 Request details:', {
    sessionUser: req.session.user,
    teamId,
    teamName,
    action
  });

  if (!teamId || !teamName || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: teamId, teamName, action'
    });
  }

  // Convert teamId to number
  const teamIdNum = parseInt(teamId);
  
  let update;
  let message;
  let responseAction;

  if (action === 'follow') {
    update = {
      $addToSet: {
        followedTeams: { 
          teamId: teamIdNum, 
          teamName, 
          sport: sport || 'Unknown',
          league: league || 'Unknown', 
          logo: logo || 'TBD',
          followedAt: new Date()
        }
      }
    };
    message = `You are now following ${teamName}`;
    responseAction = 'followed';
  } else if (action === 'unfollow') {
    update = {
      $pull: {
        followedTeams: { teamId: teamIdNum }
      }
    };
    message = `You have unfollowed ${teamName}`;
    responseAction = 'unfollowed';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "follow" or "unfollow"'
    });
  }

  try {
    const result = await User.updateOne(
      { _id: req.session.user.id },
      update
    );

    console.log('📊 Update result:', result);

    if (result.matchedCount === 0) {
      console.log('❌ User not found during update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Team ${action}ed successfully. Modified: ${result.modifiedCount}`);

    res.json({
      success: true,
      message,
      action: responseAction,
      modified: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('❌ Follow team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating team follow status',
      error: error.message
    });
  }
});

// Follow/Unfollow Match endpoint
app.post('/api/user/follow-match', async (req, res) => {
  console.log('🔔 Follow match request received:', req.body);
  
  if (!req.session.user) {
    console.log('⚠️ No user session found');
    return res.status(401).json({
      success: false,
      message: 'Please log in to follow matches'
    });
  }

  const { matchId, homeTeam, awayTeam, sport, league, venue, time, action } = req.body;

  console.log('📋 Follow match request details:', {
    sessionUser: req.session.user,
    matchId,
    homeTeam,
    awayTeam,
    action
  });

  if (!matchId || !homeTeam || !awayTeam || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: matchId, homeTeam, awayTeam, action'
    });
  }

  const matchIdStr = String(matchId); // Convert to string to match your frontend
  
  let update;
  let message;
  let responseAction;

  if (action === 'follow') {
    update = {
      $addToSet: {
        followedMatches: { 
          matchId: matchIdStr, 
          homeTeam, 
          awayTeam,
          sport: sport || 'Unknown',
          league: league || 'Unknown',
          venue: venue || 'Unknown',
          time: time ? new Date(time) : new Date(),
          followedAt: new Date()
        }
      }
    };
    message = `You are now following ${homeTeam} vs ${awayTeam}`;
    responseAction = 'followed';
  } else if (action === 'unfollow') {
    update = {
      $pull: {
        followedMatches: { matchId: matchIdStr }
      }
    };
    message = `You have unfollowed ${homeTeam} vs ${awayTeam}`;
    responseAction = 'unfollowed';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "follow" or "unfollow"'
    });
  }

  try {
    const result = await User.updateOne(
      { _id: req.session.user.id },
      update
    );

    console.log('📊 Follow match update result:', result);

    if (result.matchedCount === 0) {
      console.log('❌ User not found during follow match update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Match ${action}ed successfully. Modified: ${result.modifiedCount}`);

    res.json({
      success: true,
      message,
      action: responseAction,
      modified: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('❌ Follow match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating match follow status',
      error: error.message
    });
  }
});

// Enhanced Set/Remove Reminder endpoint
app.post('/api/user/set-reminder', async (req, res) => {
  console.log('🔔 Set reminder request received:', req.body);
  
  if (!req.session.user) {
    console.log('⚠️ No user session found');
    return res.status(401).json({
      success: false,
      message: 'Please log in to set reminders'
    });
  }

  const { matchId, homeTeam, awayTeam, sport, league, venue, time, action } = req.body;

  console.log('📋 Reminder request details:', {
    sessionUser: req.session.user,
    matchId,
    homeTeam,
    awayTeam,
    action
  });

  if (!matchId || !homeTeam || !awayTeam || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: matchId, homeTeam, awayTeam, action'
    });
  }

  const matchIdStr = String(matchId);
  
  let update;
  let message;
  let responseAction;

  if (action === 'add') {
    update = {
      $addToSet: {
        matchReminders: { 
          matchId: matchIdStr, 
          homeTeam, 
          awayTeam,
          sport: sport || 'Unknown',
          league: league || 'Unknown',
          venue: venue || 'Unknown',
          time: time ? new Date(time) : new Date(),
          remindedAt: new Date()
        }
      }
    };
    message = `Reminder set for ${homeTeam} vs ${awayTeam}`;
    responseAction = 'reminder_set';
  } else if (action === 'remove') {
    update = {
      $pull: {
        matchReminders: { matchId: matchIdStr }
      }
    };
    message = `Reminder removed for ${homeTeam} vs ${awayTeam}`;
    responseAction = 'reminder_removed';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "add" or "remove"'
    });
  }

  try {
    const result = await User.updateOne(
      { _id: req.session.user.id },
      update
    );

    console.log('📊 Reminder update result:', result);

    if (result.matchedCount === 0) {
      console.log('❌ User not found during reminder update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Reminder ${action}ed successfully. Modified: ${result.modifiedCount}`);

    res.json({
      success: true,
      message,
      action: responseAction,
      modified: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('❌ Set reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating reminder',
      error: error.message
    });
  }
});

// Follow/Unfollow Player endpoint
app.post('/api/user/follow-player', async (req, res) => {
  console.log('🔔 Follow player request received:', req.body);
  
  if (!req.session.user) {
    console.log('⚠️ No user session found');
    return res.status(401).json({
      success: false,
      message: 'Please log in to follow players'
    });
  }

  const { playerId, playerName, sport, position, team, nationality, image, action } = req.body;

  console.log('📋 Follow player request details:', {
    sessionUser: req.session.user,
    playerId,
    playerName,
    action
  });

  if (!playerId || !playerName || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: playerId, playerName, action'
    });
  }

  const playerIdStr = String(playerId);
  
  let update;
  let message;
  let responseAction;

  if (action === 'follow') {
    update = {
      $addToSet: {
        followedPlayers: { 
          playerId: playerIdStr, 
          playerName, 
          sport: sport || 'Unknown',
          position: position || 'Unknown',
          team: team || 'Unknown',
          nationality: nationality || 'Unknown',
          image: image || '',
          followedAt: new Date()
        }
      }
    };
    message = `You are now following ${playerName}`;
    responseAction = 'followed';
  } else if (action === 'unfollow') {
    update = {
      $pull: {
        followedPlayers: { playerId: playerIdStr }
      }
    };
    message = `You have unfollowed ${playerName}`;
    responseAction = 'unfollowed';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "follow" or "unfollow"'
    });
  }

  try {
    const result = await User.updateOne(
      { _id: req.session.user.id },
      update
    );

    console.log('📊 Follow player update result:', result);

    if (result.matchedCount === 0) {
      console.log('❌ User not found during follow player update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Player ${action}ed successfully. Modified: ${result.modifiedCount}`);

    res.json({
      success: true,
      message,
      action: responseAction,
      modified: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('❌ Follow player error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating player follow status',
      error: error.message
    });
  }
});

// ENHANCED: Follow/Unfollow Sport endpoint
app.post('/api/user/follow-sport', async (req, res) => {
  console.log('🔔 Follow sport request received:', req.body);
  
  if (!req.session.user) {
    console.log('⚠️ No user session found');
    return res.status(401).json({
      success: false,
      message: 'Please log in to follow sports'
    });
  }

  const { sportId, sportName, category, icon, description, popularity, action } = req.body;

  console.log('📋 Follow sport request details:', {
    sessionUser: req.session.user,
    sportId,
    sportName,
    action
  });

  if (!sportId || !sportName || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: sportId, sportName, action'
    });
  }

  const sportIdStr = String(sportId);
  
  let update;
  let message;
  let responseAction;

  if (action === 'follow') {
    update = {
      $addToSet: {
        followedSports: { 
          sportId: sportIdStr, 
          sportName, 
          category: category || 'General',
          icon: icon || '🏆',
          description: description || '',
          popularity: popularity || 1,
          followedAt: new Date()
        }
      }
    };
    message = `You are now following ${sportName}`;
    responseAction = 'followed';
  } else if (action === 'unfollow') {
    update = {
      $pull: {
        followedSports: { sportId: sportIdStr }
      }
    };
    message = `You have unfollowed ${sportName}`;
    responseAction = 'unfollowed';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "follow" or "unfollow"'
    });
  }

  try {
    const result = await User.updateOne(
      { _id: req.session.user.id },
      update
    );

    console.log('📊 Follow sport update result:', result);

    if (result.matchedCount === 0) {
      console.log('❌ User not found during follow sport update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Sport ${action}ed successfully. Modified: ${result.modifiedCount}`);

    res.json({
      success: true,
      message,
      action: responseAction,
      modified: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('❌ Follow sport error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating sport follow status',
      error: error.message
    });
  }
});

// Get user's followed teams
app.get('/api/user/followed-teams', async (req, res) => {
  try {
    console.log('🔔 Get followed teams request');
    
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        followedTeams: []
      });
    }

    const user = await User.findById(req.session.user.id).select('followedTeams');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        followedTeams: []
      });
    }

    res.json({
      success: true,
      followedTeams: user.followedTeams || []
    });

  } catch (error) {
    console.error('❌ Get followed teams error:', error);
    res.json({
      success: false,
      message: 'Error fetching followed teams',
      followedTeams: []
    });
  }
});

// Get user's followed matches
app.get('/api/user/followed-matches', async (req, res) => {
  try {
    console.log('🔔 Get followed matches request');
    
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        followedMatches: []
      });
    }

    const user = await User.findById(req.session.user.id).select('followedMatches');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        followedMatches: []
      });
    }

    res.json({
      success: true,
      followedMatches: user.followedMatches || []
    });

  } catch (error) {
    console.error('❌ Get followed matches error:', error);
    res.json({
      success: false,
      message: 'Error fetching followed matches',
      followedMatches: []
    });
  }
});

// Get user's reminded matches
app.get('/api/user/reminded-matches', async (req, res) => {
  try {
    console.log('🔔 Get reminded matches request');
    
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        remindedMatches: []
      });
    }

    const user = await User.findById(req.session.user.id).select('matchReminders');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        remindedMatches: []
      });
    }

    res.json({
      success: true,
      remindedMatches: user.matchReminders || []
    });

  } catch (error) {
    console.error('❌ Get reminded matches error:', error);
    res.json({
      success: false,
      message: 'Error fetching reminded matches',
      remindedMatches: []
    });
  }
});

// Get user's followed players
app.get('/api/user/followed-players', async (req, res) => {
  try {
    console.log('🔔 Get followed players request');
    
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        followedPlayers: []
      });
    }

    const user = await User.findById(req.session.user.id).select('followedPlayers');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        followedPlayers: []
      });
    }

    res.json({
      success: true,
      followedPlayers: user.followedPlayers || []
    });

  } catch (error) {
    console.error('❌ Get followed players error:', error);
    res.json({
      success: false,
      message: 'Error fetching followed players',
      followedPlayers: []
    });
  }
});

// ENHANCED: Get user's followed sports
app.get('/api/user/followed-sports', async (req, res) => {
  try {
    console.log('🔔 Get followed sports request');
    
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        followedSports: []
      });
    }

    const user = await User.findById(req.session.user.id).select('followedSports');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        followedSports: []
      });
    }

    res.json({
      success: true,
      followedSports: user.followedSports || []
    });

  } catch (error) {
    console.error('❌ Get followed sports error:', error);
    res.json({
      success: false,
      message: 'Error fetching followed sports',
      followedSports: []
    });
  }
});

// Get user's reminders (legacy endpoint - keep for compatibility)
app.get('/api/user/reminders', async (req, res) => {
  try {
    console.log('🔔 Get reminders request');
    
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        reminders: []
      });
    }

    const user = await User.findById(req.session.user.id).select('matchReminders');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        reminders: []
      });
    }

    res.json({
      success: true,
      reminders: user.matchReminders || []
    });

  } catch (error) {
    console.error('❌ Get reminders error:', error);
    res.json({
      success: false,
      message: 'Error fetching reminders',
      reminders: []
    });
  }
});

// NEW: Get all available sports
app.get('/api/sports', async (req, res) => {
  try {
    const sports = [
      {
        sportId: 'football',
        sportName: 'Football',
        category: 'Team Sport',
        icon: '⚽',
        description: 'The world\'s most popular sport played between two teams of eleven players.',
        popularity: 95
      },
      {
        sportId: 'cricket',
        sportName: 'Cricket',
        category: 'Team Sport',
        icon: '🏏',
        description: 'Bat-and-ball game played between two teams of eleven players.',
        popularity: 85
      },
      {
        sportId: 'basketball',
        sportName: 'Basketball',
        category: 'Team Sport',
        icon: '🏀',
        description: 'Fast-paced team sport played on a rectangular court.',
        popularity: 90
      },
      {
        sportId: 'tennis',
        sportName: 'Tennis',
        category: 'Racquet Sport',
        icon: '🎾',
        description: 'Racquet sport that can be played individually or between two teams.',
        popularity: 80
      },
      {
        sportId: 'baseball',
        sportName: 'Baseball',
        category: 'Team Sport',
        icon: '⚾',
        description: 'Bat-and-ball sport played between two teams of nine players.',
        popularity: 75
      },
      {
        sportId: 'hockey',
        sportName: 'Hockey',
        category: 'Team Sport',
        icon: '🏒',
        description: 'Fast-paced sport played on ice or field with sticks and a puck/ball.',
        popularity: 70
      },
      {
        sportId: 'golf',
        sportName: 'Golf',
        category: 'Individual Sport',
        icon: '⛳',
        description: 'Precision club-and-ball sport where players use clubs to hit balls.',
        popularity: 65
      },
      {
        sportId: 'rugby',
        sportName: 'Rugby',
        category: 'Team Sport',
        icon: '🏉',
        description: 'Contact team sport that originated in England in the first half of the 19th century.',
        popularity: 60
      },
      {
        sportId: 'formula1',
        sportName: 'Formula 1',
        category: 'Motorsport',
        icon: '🏎️',
        description: 'Highest class of international auto racing for single-seater formula racing cars.',
        popularity: 85
      },
      {
        sportId: 'boxing',
        sportName: 'Boxing',
        category: 'Combat Sport',
        icon: '🥊',
        description: 'Combat sport in which two people throw punches at each other.',
        popularity: 70
      },
      {
        sportId: 'mma',
        sportName: 'MMA',
        category: 'Combat Sport',
        icon: '🥋',
        description: 'Full-contact combat sport based on striking, grappling and ground fighting.',
        popularity: 75
      },
      {
        sportId: 'olympics',
        sportName: 'Olympics',
        category: 'Multi-Sport',
        icon: '🏅',
        description: 'International sporting events featuring summer and winter sports competitions.',
        popularity: 95
      }
    ];

    res.json({
      success: true,
      sports
    });

  } catch (error) {
    console.error('❌ Get sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sports',
      sports: []
    });
  }
});

// SPA fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Database: ${MONGODB_URI}`);
});