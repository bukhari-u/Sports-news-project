require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Import ALL models
const User = require('./models/User');
const News = require('./models/News');
const LiveEvent = require('./models/LiveEvent');
const Video = require('./models/Video');
const Fixture = require('./models/Fixture');
const Score = require('./models/Score');
const Player = require('./models/Player');
const Team = require('./models/Team');
const LeagueTable = require('./models/LeagueTable');

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

// NEW: Sports-specific data endpoints
app.get('/api/sports/:sport/videos', async (req, res) => {
  try {
    const { sport } = req.params;
    const { type, category, limit = 12 } = req.query;
    
    let query = { sport, isActive: true };
    
    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;

    const videos = await Video.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Error fetching sport videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sport videos'
    });
  }
});

app.get('/api/sports/:sport/teams', async (req, res) => {
  try {
    const { sport } = req.params;
    const { league, featured } = req.query;
    
    let query = { sport, isActive: true };
    
    if (league && league !== 'all') query.league = league;
    if (featured) query.featured = featured === 'true';

    const teams = await Team.find(query).sort({ 'stats.overall.position': 1 });

    res.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error fetching sport teams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sport teams'
    });
  }
});

app.get('/api/sports/:sport/fixtures', async (req, res) => {
  try {
    const { sport } = req.params;
    const { status, league, date } = req.query;
    
    let query = { sport, isActive: true };
    
    if (status && status !== 'all') query.status = status;
    if (league && league !== 'all') query.league = league;
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDate };
    }

    const fixtures = await Fixture.find(query).sort({ date: 1, time: 1 });

    res.json({
      success: true,
      fixtures
    });
  } catch (error) {
    console.error('Error fetching sport fixtures:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sport fixtures'
    });
  }
});

app.get('/api/sports/:sport/scores', async (req, res) => {
  try {
    const { sport } = req.params;
    const { status, league } = req.query;
    
    let query = { sport };
    
    if (status && status !== 'all') query.status = status;
    if (league && league !== 'all') query.league = league;

    const scores = await Score.find(query).sort({ time: -1 });

    res.json({
      success: true,
      scores
    });
  } catch (error) {
    console.error('Error fetching sport scores:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sport scores'
    });
  }
});

app.get('/api/sports/:sport/standings', async (req, res) => {
  try {
    const { sport } = req.params;
    const { league } = req.query;
    
    let query = { sport, isActive: true };
    
    if (league && league !== 'all') query.leagueName = new RegExp(league, 'i');

    const standings = await LeagueTable.find(query);

    res.json({
      success: true,
      standings
    });
  } catch (error) {
    console.error('Error fetching sport standings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sport standings'
    });
  }
});

// Enhanced video search with sport filtering
app.get('/api/videos/search', async (req, res) => {
  try {
    const { q, sport, type, category, page = 1, limit = 12 } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    if (sport && sport !== 'all') query.sport = sport;
    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;

    const skip = (page - 1) * limit;
    
    const videos = await Video.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Video.countDocuments(query);
    const hasMore = total > (skip + videos.length);

    res.json({
      success: true,
      videos,
      total,
      hasMore,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching videos'
    });
  }
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

// ========== FIXTURES API ROUTES ==========
app.get('/api/fixtures', async (req, res) => {
  try {
    const { 
      date, 
      sport, 
      league, 
      status, 
      team, 
      limit = 50,
      featured,
      upcoming
    } = req.query;
    
    let query = { isActive: true };
    
    // Build filter query
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDate };
    }
    
    if (sport && sport !== 'All') query.sport = sport;
    if (league && league !== 'All') query.league = league;
    if (status && status !== 'All') query.status = status;
    if (featured) query.isFeatured = featured === 'true';
    
    if (team) {
      query.$or = [
        { 'homeTeam.name': { $regex: team, $options: 'i' } },
        { 'awayTeam.name': { $regex: team, $options: 'i' } }
      ];
    }
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const fixtures = await Fixture.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      fixtures
    });
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fixtures'
    });
  }
});

// UPDATED: Today's fixtures endpoint with proper date filtering
app.get('/api/fixtures/today', async (req, res) => {
  try {
    const { limit = 20, sport } = req.query;
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date (start of next day)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = { 
      date: { $gte: today, $lt: tomorrow },
      isActive: true 
    };
    
    if (sport && sport !== 'All') query.sport = sport;

    const fixtures = await Fixture.find(query)
      .sort({ time: 1, date: 1 })
      .limit(parseInt(limit));

    console.log('Today\'s fixtures query:', {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
      sport,
      fixturesCount: fixtures.length
    });

    res.json({
      success: true,
      fixtures
    });
  } catch (error) {
    console.error('Error fetching today\'s fixtures:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s fixtures'
    });
  }
});

app.get('/api/fixtures/upcoming', async (req, res) => {
  try {
    const { limit = 20, sport } = req.query;
    
    let query = { 
      date: { $gte: new Date() },
      isActive: true 
    };
    
    if (sport && sport !== 'All') query.sport = sport;

    const fixtures = await Fixture.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      fixtures
    });
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming fixtures'
    });
  }
});

app.get('/api/fixtures/featured', async (req, res) => {
  try {
    const fixtures = await Fixture.find({
      isFeatured: true,
      isActive: true,
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .limit(10);

    res.json({
      success: true,
      fixtures
    });
  } catch (error) {
    console.error('Error fetching featured fixtures:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured fixtures'
    });
  }
});

app.get('/api/fixtures/:id', async (req, res) => {
  try {
    const fixture = await Fixture.findOne({ 
      fixtureId: req.params.id,
      isActive: true 
    });
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }
    
    res.json({
      success: true,
      fixture
    });
  } catch (error) {
    console.error('Error fetching fixture:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fixture'
    });
  }
});

// Search fixtures
app.get('/api/search/fixtures', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.json({
        success: true,
        fixtures: []
      });
    }

    const searchRegex = new RegExp(query, 'i');
    
    const fixtures = await Fixture.find({
      $or: [
        { 'homeTeam.name': searchRegex },
        { 'awayTeam.name': searchRegex },
        { league: searchRegex },
        { sport: searchRegex },
        { venue: searchRegex }
      ],
      isActive: true
    })
    .sort({ date: 1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      fixtures
    });
  } catch (error) {
    console.error('Error searching fixtures:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching fixtures'
    });
  }
});

// Video API Routes
app.get('/api/videos', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      sport, 
      type, 
      featured,
      search 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Build filter query
    if (category && category !== 'all') query.category = category;
    if (sport && sport !== 'all') query.sport = sport;
    if (type && type !== 'all') query.type = type;
    if (featured) query.featured = featured === 'true';
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const videos = await Video.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Video.countDocuments(query);
    const hasMore = total > (skip + videos.length);

    res.json({
      success: true,
      videos,
      hasMore,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos'
    });
  }
});

app.get('/api/videos/featured', async (req, res) => {
  try {
    const featuredVideo = await Video.findOne({ featured: true });
    
    res.json({
      success: true,
      video: featuredVideo
    });
  } catch (error) {
    console.error('Error fetching featured video:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured video'
    });
  }
});

app.get('/api/videos/live', async (req, res) => {
  try {
    const liveStreams = await Video.find({ 
      type: 'live', 
      status: 'live' 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      liveStreams
    });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live streams'
    });
  }
});

app.get('/api/videos/categories', async (req, res) => {
  try {
    const categories = await Video.distinct('category');
    const sports = await Video.distinct('sport');
    
    res.json({
      success: true,
      categories,
      sports
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findOne({ videoId: req.params.id });
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    res.json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video'
    });
  }
});

// Track video watch (for user history)
app.post('/api/user/track-watch', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to track watch history'
      });
    }

    const { videoId, title, duration } = req.body;

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add to watched videos (avoid duplicates)
    const watchedVideo = {
      videoId,
      title,
      duration,
      watchedAt: new Date()
    };

    // Remove if already exists to update the timestamp
    user.watchedVideos = user.watchedVideos.filter(v => v.videoId !== videoId);
    user.watchedVideos.push(watchedVideo);

    // Keep only last 50 watched videos
    if (user.watchedVideos.length > 50) {
      user.watchedVideos = user.watchedVideos.slice(-50);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Watch history updated'
    });

  } catch (error) {
    console.error('Error tracking watch:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking watch history'
    });
  }
});

// Get user's watch history
app.get('/api/user/watch-history', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        watchHistory: []
      });
    }

    const user = await User.findById(req.session.user.id).select('watchedVideos');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        watchHistory: []
      });
    }

    res.json({
      success: true,
      watchHistory: user.watchedVideos || []
    });

  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.json({
      success: false,
      message: 'Error fetching watch history',
      watchHistory: []
    });
  }
});

// Sports Data API Endpoints
app.get('/api/news', async (req, res) => {
  try {
    const { page = 1, limit = 12, sport, league, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Build filter query
    if (sport && sport !== 'All') query.sport = sport;
    if (league && league !== 'All') query.league = league;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { 'teams.home': { $regex: search, $options: 'i' } },
        { 'teams.away': { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const news = await News.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await News.countDocuments(query);
    const hasMore = total > (skip + news.length);

    res.json({
      success: true,
      news,
      hasMore,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news'
    });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    res.json({
      success: true,
      news
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news article'
    });
  }
});

app.get('/api/live-events', async (req, res) => {
  try {
    const liveEvents = await LiveEvent.find({ status: 'Live' })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      liveEvents
    });
  } catch (error) {
    console.error('Error fetching live events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live events'
    });
  }
});

/// Enhanced Scores API Endpoints
app.get('/api/scores', async (req, res) => {
  try {
    const { status, sport, league, limit = 50 } = req.query;
    
    let query = { isActive: true };
    
    if (status && status !== 'All') query.status = status.toLowerCase();
    if (sport && sport !== 'All') query.sport = sport;
    if (league && league !== 'All') query.league = new RegExp(league, 'i');

    const scores = await Score.find(query)
      .sort({ time: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      scores
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scores'
    });
  }
});

app.get('/api/scores/live', async (req, res) => {
  try {
    const scores = await Score.find({ 
      status: 'live',
      isActive: true 
    }).sort({ time: -1 });
    
    res.json({
      success: true,
      scores
    });
  } catch (error) {
    console.error('Error fetching live scores:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live scores'
    });
  }
});

app.get('/api/scores/results', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const scores = await Score.find({ 
      status: 'finished',
      isActive: true,
      time: { $gte: today }
    }).sort({ time: -1 });
    
    res.json({
      success: true,
      scores
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching results'
    });
  }
});

app.get('/api/scores/upcoming', async (req, res) => {
  try {
    const scores = await Score.find({ 
      status: 'upcoming',
      isActive: true 
    }).sort({ time: 1 });
    
    res.json({
      success: true,
      scores
    });
  } catch (error) {
    console.error('Error fetching upcoming scores:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming scores'
    });
  }
});

app.get('/api/scores/:matchId', async (req, res) => {
  try {
    const score = await Score.findOne({ 
      matchId: req.params.matchId,
      isActive: true 
    });
    
    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score not found'
      });
    }
    
    res.json({
      success: true,
      score
    });
  } catch (error) {
    console.error('Error fetching score:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching score'
    });
  }
});

// Search scores
app.get('/api/scores/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const scores = await Score.find({
      $or: [
        { 'teams.home.name': { $regex: query, $options: 'i' } },
        { 'teams.away.name': { $regex: query, $options: 'i' } },
        { league: { $regex: query, $options: 'i' } },
        { sport: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ time: -1 })
    .limit(10);
    
    // If no search results, return sample data
    if (scores.length === 0) {
      const sampleScores = getSampleSearchResults(query);
      return res.json({
        success: true,
        scores: sampleScores
      });
    }
    
    res.json({
      success: true,
      scores
    });
  } catch (error) {
    console.error('Error searching scores:', error);
    // Return sample data on error
    const sampleScores = getSampleSearchResults(req.params.query);
    res.json({
      success: true,
      scores: sampleScores
    });
  }
});

// Teams API Routes
app.get('/api/teams', async (req, res) => {
  try {
    const { sport, league, country, featured, search } = req.query;
    
    let filter = { isActive: true };
    
    // Build filter query
    if (sport && sport !== 'all' && sport !== 'All') filter.sport = sport;
    if (league && league !== 'All') filter.league = league;
    if (country && country !== 'All') filter.country = country;
    if (featured) filter.featured = featured === 'true';
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { league: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { keyPlayers: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const teams = await Team.find(filter).sort({ 'stats.overall.position': 1, name: 1 });
    
    res.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams'
    });
  }
});

app.get('/api/teams/featured', async (req, res) => {
  try {
    const teams = await Team.find({ 
      featured: true, 
      isActive: true 
    }).limit(10);
    
    res.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error fetching featured teams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured teams'
    });
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findOne({ 
      teamId: parseInt(req.params.id), 
      isActive: true 
    });
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    res.json({
      success: true,
      team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team'
    });
  }
});

// League Tables API Routes
app.get('/api/league-tables', async (req, res) => {
  try {
    const tables = await LeagueTable.find({ isActive: true });
    
    res.json({
      success: true,
      tables
    });
  } catch (error) {
    console.error('Error fetching league tables:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching league tables'
    });
  }
});

app.get('/api/league-tables/:league', async (req, res) => {
  try {
    const table = await LeagueTable.findOne({ 
      leagueName: req.params.league, 
      isActive: true 
    });
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'League table not found'
      });
    }
    
    res.json({
      success: true,
      table
    });
  } catch (error) {
    console.error('Error fetching league table:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching league table'
    });
  }
});

// Players API Routes
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find({ isActive: true });
    res.json({ success: true, players });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ success: false, message: 'Error fetching players' });
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

// Follow/Unfollow Sport endpoint
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

// Get all available sports
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

// Get user's followed sports
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

  const matchIdStr = String(matchId);
  
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

// Sample Data Functions
function getSampleScores(status) {
  const allScores = [
    ...getSampleLiveScores(),
    ...getSampleResults(),
    ...getSampleUpcomingScores()
  ];
  
  if (!status || status === 'All') return allScores;
  
  return allScores.filter(score => score.status === status.toLowerCase());
}

function getSampleLiveScores() {
  return [
    {
      matchId: '101',
      sport: 'Football',
      league: 'Premier League',
      teams: {
        home: { name: 'Manchester City', logo: 'MC', score: '2' },
        away: { name: 'Liverpool', logo: 'LIV', score: '1' }
      },
      status: 'live',
      minute: '75',
      venue: 'Etihad Stadium',
      time: new Date(),
      competition: 'Premier League • Etihad Stadium',
      matchDetails: {
        venue: 'Etihad Stadium',
        time: 'Live - 2nd Half'
      },
      stats: {
        possession: '58% - 42%',
        shots: '14 - 8',
        shotsOnTarget: '6 - 3',
        corners: '5 - 2',
        fouls: '12 - 15',
        yellowCards: '2 - 3',
        redCards: '0 - 0',
        offsides: '1 - 2'
      },
      teamStats: {
        home: {
          name: 'Manchester City',
          shots: 14,
          shotsOnTarget: 6,
          passes: 512,
          passAccuracy: '87%',
          tackles: 18,
          interceptions: 12
        },
        away: {
          name: 'Liverpool',
          shots: 8,
          shotsOnTarget: 3,
          passes: 389,
          passAccuracy: '79%',
          tackles: 22,
          interceptions: 15
        }
      }
    },
    {
      matchId: '102',
      sport: 'Basketball',
      league: 'NBA',
      teams: {
        home: { name: 'Boston Celtics', logo: 'BOS', score: '95' },
        away: { name: 'LA Lakers', logo: 'LAL', score: '98' }
      },
      status: 'live',
      minute: 'Q4',
      venue: 'TD Garden',
      time: new Date(),
      competition: 'NBA • TD Garden',
      matchDetails: {
        venue: 'TD Garden',
        time: '4:32 remaining'
      }
    }
  ];
}

function getSampleResults() {
  return [
    {
      matchId: '201',
      sport: 'Football',
      league: 'La Liga',
      teams: {
        home: { name: 'Barcelona', logo: 'FCB', score: '1' },
        away: { name: 'Real Madrid', logo: 'RMA', score: '3' }
      },
      status: 'finished',
      venue: 'Camp Nou',
      time: new Date(Date.now() - 86400000),
      competition: 'La Liga • Camp Nou',
      matchDetails: {
        venue: 'Camp Nou',
        time: 'Full Time'
      },
      highlights: {
        videoId: 'ni8PheuLDgs',
        summary: 'Real Madrid secured a convincing 3-1 victory over rivals Barcelona in a thrilling El Clásico encounter.'
      }
    },
    {
      matchId: '202',
      sport: 'Tennis',
      league: 'ATP Finals',
      teams: {
        home: { name: 'Novak Djokovic', logo: 'ND', score: '2' },
        away: { name: 'Carlos Alcaraz', logo: 'CA', score: '1' }
      },
      status: 'finished',
      venue: 'Pala Alpitour',
      time: new Date(Date.now() - 86400000),
      competition: 'ATP Finals • Turin',
      matchDetails: {
        venue: 'Pala Alpitour',
        time: '6-4, 5-7, 6-4'
      }
    }
  ];
}

function getSampleUpcomingScores() {
  return [
    {
      matchId: '301',
      sport: 'Football',
      league: 'Champions League',
      teams: {
        home: { name: 'Bayern Munich', logo: 'BAY', score: '-' },
        away: { name: 'Paris SG', logo: 'PSG', score: '-' }
      },
      status: 'upcoming',
      venue: 'Allianz Arena',
      time: new Date(Date.now() + 3600000),
      competition: 'Champions League • Allianz Arena',
      matchDetails: {
        venue: 'Allianz Arena',
        time: 'Today, 19:45 GMT'
      },
      preview: {
        teams: {
          home: {
            name: 'Bayern Munich',
            coach: 'Thomas Tuchel',
            lineup: [
              { number: 1, name: 'Manuel Neuer', position: 'Goalkeeper' },
              { number: 5, name: 'Benjamin Pavard', position: 'Defender' },
              { number: 2, name: 'Dayot Upamecano', position: 'Defender' },
              { number: 4, name: 'Matthijs de Ligt', position: 'Defender' },
              { number: 19, name: 'Alphonso Davies', position: 'Defender' },
              { number: 6, name: 'Joshua Kimmich', position: 'Midfielder' },
              { number: 8, name: 'Leon Goretzka', position: 'Midfielder' },
              { number: 10, name: 'Leroy Sané', position: 'Forward' },
              { number: 25, name: 'Thomas Müller', position: 'Forward' },
              { number: 7, name: 'Serge Gnabry', position: 'Forward' },
              { number: 9, name: 'Harry Kane', position: 'Forward' }
            ]
          },
          away: {
            name: 'Paris Saint-Germain',
            coach: 'Luis Enrique',
            lineup: [
              { number: 99, name: 'Gianluigi Donnarumma', position: 'Goalkeeper' },
              { number: 2, name: 'Achraf Hakimi', position: 'Defender' },
              { number: 5, name: 'Marquinhos', position: 'Defender' },
              { number: 21, name: 'Lucas Hernández', position: 'Defender' },
              { number: 25, name: 'Nuno Mendes', position: 'Defender' },
              { number: 17, name: 'Vitinha', position: 'Midfielder' },
              { number: 8, name: 'Fabian Ruiz', position: 'Midfielder' },
              { number: 33, name: 'Warren Zaïre-Emery', position: 'Midfielder' },
              { number: 10, name: 'Kylian Mbappé', position: 'Forward' },
              { number: 9, name: 'Gonçalo Ramos', position: 'Forward' },
              { number: 7, name: 'Ousmane Dembélé', position: 'Forward' }
            ]
          }
        }
      }
    }
  ];
}

function getSampleMatch(matchId) {
  const allSamples = [
    ...getSampleLiveScores(),
    ...getSampleResults(),
    ...getSampleUpcomingScores()
  ];
  return allSamples.find(match => match.matchId === matchId);
}

function getSampleSearchResults(query) {
  const allSamples = [
    ...getSampleLiveScores(),
    ...getSampleResults(),
    ...getSampleUpcomingScores()
  ];
  
  if (!query) return allSamples.slice(0, 5);
  
  const lowerQuery = query.toLowerCase();
  return allSamples.filter(score => 
    score.teams.home.name.toLowerCase().includes(lowerQuery) ||
    score.teams.away.name.toLowerCase().includes(lowerQuery) ||
    score.league.toLowerCase().includes(lowerQuery) ||
    score.sport.toLowerCase().includes(lowerQuery)
  ).slice(0, 5);
}

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