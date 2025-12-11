require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

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
const Tournament = require('./models/Tournament');

// Enhanced middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session middleware with better configuration for production
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET || 'sports-app-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

// ========== DYNAMIC FIXTURES GENERATION FUNCTION ==========
function generateDynamicFixtures(startDate, endDate, count) {
  const sports = [
    { sport: 'Football', leagues: ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'] },
    { sport: 'Basketball', leagues: ['NBA', 'EuroLeague', 'CBA'] },
    { sport: 'Cricket', leagues: ['IPL', 'Big Bash', 'County Championship'] },
    { sport: 'Tennis', leagues: ['ATP', 'WTA', 'Grand Slam'] },
    { sport: 'Baseball', leagues: ['MLB', 'NPB', 'KBO'] },
    { sport: 'Rugby', leagues: ['Premiership', 'Super Rugby', 'Six Nations'] },
    { sport: 'Hockey', leagues: ['NHL', 'KHL', 'SHL'] },
    { sport: 'American Football', leagues: ['NFL', 'CFL', 'XFL'] }
  ];

  const teams = {
    Football: [
      { home: 'Manchester United', away: 'Liverpool', stadium: 'Old Trafford' },
      { home: 'Real Madrid', away: 'Barcelona', stadium: 'Santiago Bernabéu' },
      { home: 'Bayern Munich', away: 'Borussia Dortmund', stadium: 'Allianz Arena' },
      { home: 'AC Milan', away: 'Inter Milan', stadium: 'San Siro' },
      { home: 'Paris Saint-Germain', away: 'Marseille', stadium: 'Parc des Princes' },
      { home: 'Arsenal', away: 'Chelsea', stadium: 'Emirates Stadium' },
      { home: 'Manchester City', away: 'Tottenham', stadium: 'Etihad Stadium' },
      { home: 'Juventus', away: 'AS Roma', stadium: 'Allianz Stadium' },
      { home: 'Atlético Madrid', away: 'Sevilla', stadium: 'Wanda Metropolitano' },
      { home: 'Borussia Mönchengladbach', away: 'Bayer Leverkusen', stadium: 'Borussia-Park' }
    ],
    Basketball: [
      { home: 'LA Lakers', away: 'Boston Celtics', stadium: 'Staples Center' },
      { home: 'Golden State Warriors', away: 'Chicago Bulls', stadium: 'Chase Center' },
      { home: 'Miami Heat', away: 'New York Knicks', stadium: 'FTX Arena' },
      { home: 'Brooklyn Nets', away: 'Philadelphia 76ers', stadium: 'Barclays Center' },
      { home: 'Toronto Raptors', away: 'Milwaukee Bucks', stadium: 'Scotiabank Arena' },
      { home: 'Dallas Mavericks', away: 'Phoenix Suns', stadium: 'American Airlines Center' }
    ],
    Cricket: [
      { home: 'India', away: 'Pakistan', stadium: 'Eden Gardens' },
      { home: 'Australia', away: 'England', stadium: 'Melbourne Cricket Ground' },
      { home: 'South Africa', away: 'New Zealand', stadium: 'Newlands Cricket Ground' },
      { home: 'West Indies', away: 'Sri Lanka', stadium: 'Kensington Oval' },
      { home: 'Bangladesh', away: 'Afghanistan', stadium: 'Sher-e-Bangla National Stadium' }
    ],
    Tennis: [
      { home: 'Roger Federer', away: 'Rafael Nadal', stadium: 'Centre Court' },
      { home: 'Novak Djokovic', away: 'Andy Murray', stadium: 'Arthur Ashe Stadium' },
      { home: 'Carlos Alcaraz', away: 'Daniil Medvedev', stadium: 'Rod Laver Arena' },
      { home: 'Serena Williams', away: 'Naomi Osaka', stadium: 'Philippe Chatrier' },
      { home: 'Stefanos Tsitsipas', away: 'Alexander Zverev', stadium: 'O2 Arena' }
    ],
    Baseball: [
      { home: 'New York Yankees', away: 'Boston Red Sox', stadium: 'Yankee Stadium' },
      { home: 'Los Angeles Dodgers', away: 'San Francisco Giants', stadium: 'Dodger Stadium' },
      { home: 'Chicago Cubs', away: 'St. Louis Cardinals', stadium: 'Wrigley Field' },
      { home: 'Houston Astros', away: 'Texas Rangers', stadium: 'Minute Maid Park' },
      { home: 'Atlanta Braves', away: 'New York Mets', stadium: 'Truist Park' }
    ],
    Rugby: [
      { home: 'New Zealand', away: 'South Africa', stadium: 'Eden Park' },
      { home: 'England', away: 'Australia', stadium: 'Twickenham' },
      { home: 'Ireland', away: 'Wales', stadium: 'Aviva Stadium' },
      { home: 'France', away: 'Scotland', stadium: 'Stade de France' },
      { home: 'Argentina', away: 'Italy', stadium: 'José Amalfitani Stadium' }
    ],
    Hockey: [
      { home: 'Toronto Maple Leafs', away: 'Montreal Canadiens', stadium: 'Scotiabank Arena' },
      { home: 'New York Rangers', away: 'Boston Bruins', stadium: 'Madison Square Garden' },
      { home: 'Chicago Blackhawks', away: 'Detroit Red Wings', stadium: 'United Center' },
      { home: 'Edmonton Oilers', away: 'Calgary Flames', stadium: 'Rogers Place' },
      { home: 'Pittsburgh Penguins', away: 'Washington Capitals', stadium: 'PPG Paints Arena' }
    ],
    'American Football': [
      { home: 'Kansas City Chiefs', away: 'Philadelphia Eagles', stadium: 'Arrowhead Stadium' },
      { home: 'San Francisco 49ers', away: 'Dallas Cowboys', stadium: 'Levi\'s Stadium' },
      { home: 'Green Bay Packers', away: 'Chicago Bears', stadium: 'Lambeau Field' },
      { home: 'Buffalo Bills', away: 'Miami Dolphins', stadium: 'Highmark Stadium' },
      { home: 'Baltimore Ravens', away: 'Cincinnati Bengals', stadium: 'M&T Bank Stadium' }
    ]
  };

  const timeSlots = ['12:00', '14:30', '15:00', '17:30', '19:45', '20:00', '21:00', '22:00'];
  const fixtures = [];

  for (let i = 0; i < count; i++) {
    // Random date within range
    const timeRange = endDate.getTime() - startDate.getTime();
    const randomTime = startDate.getTime() + Math.random() * timeRange;
    const fixtureDate = new Date(randomTime);
    
    // Random sport
    const sportData = sports[Math.floor(Math.random() * sports.length)];
    const sportTeams = teams[sportData.sport] || teams['Football'];
    const teamMatch = sportTeams[Math.floor(Math.random() * sportTeams.length)];
    const league = sportData.leagues[Math.floor(Math.random() * sportData.leagues.length)];
    
    // Random time
    const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    
    // Set exact time on fixture date
    const [hours, minutes] = time.split(':').map(Number);
    const exactDate = new Date(fixtureDate);
    exactDate.setHours(hours, minutes, 0, 0);
    
    // Generate fixture ID
    const fixtureId = `FIX_${exactDate.getTime()}_${i}`;
    
    // Random status
    const statusOptions = ['Scheduled', 'Live', 'Finished', 'Postponed', 'Cancelled'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // Determine if featured (first 20% are featured)
    const isFeatured = i < Math.floor(count * 0.2);
    
    fixtures.push({
      fixtureId: fixtureId,
      sport: sportData.sport,
      league: league,
      homeTeam: { 
        name: teamMatch.home, 
        shortCode: teamMatch.home.substring(0, 3).toUpperCase(),
        logo: teamMatch.home.substring(0, 3).toUpperCase()
      },
      awayTeam: { 
        name: teamMatch.away, 
        shortCode: teamMatch.away.substring(0, 3).toUpperCase(),
        logo: teamMatch.away.substring(0, 3).toUpperCase()
      },
      date: exactDate,
      time: time,
      venue: teamMatch.stadium || `${teamMatch.home} Stadium`,
      status: status,
      round: ['Group Stage', 'Regular Season', 'Quarter Final', 'Semi Final', 'Final'][Math.floor(Math.random() * 5)],
      competition: league,
      isFeatured: isFeatured,
      isActive: true
    });
  }
  
  // Sort by date
  fixtures.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return fixtures;
}

// ========== ADMIN-ONLY MIDDLEWARE ==========
const requireAdmin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Please log in to access admin panel'
        });
    }

    if (!req.session.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin privileges required'
        });
    }

    next();
};

// ========== ADMIN LOGIN ENDPOINT ==========
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password, adminCode } = req.body;

        if (!email || !password || !adminCode) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and admin code are required'
            });
        }

        // Verify admin code (use environment variable for security)
        const validAdminCode = process.env.ADMIN_ACCESS_CODE || 'ADMIN123';
        
        if (adminCode !== validAdminCode) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin access code'
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

        // Check if user is admin
        if (!user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Account does not have admin privileges'
            });
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        };

        console.log(`✅ Admin login successful: ${user.email}`);

        res.json({
            success: true,
            message: 'Admin login successful!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error('❌ Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during admin login'
        });
    }
});

// ========== FIXED SPORTS-SPECIFIC ENDPOINTS ==========

// Get videos for specific sport - FIXED
app.get('/api/sports/:sport/videos', async (req, res) => {
  try {
    const { sport } = req.params;
    const { type, category, limit = 12, featured } = req.query;
    
    console.log(`Fetching videos for sport: ${sport}`);
    
    let query = { 
      $or: [
        { sport: new RegExp(sport, 'i') },
        { category: new RegExp(sport, 'i') },
        { tags: { $in: [new RegExp(sport, 'i')] } }
      ],
      isActive: true 
    };
    
    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;
    if (featured) query.featured = featured === 'true';

    const videos = await Video.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit));

    console.log(`Found ${videos.length} videos for ${sport}`);

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

// Get teams for specific sport - FIXED
app.get('/api/sports/:sport/teams', async (req, res) => {
  try {
    const { sport } = req.params;
    const { league, featured, limit = 10 } = req.query;
    
    console.log(`Fetching teams for sport: ${sport}`);
    
    let query = { 
      sport: new RegExp(sport, 'i'),
      isActive: true 
    };
    
    if (league && league !== 'all') query.league = new RegExp(league, 'i');
    if (featured) query.featured = featured === 'true';

    const teams = await Team.find(query)
      .sort({ 'stats.overall.position': 1 })
      .limit(parseInt(limit));

    console.log(`Found ${teams.length} teams for ${sport}`);

    // If no teams found, return sample data
    if (teams.length === 0) {
      const sampleTeams = getSampleTeams().filter(team => 
        team.sport.toLowerCase().includes(sport.toLowerCase())
      ).slice(0, limit);
      
      return res.json({
        success: true,
        teams: sampleTeams,
        isSampleData: true
      });
    }

    res.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error fetching sport teams:', error);
    const sampleTeams = getSampleTeams().filter(team => 
      team.sport.toLowerCase().includes(req.params.sport.toLowerCase())
    ).slice(0, 10);
    
    res.json({
      success: true,
      teams: sampleTeams,
      isSampleData: true
    });
  }
});

// Get standings for specific sport - FIXED
app.get('/api/sports/:sport/standings', async (req, res) => {
  try {
    const { sport } = req.params;
    
    console.log(`Fetching standings for sport: ${sport}`);
    
    const standings = await LeagueTable.find({ 
      sport: new RegExp(sport, 'i'),
      isActive: true 
    });

    console.log(`Found ${standings.length} standings for ${sport}`);

    // If no standings found, return sample data
    if (standings.length === 0) {
      const sampleStandings = getSampleLeagueTables().filter(table => 
        table.sport.toLowerCase().includes(sport.toLowerCase())
      );
      
      return res.json({
        success: true,
        standings: sampleStandings,
        isSampleData: true
      });
    }

    res.json({
      success: true,
      standings
    });
  } catch (error) {
    console.error('Error fetching sport standings:', error);
    const sampleStandings = getSampleLeagueTables().filter(table => 
      table.sport.toLowerCase().includes(req.params.sport.toLowerCase())
    );
    
    res.json({
      success: true,
      standings: sampleStandings,
      isSampleData: true
    });
  }
});

// Get fixtures for specific sport - FIXED
app.get('/api/sports/:sport/fixtures', async (req, res) => {
  try {
    const { sport } = req.params;
    const { status, limit = 10 } = req.query;
    
    console.log(`Fetching fixtures for sport: ${sport}`);
    
    let query = { 
      sport: new RegExp(sport, 'i'),
      isActive: true 
    };
    
    if (status && status !== 'all') query.status = status;

    const fixtures = await Fixture.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));

    console.log(`Found ${fixtures.length} fixtures for ${sport}`);

    // If no fixtures found, return sample data
    if (fixtures.length === 0) {
      const sampleFixtures = getSampleFixtures().filter(fixture => 
        fixture.sport.toLowerCase().includes(sport.toLowerCase())
      ).slice(0, limit);
      
      return res.json({
        success: true,
        fixtures: sampleFixtures,
        isSampleData: true
      });
    }

    res.json({
      success: true,
      fixtures
    });
  } catch (error) {
    console.error('Error fetching sport fixtures:', error);
    const sampleFixtures = getSampleFixtures().filter(fixture => 
      fixture.sport.toLowerCase().includes(req.params.sport.toLowerCase())
    ).slice(0, 10);
    
    res.json({
      success: true,
      fixtures: sampleFixtures,
      isSampleData: true
    });
  }
});

// ========== ENHANCED VIDEO ENDPOINTS ==========

// Get all videos with filters - FIXED
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
    
    let query = { isActive: true };
    
    // Build filter query
    if (category && category !== 'all') query.category = category;
    if (sport && sport !== 'all') query.sport = new RegExp(sport, 'i');
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

    // If no videos found and there's a search, return sample data
    if (videos.length === 0 && search) {
      const sampleVideos = getSampleVideos().filter(video => 
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.description.toLowerCase().includes(search.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, limit);
      
      return res.json({
        success: true,
        videos: sampleVideos,
        hasMore: false,
        total: sampleVideos.length,
        page: parseInt(page),
        limit: parseInt(limit),
        isSampleData: true
      });
    }

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

// Search videos - FIXED
app.get('/api/videos/search', async (req, res) => {
  try {
    const { q, sport, type, category, page = 1, limit = 12 } = req.query;
    
    let query = { isActive: true };
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    if (sport && sport !== 'all') query.sport = new RegExp(sport, 'i');
    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;

    const skip = (page - 1) * limit;
    
    const videos = await Video.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Video.countDocuments(query);
    const hasMore = total > (skip + videos.length);

    // If no videos found, return sample data
    if (videos.length === 0) {
      let sampleVideos = getSampleVideos();
      
      if (q) {
        sampleVideos = sampleVideos.filter(video => 
          video.title.toLowerCase().includes(q.toLowerCase()) ||
          video.description.toLowerCase().includes(q.toLowerCase()) ||
          video.tags.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
        );
      }
      
      if (sport && sport !== 'all') {
        sampleVideos = sampleVideos.filter(video => 
          video.sport.toLowerCase().includes(sport.toLowerCase())
        );
      }
      
      sampleVideos = sampleVideos.slice(0, limit);
      
      return res.json({
        success: true,
        videos: sampleVideos,
        total: sampleVideos.length,
        hasMore: false,
        page: parseInt(page),
        limit: parseInt(limit),
        isSampleData: true
      });
    }

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
    let sampleVideos = getSampleVideos();
    
    if (req.query.q) {
      sampleVideos = sampleVideos.filter(video => 
        video.title.toLowerCase().includes(req.query.q.toLowerCase()) ||
        video.description.toLowerCase().includes(req.query.q.toLowerCase())
      );
    }
    
    sampleVideos = sampleVideos.slice(0, req.query.limit || 12);
    
    res.json({
      success: true,
      videos: sampleVideos,
      total: sampleVideos.length,
      hasMore: false,
      page: parseInt(req.query.page || 1),
      limit: parseInt(req.query.limit || 12),
      isSampleData: true
    });
  }
});

// Get live streams - FIXED
app.get('/api/videos/live', async (req, res) => {
  try {
    const { sport, limit = 10 } = req.query;
    
    let query = { 
      type: 'live', 
      status: 'live',
      isActive: true 
    };
    
    if (sport && sport !== 'all') query.sport = new RegExp(sport, 'i');

    const liveStreams = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // If no live streams found, return sample data
    if (liveStreams.length === 0) {
      const sampleLiveStreams = getSampleVideos().filter(video => 
        video.type === 'live' && video.status === 'live'
      ).slice(0, limit);
      
      if (sport && sport !== 'all') {
        sampleLiveStreams = sampleLiveStreams.filter(stream => 
          stream.sport.toLowerCase().includes(sport.toLowerCase())
        );
      }
      
      return res.json({
        success: true,
        liveStreams: sampleLiveStreams,
        isSampleData: true
      });
    }

    res.json({
      success: true,
      liveStreams
    });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    let sampleLiveStreams = getSampleVideos().filter(video => 
      video.type === 'live' && video.status === 'live'
    ).slice(0, req.query.limit || 10);
    
    if (req.query.sport && req.query.sport !== 'all') {
      sampleLiveStreams = sampleLiveStreams.filter(stream => 
        stream.sport.toLowerCase().includes(req.query.sport.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      liveStreams: sampleLiveStreams,
      isSampleData: true
    });
  }
});

// ========== FIXED TRACK WATCH ENDPOINT ==========
app.post('/api/user/track-watch', async (req, res) => {
  try {
    console.log('🔔 Track watch request received:', req.body);
    
    if (!req.session.user) {
      console.log('⚠️ No user session found for track watch');
      return res.status(401).json({
        success: false,
        message: 'Please log in to track watch history'
      });
    }

    const { videoId, title, duration } = req.body;

    console.log('📋 Track watch details:', {
      sessionUser: req.session.user,
      videoId,
      title
    });

    if (!videoId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: videoId, title'
      });
    }

    // Find user and update watch history
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize watchedVideos array if it doesn't exist
    if (!user.watchedVideos) {
      user.watchedVideos = [];
    }

    // Check if video already exists in watch history
    const existingVideoIndex = user.watchedVideos.findIndex(v => v.videoId === videoId);
    
    if (existingVideoIndex !== -1) {
      // Update existing entry with new watch time
      user.watchedVideos[existingVideoIndex].watchedAt = new Date();
      user.watchedVideos[existingVideoIndex].duration = duration || user.watchedVideos[existingVideoIndex].duration;
    } else {
      // Add new video to watch history
      user.watchedVideos.push({
        videoId,
        title,
        duration: duration || '0:00',
        watchedAt: new Date()
      });
    }

    // Keep only last 100 watched videos to prevent array from growing too large
    if (user.watchedVideos.length > 100) {
      user.watchedVideos = user.watchedVideos.slice(-100);
    }

    await user.save();

    console.log('✅ Watch history updated successfully');

    res.json({
      success: true,
      message: 'Watch history updated successfully'
    });

  } catch (error) {
    console.error('❌ Track watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating watch history',
      error: error.message
    });
  }
});

// ========== WATCH HISTORY ENDPOINT ==========
app.get('/api/user/watch-history', async (req, res) => {
  try {
    console.log('🔔 Get watch history request');
    
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

    // Sort by most recently watched first
    const sortedHistory = (user.watchedVideos || []).sort((a, b) => 
      new Date(b.watchedAt) - new Date(a.watchedAt)
    );

    res.json({
      success: true,
      watchHistory: sortedHistory
    });

  } catch (error) {
    console.error('❌ Get watch history error:', error);
    res.json({
      success: false,
      message: 'Error fetching watch history',
      watchHistory: []
    });
  }
});

// ========== AUTHENTICATION ENDPOINTS (UPDATED FOR ADMIN) ==========

// Enhanced Signup with Admin Support
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
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

    // Check for admin code
    let isAdmin = false;
    let adminCodeUsed = null;
    
    if (adminCode) {
      // Verify admin code against environment variable
      const validAdminCode = process.env.ADMIN_SECRET_CODE || 'DEFAULT_ADMIN_CODE_123';
      
      if (adminCode === validAdminCode) {
        isAdmin = true;
        adminCodeUsed = adminCode;
        console.log(`✅ Admin account created for: ${email}`);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin invitation code'
        });
      }
    }

    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      isAdmin: isAdmin,
      adminCode: adminCodeUsed
    });

    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    };

    res.json({
      success: true,
      message: isAdmin ? 'Admin account created successfully!' : 'Account created successfully!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
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

// Enhanced Login with Admin Support
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

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false
    };

    console.log(`✅ ${user.isAdmin ? 'Admin' : 'User'} login: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false
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

// Get current user with admin status
app.get('/api/user', async (req, res) => {
  try {
    if (req.session.user) {
      // Fetch fresh user data from database
      const user = await User.findById(req.session.user.id).select('-password');
      
      if (!user) {
        req.session.destroy();
        return res.json({
          success: false,
          user: null,
          message: 'User not found'
        });
      }

      // Update session with fresh data
      req.session.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false
      };

      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin || false
        }
      });
    } else {
      res.json({
        success: false,
        user: null
      });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.json({
      success: false,
      user: null
    });
  }
});

// Get admin status
app.get('/api/user/admin-status', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        isAdmin: false,
        message: 'Not logged in'
      });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.json({
        success: false,
        isAdmin: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.json({
      success: false,
      isAdmin: false
    });
  }
});

// ========== ADMIN AUTHENTICATION MIDDLEWARE ==========
const adminAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to access admin panel'
    });
  }

  // Check if user is admin
  if (!req.session.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }

  next();
};

// ========== USER PREFERENCES ENDPOINT ==========
app.get('/api/user/preferences', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access preferences'
      });
    }

    const user = await User.findById(req.session.user.id).select('savedVideos watchedVideos');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      savedVideos: user.savedVideos || [],
      watchedVideos: user.watchedVideos || []
    });

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user preferences'
    });
  }
});

// ========== FIXTURES API ENDPOINTS - UPDATED ==========

// TODAY'S FIXTURES - LOAD FROM DATABASE
app.get('/api/fixtures/today', async (req, res) => {
  try {
    const { limit = 50, sport, league } = req.query;
    
    // Get today's date at midnight
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    console.log('📅 Loading today\'s fixtures from database:', { 
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString(),
      now: now.toISOString()
    });

    let query = {
      date: { $gte: todayStart, $lt: todayEnd },
      isActive: true
    };
    
    if (sport && sport !== 'All' && sport !== 'all') {
      query.sport = { $regex: new RegExp(sport, 'i') };
    }
    
    if (league && league !== 'All' && league !== 'all') {
      query.league = { $regex: new RegExp(league, 'i') };
    }

    const fixtures = await Fixture.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));

    console.log(`✅ Found ${fixtures.length} fixtures for today in database`);

    // If no fixtures found, return dynamic data
    if (fixtures.length === 0) {
      console.log('📋 No fixtures found for today, generating dynamic data');
      const dynamicFixtures = generateDynamicFixtures(todayStart, todayEnd, 8);
      return res.json({
        success: true,
        fixtures: dynamicFixtures,
        isSampleData: true
      });
    }

    res.json({
      success: true,
      fixtures,
      total: fixtures.length
    });
  } catch (error) {
    console.error('❌ Error fetching today\'s fixtures:', error);
    
    // Generate dynamic fixtures for today on error
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const dynamicFixtures = generateDynamicFixtures(todayStart, todayEnd, 8);
    
    res.json({
      success: true,
      fixtures: dynamicFixtures,
      isSampleData: true,
      error: error.message
    });
  }
});

// UPCOMING FIXTURES - LOAD FROM DATABASE
app.get('/api/fixtures/upcoming', async (req, res) => {
  try {
    const { limit = 50, sport, league, days = 7 } = req.query;
    
    // Calculate date range: today to next X days
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + parseInt(days));
    
    console.log('🔔 Loading upcoming fixtures from database:', { 
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit,
      sport,
      league,
      days
    });

    // Build query for upcoming fixtures
    let query = { 
      isActive: true,
      date: { $gte: startDate, $lt: endDate },
      status: { $ne: 'finished' }
    };
    
    // Apply filters
    if (sport && sport !== 'All' && sport !== 'all') {
      query.sport = { $regex: new RegExp(sport, 'i') };
    }
    
    if (league && league !== 'All' && league !== 'all') {
      query.league = { $regex: new RegExp(league, 'i') };
    }

    console.log('📋 Database query:', JSON.stringify(query, null, 2));

    const fixtures = await Fixture.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));

    console.log(`✅ Found ${fixtures.length} upcoming fixtures in database`);

    // If no fixtures found in database, generate dynamic data
    if (fixtures.length === 0) {
      console.log('📋 No upcoming fixtures in database, generating dynamic data');
      const dynamicFixtures = generateDynamicFixtures(startDate, endDate, 15);
      return res.json({
        success: true,
        fixtures: dynamicFixtures,
        isSampleData: true
      });
    }

    res.json({
      success: true,
      fixtures,
      total: fixtures.length
    });
  } catch (error) {
    console.error('❌ Error fetching upcoming fixtures:', error);
    
    // Generate dynamic fixtures on error
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);
    const dynamicFixtures = generateDynamicFixtures(now, endDate, 15);
    
    res.json({
      success: true,
      fixtures: dynamicFixtures,
      isSampleData: true,
      error: error.message
    });
  }
});

// ALL FIXTURES WITH FILTERS
app.get('/api/fixtures', async (req, res) => {
  try {
    const { 
      date, 
      sport, 
      league, 
      status, 
      team, 
      limit = 100,
      featured,
      upcoming
    } = req.query;
    
    console.log('🔍 Fixtures query received:', {
      date, sport, league, status, team, limit, featured, upcoming
    });

    let query = { isActive: true };
    
    // Build filter query
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDate };
    }
    
    if (sport && sport !== 'All' && sport !== 'all') {
      query.sport = { $regex: new RegExp(sport, 'i') };
    }
    
    if (league && league !== 'All' && league !== 'all') {
      query.league = { $regex: new RegExp(league, 'i') };
    }
    
    if (status && status !== 'All' && status !== 'all') {
      query.status = { $regex: new RegExp(status, 'i') };
    }
    
    if (featured && featured !== 'false') {
      query.isFeatured = true;
    }
    
    if (team) {
      query.$or = [
        { 'homeTeam.name': { $regex: new RegExp(team, 'i') } },
        { 'awayTeam.name': { $regex: new RegExp(team, 'i') } }
      ];
    }
    
    if (upcoming === 'true') {
      const now = new Date();
      query.date = { $gte: now };
    }

    console.log('📋 Database query:', JSON.stringify(query, null, 2));

    const fixtures = await Fixture.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${fixtures.length} fixtures in database`);
    
    res.json({
      success: true,
      fixtures,
      total: fixtures.length
    });
  } catch (error) {
    console.error('❌ Error fetching fixtures:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fixtures',
      error: error.message
    });
  }
});

// SPECIFIC FIXTURE
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

// FEATURED FIXTURES
app.get('/api/fixtures/featured', async (req, res) => {
  try {
    const now = new Date();
    
    const fixtures = await Fixture.find({
      isFeatured: true,
      isActive: true,
      date: { $gte: now }
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

// SEARCH FIXTURES
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

// SPORT-SPECIFIC FIXTURES
app.get('/api/sports/:sport/fixtures', async (req, res) => {
  try {
    const { sport } = req.params;
    const { status, limit = 20 } = req.query;
    
    console.log(`Fetching fixtures for sport: ${sport}`);
    
    let query = { 
      sport: { $regex: new RegExp(sport, 'i') },
      isActive: true 
    };
    
    if (status && status !== 'all') query.status = status;

    const fixtures = await Fixture.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));

    console.log(`Found ${fixtures.length} fixtures for ${sport} in database`);

    // If no fixtures found, generate dynamic data
    if (fixtures.length === 0) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7);
      const dynamicFixtures = generateDynamicFixtures(now, endDate, 10).filter(f => 
        f.sport.toLowerCase().includes(sport.toLowerCase())
      );
      
      return res.json({
        success: true,
        fixtures: dynamicFixtures,
        isSampleData: true
      });
    }

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

// ========== FIXED TODAY'S RESULTS ENDPOINT ==========
app.get('/api/scores/results', async (req, res) => {
  try {
    // Get today's date at start and end
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
    
    console.log('📊 Fetching today\'s results from database:', {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString()
    });
    
    // Query for finished matches today
    const scores = await Score.find({ 
      status: 'finished',
      isActive: true,
      time: { $gte: today, $lt: tomorrow }
    }).sort({ time: -1 });
    
    console.log(`✅ Found ${scores.length} results for today in database`);
    
    // If no results found for today, try to get any recent finished matches
    if (scores.length === 0) {
      console.log('📋 No results found for today, checking last 3 days');
      
      // Get the last 3 days
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const recentScores = await Score.find({ 
        status: 'finished',
        isActive: true,
        time: { $gte: threeDaysAgo, $lt: tomorrow }
      }).sort({ time: -1 }).limit(10);
      
      if (recentScores.length > 0) {
        console.log(`📋 Found ${recentScores.length} recent results`);
        return res.json({
          success: true,
          scores: recentScores,
          isRecentData: true
        });
      }
      
      // If still no results, return sample data
      console.log('📋 No recent results found, returning sample data');
      const sampleResults = getTodaysSampleResults();
      return res.json({
        success: true,
        scores: sampleResults,
        isSampleData: true
      });
    }
    
    res.json({
      success: true,
      scores
    });
  } catch (error) {
    console.error('❌ Error fetching results:', error);
    
    // Return sample data on error
    const sampleResults = getTodaysSampleResults();
    res.json({
      success: true,
      scores: sampleResults,
      isSampleData: true,
      error: error.message
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
    // Return sample data if no teams found
    const sampleTeams = getSampleTeams();
    res.json({
      success: true,
      teams: sampleTeams
    });
  }
});

app.get('/api/teams/featured', async (req, res) => {
  try {
    const teams = await Team.find({ 
      featured: true, 
      isActive: true 
    }).limit(10);
    
    if (teams.length === 0) {
      const sampleTeams = getSampleTeams().filter(team => team.featured).slice(0, 10);
      return res.json({
        success: true,
        teams: sampleTeams
      });
    }
    
    res.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error fetching featured teams:', error);
    const sampleTeams = getSampleTeams().filter(team => team.featured).slice(0, 10);
    res.json({
      success: true,
      teams: sampleTeams
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
      // Return sample team data if not found
      const sampleTeams = getSampleTeams();
      const sampleTeam = sampleTeams.find(t => t.teamId === parseInt(req.params.id));
      
      if (!sampleTeam) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      return res.json({
        success: true,
        team: sampleTeam
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
    
    if (tables.length === 0) {
      const sampleTables = getSampleLeagueTables();
      return res.json({
        success: true,
        tables: sampleTables
      });
    }
    
    res.json({
      success: true,
      tables
    });
  } catch (error) {
    console.error('Error fetching league tables:', error);
    const sampleTables = getSampleLeagueTables();
    res.json({
      success: true,
      tables: sampleTables
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
      const sampleTables = getSampleLeagueTables();
      const sampleTable = sampleTables.find(t => t.leagueName === req.params.league);
      
      if (!sampleTable) {
        return res.status(404).json({
          success: false,
          message: 'League table not found'
      });
      }
      
      return res.json({
        success: true,
        table: sampleTable
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
    
    if (players.length === 0) {
      const samplePlayers = getSamplePlayers();
      return res.json({
        success: true,
        players: samplePlayers
      });
    }
    
    res.json({ success: true, players });
  } catch (error) {
    console.error('Error fetching players:', error);
    const samplePlayers = getSamplePlayers();
    res.json({ 
      success: true, 
      players: samplePlayers 
    });
  }
});

// Get specific player by ID
app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findOne({ 
      playerId: req.params.id,
      isActive: true 
    });
    
    if (!player) {
      const samplePlayers = getSamplePlayers();
      const samplePlayer = samplePlayers.find(p => p.playerId === req.params.id);
      
      if (!samplePlayer) {
        return res.status(404).json({
          success: false,
          message: 'Player not found'
        });
      }
      
      return res.json({
        success: true,
        player: samplePlayer
      });
    }
    
    res.json({
      success: true,
      player
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching player' 
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

// Follow/Unfollow Sport endpoint - FIXED VERSION
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

  // FIX: Check for required fields - only sportId and action are required
  if (!sportId || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: sportId, action'
    });
  }

  const sportIdStr = String(sportId);
  
  let update;
  let message;
  let responseAction;

  if (action === 'follow') {
    // FIX: Make sportName optional and provide fallback
    const finalSportName = sportName || sportIdStr.charAt(0).toUpperCase() + sportIdStr.slice(1);
    
    update = {
      $addToSet: {
        followedSports: { 
          sportId: sportIdStr, 
          sportName: finalSportName, 
          category: category || 'General',
          icon: icon || '🏆',
          description: description || `${finalSportName} - Sports coverage`,
          popularity: popularity || 1,
          followedAt: new Date()
        }
      }
    };
    message = `You are now following ${finalSportName}`;
    responseAction = 'followed';
  } else if (action === 'unfollow') {
    update = {
      $pull: {
        followedSports: { sportId: sportIdStr }
      }
    };
    message = `You have unfollowed ${sportName || 'the sport'}`;
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
// Set/Remove Reminder endpoint
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

  if (!matchId || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: matchId, action'
    });
  }

  const matchIdStr = String(matchId);
  
  let update;
  let message;
  let responseAction;

  if (action === 'add') {
    // For add, require more fields
    if (!homeTeam || !awayTeam) {
      return res.status(400).json({
        success: false,
        message: 'For adding reminder, homeTeam and awayTeam are required'
      });
    }

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
    // For remove, only matchId is needed
    update = {
      $pull: {
        matchReminders: { matchId: matchIdStr }
      }
    };
    message = `Reminder removed successfully`;
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

// ========== TOURNAMENT REMINDERS ==========
// Get user's reminded tournaments
app.get('/api/user/reminded-tournaments', async (req, res) => {
  try {
    console.log('🔔 Get reminded tournaments request');
    
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        remindedTournaments: []
      });
    }

    const user = await User.findById(req.session.user.id).select('tournamentReminders');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        remindedTournaments: []
      });
    }

    res.json({
      success: true,
      remindedTournaments: user.tournamentReminders || []
    });

  } catch (error) {
    console.error('❌ Get reminded tournaments error:', error);
    res.json({
      success: false,
      message: 'Error fetching reminded tournaments',
      remindedTournaments: []
    });
  }
});

// Set/Remove tournament reminder
app.post('/api/user/set-tournament-reminder', async (req, res) => {
  console.log('🔔 Set tournament reminder request received:', req.body);
  
  if (!req.session.user) {
    console.log('⚠️ No user session found');
    return res.status(401).json({
      success: false,
      message: 'Please log in to set tournament reminders'
    });
  }

  const { tournamentId, tournamentName, sport, startDate, endDate, action } = req.body;

  console.log('📋 Tournament reminder request details:', {
    sessionUser: req.session.user,
    tournamentId,
    tournamentName,
    action
  });

  if (!tournamentId || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: tournamentId, action'
    });
  }

  const tournamentIdStr = String(tournamentId);
  
  let update;
  let message;
  let responseAction;

  if (action === 'add') {
    // For add, require tournamentName
    if (!tournamentName) {
      return res.status(400).json({
        success: false,
        message: 'For adding tournament reminder, tournamentName is required'
      });
    }

    update = {
      $addToSet: {
        tournamentReminders: { 
          tournamentId: tournamentIdStr, 
          tournamentName,
          sport: sport || 'Unknown',
          startDate: startDate || 'Unknown',
          endDate: endDate || 'Unknown',
          remindedAt: new Date()
        }
      }
    };
    message = `You are now following ${tournamentName}`;
    responseAction = 'reminder_set';
  } else if (action === 'remove') {
    // For remove, only tournamentId is needed
    update = {
      $pull: {
        tournamentReminders: { tournamentId: tournamentIdStr }
      }
    };
    message = `You have unfollowed the tournament`;
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

    console.log('📊 Tournament reminder update result:', result);

    if (result.matchedCount === 0) {
      console.log('❌ User not found during tournament reminder update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Tournament ${action}ed successfully. Modified: ${result.modifiedCount}`);

    res.json({
      success: true,
      message,
      action: responseAction,
      modified: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('❌ Set tournament reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tournament reminder',
      error: error.message
    });
  }
});

// ========== PINNED PLAYER ENDPOINTS ==========

// Get user's pinned player
app.get('/api/user/pinned-player', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'Not logged in',
        pinnedPlayerId: null
      });
    }

    const user = await User.findById(req.session.user.id).select('pinnedPlayerId');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        pinnedPlayerId: null
      });
    }

    res.json({
      success: true,
      pinnedPlayerId: user.pinnedPlayerId || null
    });

  } catch (error) {
    console.error('Error fetching pinned player:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pinned player',
      pinnedPlayerId: null
    });
  }
});

// Update user's pinned player
app.post('/api/user/pinned-player', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to pin players'
      });
    }

    const { playerId, action } = req.body;

    // Find user to check if they're following the player
    const user = await User.findById(req.session.user.id).select('followedPlayers pinnedPlayerId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let update = {};
    let message = '';

    if (action === 'pin' && playerId) {
      // Check if user is following the player
      const isFollowing = user.followedPlayers?.some(
        player => player.playerId === playerId
      );
      
      if (!isFollowing) {
        return res.status(400).json({
          success: false,
          message: 'You must follow the player before pinning'
        });
      }

      update = { pinnedPlayerId: playerId };
      message = 'Player pinned successfully';
    } else if (action === 'unpin' || !playerId) {
      update = { pinnedPlayerId: null };
      message = 'Player unpinned successfully';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user.id,
      update,
      { new: true }
    ).select('pinnedPlayerId');

    res.json({
      success: true,
      message,
      pinnedPlayerId: updatedUser.pinnedPlayerId
    });

  } catch (error) {
    console.error('Error updating pinned player:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating pinned player'
    });
  }
});

// Get comprehensive user profile data
app.get('/api/user/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to view profile'
      });
    }

    const user = await User.findById(req.session.user.id)
      .select('username email followedPlayers followedTeams followedSports matchReminders tournamentReminders watchedVideos pinnedPlayerId createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        pinnedPlayerId: user.pinnedPlayerId,
        followedPlayers: user.followedPlayers || [],
        followedTeams: user.followedTeams || [],
        followedSports: user.followedSports || [],
        matchReminders: user.matchReminders || [],
        tournamentReminders: user.tournamentReminders || [],
        watchedVideos: user.watchedVideos || [],
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// Update user profile
app.put('/api/user/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to update profile'
      });
    }

    const { username, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.session.user.id,
      {
        $set: {
          ...(username && { username }),
          ...(email && { email }),
          ...(phone && { phone })
        }
      },
      { new: true }
    ).select('username email phone');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
});

// Update notification preferences
app.put('/api/user/notifications', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to update notifications'
      });
    }

    const { matchReminders, scoreUpdates, newsAlerts, videoHighlights } = req.body;

    const user = await User.findByIdAndUpdate(
      req.session.user.id,
      {
        $set: {
          notificationPreferences: {
            matchReminders: matchReminders !== undefined ? matchReminders : true,
            scoreUpdates: scoreUpdates !== undefined ? scoreUpdates : true,
            newsAlerts: newsAlerts !== undefined ? newsAlerts : false,
            videoHighlights: videoHighlights !== undefined ? videoHighlights : true
          }
        }
      },
      { new: true }
    ).select('notificationPreferences');

    res.json({
      success: true,
      message: 'Notification preferences updated',
      preferences: user.notificationPreferences
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification preferences'
    });
  }
});

// Export user data
app.get('/api/user/export-data', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to export data'
      });
    }

    const user = await User.findById(req.session.user.id)
      .select('username email followedPlayers followedTeams followedSports matchReminders tournamentReminders watchedVideos pinnedPlayerId createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format data for export
    const exportData = {
      user: {
        username: user.username,
        email: user.email,
        accountCreated: user.createdAt,
        dataExported: new Date().toISOString()
      },
      following: {
        players: user.followedPlayers || [],
        teams: user.followedTeams || [],
        sports: user.followedSports || []
      },
      reminders: {
        matches: user.matchReminders || [],
        tournaments: user.tournamentReminders || []
      },
      activity: {
        watchedVideos: user.watchedVideos || [],
        pinnedPlayer: user.pinnedPlayerId
      }
    };

    res.json({
      success: true,
      data: exportData,
      message: 'Data exported successfully'
    });

  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting user data'
    });
  }
});

// ========== TOURNAMENTS API ROUTES ==========
app.get('/api/tournaments', async (req, res) => {
  try {
    const { status, sport, featured, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Build filter query
    if (status && status !== 'All') query.status = status;
    if (sport && sport !== 'All') query.sport = sport;
    if (featured) query.isFeatured = featured === 'true';

    const tournaments = await Tournament.find(query)
      .sort({ startDate: 1 })
      .limit(parseInt(limit));
    
    // If no tournaments found, return sample data
    if (tournaments.length === 0) {
      const sampleTournaments = [
        {
          tournamentId: 'TRN-506',
          name: 'Super Bowl LVIII',
          sport: 'American Football',
          status: 'upcoming',
          startDate: new Date('2024-02-11'),
          endDate: new Date('2024-02-11'),
          location: 'Las Vegas, Nevada',
          teams: 2,
          description: 'The championship game of the National Football League.',
          prizeMoney: 'Championship bonuses',
          isActive: true,
          isFeatured: true
        }
      ];
      
      return res.json({
        success: true,
        tournaments: sampleTournaments,
        isSampleData: true
      });
    }

    res.json({
      success: true,
      tournaments
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tournaments'
    });
  }
});

// Get specific tournament
app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findOne({ 
      tournamentId: req.params.id,
      isActive: true 
    });
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    res.json({
      success: true,
      tournament
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tournament'
    });
  }
});

// Debug endpoint to see all fixtures
app.get('/api/debug/fixtures', async (req, res) => {
  try {
    const fixtures = await Fixture.find({}).limit(20);
    res.json({
      success: true,
      total: fixtures.length,
      fixtures: fixtures.map(f => ({
        id: f._id,
        fixtureId: f.fixtureId,
        sport: f.sport,
        league: f.league,
        home: f.homeTeam?.name || f.teams?.home,
        away: f.awayTeam?.name || f.teams?.away,
        date: f.date,
        time: f.time,
        status: f.status,
        isActive: f.isActive,
        isFeatured: f.isFeatured
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Updated Sample Fixtures Function
function getSampleFixtures() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return generateDynamicFixtures(today, tomorrow, 5);
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

// ========== NEW FUNCTION FOR TODAY'S SAMPLE RESULTS ==========
function getTodaysSampleResults() {
  const today = new Date();
  const todayMorning = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30, 0, 0);
  const todayAfternoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0, 0);

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
      time: todayMorning,
      competition: 'La Liga • Camp Nou',
      matchDetails: {
        venue: 'Camp Nou',
        time: 'Full Time'
      },
      stats: {
        possession: '62% - 38%',
        shots: '18 - 12',
        shotsOnTarget: '6 - 5',
        corners: '8 - 4',
        fouls: '14 - 16',
        yellowCards: '3 - 4',
        redCards: '0 - 0',
        offsides: '2 - 1'
      },
      teamStats: {
        home: {
          name: 'Barcelona',
          passes: 645,
          passAccuracy: '89%',
          tackles: 19,
          interceptions: 11
        },
        away: {
          name: 'Real Madrid',
          passes: 412,
          passAccuracy: '82%',
          tackles: 24,
          interceptions: 16
        }
      },
      highlights: {
        videoId: 'ni8PheuLDgs',
        summary: 'Real Madrid secured a convincing 3-1 victory over rivals Barcelona in a thrilling El Clásico encounter. The away side dominated possession and created numerous chances, with their attacking trio causing constant problems for the Barcelona defense.'
      },
      isActive: true
    }
  ];
}

function getSampleTeams() {
  return [
    {
      teamId: 1,
      name: "Arsenal",
      sport: "Football",
      league: "Premier League",
      country: "England",
      featured: true,
      stats: {
        overall: {
          position: 1,
          played: 11,
          wins: 8,
          draws: 2,
          losses: 1,
          points: 26,
          trophies: 13
        },
        home: {
          position: 1,
          played: 6,
          wins: 5,
          draws: 1,
          losses: 0,
          points: 16
        },
        away: {
          position: 2,
          played: 5,
          wins: 3,
          draws: 1,
          losses: 1,
          points: 10
        }
      },
      keyPlayers: ["Bukayo Saka", "Martin Ødegaard", "William Saliba"],
      logo: "ARS",
      schedule: [
        { date: new Date("2024-11-15"), opponent: "Manchester City", location: "Home", time: "15:00" },
        { date: new Date("2024-11-22"), opponent: "Chelsea", location: "Away", time: "17:30" },
        { date: new Date("2024-11-29"), opponent: "Liverpool", location: "Home", time: "16:00" },
        { date: new Date("2024-12-06"), opponent: "Tottenham", location: "Away", time: "12:30" }
      ],
      roster: [
        { name: "Aaron Ramsdale", position: "Goalkeeper", number: 1 },
        { name: "William Saliba", position: "Defender", number: 2 },
        { name: "Kieran Tierney", position: "Defender", number: 3 },
        { name: "Ben White", position: "Defender", number: 4 },
        { name: "Thomas Partey", position: "Midfielder", number: 5 },
        { name: "Gabriel Magalhães", position: "Defender", number: 6 },
        { name: "Bukayo Saka", position: "Forward", number: 7 },
        { name: "Martin Ødegaard", position: "Midfielder", number: 8 },
        { name: "Gabriel Jesus", position: "Forward", number: 9 },
        { name: "Emile Smith Rowe", position: "Midfielder", number: 10 }
      ],
      isActive: true
    },
    {
      teamId: 2,
      name: "Manchester City",
      sport: "Football",
      league: "Premier League",
      country: "England",
      featured: true,
      stats: {
        overall: {
          position: 2,
          played: 11,
          wins: 7,
          draws: 1,
          losses: 3,
          points: 22,
          trophies: 9
        },
        home: {
          position: 2,
          played: 6,
          wins: 4,
          draws: 1,
          losses: 1,
          points: 13
        },
        away: {
          position: 3,
          played: 5,
          wins: 3,
          draws: 0,
          losses: 2,
          points: 9
        }
      },
      keyPlayers: ["Erling Haaland", "Phil Foden", "Rodri"],
      logo: "MCI",
      schedule: [
        { date: new Date("2024-11-15"), opponent: "Arsenal", location: "Away", time: "15:00" },
        { date: new Date("2024-11-22"), opponent: "Manchester United", location: "Home", time: "15:00" },
        { date: new Date("2024-11-29"), opponent: "Newcastle", location: "Away", time: "17:30" },
        { date: new Date("2024-12-06"), opponent: "Aston Villa", location: "Home", time: "15:00" }
      ],
      roster: [
        { name: "Ederson", position: "Goalkeeper", number: 31 },
        { name: "Kyle Walker", position: "Defender", number: 2 },
        { name: "Rúben Dias", position: "Defender", number: 3 },
        { name: "John Stones", position: "Defender", number: 5 },
        { name: "Rodri", position: "Midfielder", number: 16 },
        { name: "Kevin De Bruyne", position: "Midfielder", number: 17 },
        { name: "Bernardo Silva", position: "Midfielder", number: 20 },
        { name: "Phil Foden", position: "Midfielder", number: 47 },
        { name: "Erling Haaland", position: "Forward", number: 9 },
        { name: "Julián Álvarez", position: "Forward", number: 19 }
      ],
      isActive: true
    },
    // Add more sample teams as needed...
  ];
}

function getSamplePlayers() {
  return [
    {
      playerId: "1",
      name: "Lionel Messi",
      sport: "Football",
      position: "Forward",
      team: "Inter Miami",
      nationality: "Argentina",
      image: "https://via.placeholder.com/150?text=Messi",
      stats: {
        goals: 800,
        assists: 350,
        appearances: 1000,
        trophies: 42
      },
      isActive: true
    },
    {
      playerId: "4",
      name: "Stephen Curry",
      sport: "Basketball",
      position: "Point Guard",
      team: "Golden State Warriors",
      nationality: "USA",
      image: "https://via.placeholder.com/150?text=Curry",
      stats: {
        points: 22000,
        rebounds: 4300,
        assists: 5700,
        championships: 4
      },
      isActive: true
    }
  ];
}

function getSampleLeagueTables() {
  return [
    {
      leagueName: "Premier League",
      sport: "Football",
      table: [
        { position: 1, team: "Arsenal", played: 11, wins: 8, draws: 2, losses: 1, points: 26 },
        { position: 2, team: "Manchester City", played: 11, wins: 7, draws: 1, losses: 3, points: 22 },
        { position: 3, team: "Chelsea", played: 11, wins: 6, draws: 2, losses: 3, points: 20 }
      ],
      isActive: true
    }
  ];
}

function getSampleScores(status) {
  const allScores = [
    ...getSampleLiveScores(),
    ...getTodaysSampleResults(),
    ...getSampleUpcomingScores()
  ];
  
  if (!status || status === 'All') return allScores;
  
  return allScores.filter(score => score.status === status.toLowerCase());
}

// ========== ADMIN STATISTICS ENDPOINTS ==========

// Get dashboard statistics
app.get('/api/admin/statistics', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalNews,
      totalVideos,
      totalFixtures,
      totalLiveEvents,
      totalTeams,
      totalPlayers,
      todayUsers,
      todayFixtures
    ] = await Promise.all([
      User.countDocuments(),
      News.countDocuments(),
      Video.countDocuments(),
      Fixture.countDocuments(),
      LiveEvent.countDocuments(),
      Team.countDocuments(),
      Player.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Fixture.countDocuments({
        date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    // Count admin users
    const adminUsers = await User.countDocuments({ isAdmin: true });

    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalNews,
        totalVideos,
        totalFixtures,
        totalLiveEvents,
        totalTeams,
        totalPlayers,
        adminUsers,
        todayUsers,
        todayFixtures,
        storageUsed: Math.round(totalUsers * 0.5 + totalNews * 0.1), // Mock storage calculation
        activeSessions: Math.floor(Math.random() * 100) + 50 // Mock active sessions
      }
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Get recent activity
app.get('/api/admin/activity', adminAuth, async (req, res) => {
  try {
    const [recentUsers, recentNews, recentVideos] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select('username email createdAt isAdmin'),
      News.find().sort({ date: -1 }).limit(5).select('title sport date'),
      Video.find().sort({ createdAt: -1 }).limit(5).select('title sport createdAt')
    ]);

    const activityLog = [
      ...recentUsers.map(user => ({
        type: user.isAdmin ? 'admin_signup' : 'user_signup',
        message: `${user.isAdmin ? 'New admin registered' : 'New user registered'}: ${user.username}`,
        timestamp: user.createdAt,
        user: { username: user.username, email: user.email, isAdmin: user.isAdmin }
      })),
      ...recentNews.map(news => ({
        type: 'news_published',
        message: `News published: ${news.title}`,
        timestamp: news.date,
        sport: news.sport
      })),
      ...recentVideos.map(video => ({
        type: 'video_uploaded',
        message: `Video uploaded: ${video.title}`,
        timestamp: video.createdAt,
        sport: video.sport
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({
      success: true,
      activity: activityLog
    });
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity'
    });
  }
});

// ========== USER MANAGEMENT ENDPOINTS ==========

// Get all users with pagination
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Update user
app.put('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, isAdmin, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from demoting themselves
    if (req.session.user.id === id && isAdmin === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove admin privileges from yourself'
      });
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// Delete user
app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.session.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// ========== CONTENT MANAGEMENT ENDPOINTS ==========

// News management
app.get('/api/admin/news', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { sport: { $regex: search, $options: 'i' } }
      ];
    }

    const news = await News.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    res.json({
      success: true,
      news,
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

app.post('/api/admin/news', adminAuth, async (req, res) => {
  try {
    const news = new News({
      ...req.body,
      isActive: true,
      createdAt: new Date()
    });

    await news.save();

    res.json({
      success: true,
      message: 'News article created successfully',
      news
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating news article'
    });
  }
});

app.put('/api/admin/news/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndUpdate(id, req.body, { new: true });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    res.json({
      success: true,
      message: 'News article updated successfully',
      news
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating news article'
    });
  }
});

app.delete('/api/admin/news/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    res.json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting news article'
    });
  }
});

// Videos management (similar structure)
app.get('/api/admin/videos', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments();

    res.json({
      success: true,
      videos,
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

// Fixtures management
app.get('/api/admin/fixtures', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const fixtures = await Fixture.find()
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Fixture.countDocuments();

    res.json({
      success: true,
      fixtures,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fixtures'
    });
  }
});

// ========== SYSTEM SETTINGS ENDPOINTS ==========

// Get system settings
app.get('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    // In a real app, you'd store these in a database
    const settings = {
      siteName: 'AllSports Games',
      siteDescription: 'Your premier sports destination',
      maintenanceMode: false,
      allowRegistrations: true,
      allowAdminSignup: true,
      adminSecretCode: process.env.ADMIN_SECRET_CODE ? '********' : 'Not set',
      maxUploadSize: 50, // MB
      videoQuality: '1080p',
      cacheDuration: 3600, // seconds
      analyticsEnabled: true,
      emailNotifications: true,
      socialSharing: true,
      adPlacements: ['header', 'sidebar', 'article']
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
});

// Update system settings
app.put('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    // In a real app, you'd save these to a database
    const settings = req.body;

    // Don't allow changing admin secret code from client for security
    if (settings.adminSecretCode) {
      delete settings.adminSecretCode;
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
});

// ========== ANALYTICS ENDPOINTS ==========

// Get analytics data
app.get('/api/admin/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d
    
    // Mock analytics data - in a real app, you'd use a proper analytics service
    const now = new Date();
    const analytics = {
      pageViews: {
        total: 15000,
        change: '+12%'
      },
      uniqueVisitors: {
        total: 4500,
        change: '+8%'
      },
      averageSession: {
        total: '4m 30s',
        change: '+5%'
      },
      bounceRate: {
        total: '42%',
        change: '-3%'
      }
    };

    // Mock chart data
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        visits: Math.floor(Math.random() * 500) + 200,
        pageviews: Math.floor(Math.random() * 1000) + 500,
        users: Math.floor(Math.random() * 300) + 100
      };
    });

    // Mock popular content
    const popularContent = [
      { title: 'Champions League Final Highlights', views: 12500, type: 'video' },
      { title: 'NBA Finals Game 7 Analysis', views: 9800, type: 'news' },
      { title: 'Premier League Transfer News', views: 8700, type: 'news' },
      { title: 'World Cup Qualifiers', views: 7600, type: 'live' },
      { title: 'Tennis Grand Slam Finals', views: 6500, type: 'video' }
    ];

    res.json({
      success: true,
      analytics,
      chartData,
      popularContent
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// ========== BACKUP & EXPORT ENDPOINTS ==========

// Export data
app.get('/api/admin/export/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    let data;

    switch (type) {
      case 'users':
        data = await User.find().select('-password');
        break;
      case 'news':
        data = await News.find();
        break;
      case 'videos':
        data = await Video.find();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    res.json({
      success: true,
      data,
      exportedAt: new Date().toISOString(),
      count: data.length
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
});

// Database backup (simulated)
app.post('/api/admin/backup', adminAuth, async (req, res) => {
  try {
    // In a real app, you'd create an actual database backup
    const backupInfo = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      size: '2.4 GB',
      status: 'completed',
      downloadUrl: `/api/admin/backup/download/backup_${Date.now()}.json`
    };

    res.json({
      success: true,
      message: 'Backup created successfully',
      backup: backupInfo
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating backup'
    });
  }
});

// ========== BULK OPERATIONS ENDPOINTS ==========

// Bulk delete
app.post('/api/admin/bulk/delete', adminAuth, async (req, res) => {
  try {
    const { type, ids } = req.body;

    if (!type || !ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    let result;
    switch (type) {
      case 'users':
        // Don't allow deleting admin users or yourself
        const filteredIds = ids.filter(id => id !== req.session.user.id);
        result = await User.deleteMany({ _id: { $in: filteredIds } });
        break;
      case 'news':
        result = await News.deleteMany({ _id: { $in: ids } });
        break;
      case 'videos':
        result = await Video.deleteMany({ _id: { $in: ids } });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid type for bulk delete'
        });
    }

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} ${type}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk delete'
    });
  }
});

// Bulk update
app.post('/api/admin/bulk/update', adminAuth, async (req, res) => {
  try {
    const { type, ids, update } = req.body;

    if (!type || !ids || !update) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    let result;
    switch (type) {
      case 'users':
        result = await User.updateMany(
          { _id: { $in: ids } },
          { $set: update }
        );
        break;
      case 'news':
        result = await News.updateMany(
          { _id: { $in: ids } },
          { $set: update }
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid type for bulk update'
        });
    }

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} ${type}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk update'
    });
  }
});
// ========== ADMIN VIDEO ENDPOINTS ==========
app.get('/api/admin/videos', adminAuth, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search = '',
            sport,
            category,
            type 
        } = req.query;
        
        const skip = (page - 1) * limit;
        
        let query = {};
        
        // Build filter query
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (sport && sport !== 'all') query.sport = sport;
        if (category && category !== 'all') query.category = category;
        if (type && type !== 'all') query.type = type;

        const videos = await Video.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Video.countDocuments(query);

        res.json({
            success: true,
            videos,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching admin videos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching videos'
        });
    }
});

app.post('/api/admin/videos', adminAuth, async (req, res) => {
    try {
        const videoData = {
            ...req.body,
            videoId: `VID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            isActive: true
        };

        const video = new Video(videoData);
        await video.save();

        res.json({
            success: true,
            message: 'Video created successfully',
            video
        });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating video'
        });
    }
});

app.put('/api/admin/videos/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findByIdAndUpdate(id, req.body, { new: true });

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.json({
            success: true,
            message: 'Video updated successfully',
            video
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating video'
        });
    }
});

app.delete('/api/admin/videos/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findByIdAndDelete(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting video'
        });
    }
});

// ========== ADMIN FIXTURE ENDPOINTS ==========
app.get('/api/admin/fixtures', adminAuth, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search = '',
            sport,
            status,
            league 
        } = req.query;
        
        const skip = (page - 1) * limit;
        
        let query = {};
        
        // Build filter query
        if (search) {
            query.$or = [
                { 'homeTeam.name': { $regex: search, $options: 'i' } },
                { 'awayTeam.name': { $regex: search, $options: 'i' } },
                { league: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (sport && sport !== 'all') query.sport = sport;
        if (status && status !== 'all') query.status = status;
        if (league && league !== 'all') query.league = { $regex: new RegExp(league, 'i') };

        const fixtures = await Fixture.find(query)
            .sort({ date: 1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Fixture.countDocuments(query);

        res.json({
            success: true,
            fixtures,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching admin fixtures:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching fixtures'
        });
    }
});

app.post('/api/admin/fixtures', adminAuth, async (req, res) => {
    try {
        const fixtureData = {
            ...req.body,
            fixtureId: `FIX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isActive: true
        };

        const fixture = new Fixture(fixtureData);
        await fixture.save();

        res.json({
            success: true,
            message: 'Fixture created successfully',
            fixture
        });
    } catch (error) {
        console.error('Error creating fixture:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating fixture'
        });
    }
});

app.put('/api/admin/fixtures/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const fixture = await Fixture.findByIdAndUpdate(id, req.body, { new: true });

        if (!fixture) {
            return res.status(404).json({
                success: false,
                message: 'Fixture not found'
            });
        }

        res.json({
            success: true,
            message: 'Fixture updated successfully',
            fixture
        });
    } catch (error) {
        console.error('Error updating fixture:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating fixture'
        });
    }
});

app.delete('/api/admin/fixtures/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const fixture = await Fixture.findByIdAndDelete(id);

        if (!fixture) {
            return res.status(404).json({
                success: false,
                message: 'Fixture not found'
            });
        }

        res.json({
            success: true,
            message: 'Fixture deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting fixture:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting fixture'
        });
    }
});

// ========== ADMIN STATISTICS ENDPOINT (ENHANCED) ==========
app.get('/api/admin/statistics', adminAuth, async (req, res) => {
    try {
        const [
            totalUsers,
            totalNews,
            totalVideos,
            totalFixtures,
            totalLiveEvents,
            totalTeams,
            totalPlayers,
            todayUsers,
            todayFixtures,
            todayVideos
        ] = await Promise.all([
            User.countDocuments(),
            News.countDocuments(),
            Video.countDocuments(),
            Fixture.countDocuments(),
            LiveEvent.countDocuments({ status: 'Live' }),
            Team.countDocuments(),
            Player.countDocuments(),
            User.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            Fixture.countDocuments({
                date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            Video.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
        ]);

        // Count admin users
        const adminUsers = await User.countDocuments({ isAdmin: true });

        res.json({
            success: true,
            statistics: {
                totalUsers,
                totalNews,
                totalVideos,
                totalFixtures,
                totalLiveEvents,
                totalTeams,
                totalPlayers,
                adminUsers,
                todayUsers,
                todayFixtures,
                todayVideos,
                storageUsed: Math.round((totalUsers * 0.5 + totalNews * 0.1 + totalVideos * 2) / 1024), // in MB
                activeSessions: Math.floor(Math.random() * 100) + 50
            }
        });
    } catch (error) {
        console.error('Error fetching admin statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// ========== MISSING SAMPLE VIDEOS FUNCTION ==========
function getSampleVideos() {
    const now = new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return [
        {
            videoId: 'sample1',
            youtubeId: 'dQw4w9WgXcQ',
            title: 'Premier League Highlights: Manchester City vs Liverpool',
            description: 'Watch all the key moments from this thrilling Premier League encounter between two title contenders.',
            thumbnail: 'https://i.pinimg.com/736x/14/31/56/143156d98ce3004bbd0d18ab9d0ee1a1.jpg',
            duration: '8:45',
            category: 'Highlights',
            sport: 'Football',
            league: 'Premier League',
            type: 'highlight',
            status: 'completed',
            featured: true,
            tags: ['football', 'premier league', 'highlights', 'manchester city', 'liverpool'],
            views: 125000,
            publishedAt: lastWeek,
            createdAt: lastWeek,
            isActive: true
        },
       
        {
            videoId: 'sample10',
            youtubeId: 'dQw4w9WgXcQ',
            title: 'Olympics: 100m Final World Record',
            description: 'Witness history as the world record is broken in the most anticipated race of the Olympics.',
            thumbnail: 'https://i.pinimg.com/736x/7a/7b/8d/7a7b8d7a7b8d7a7b8d7a7b8d7a7b8d7a.jpg',
            duration: '3:45',
            category: 'Highlights',
            sport: 'Olympics',
            league: 'Summer Olympics',
            type: 'highlight',
            status: 'completed',
            featured: true,
            tags: ['olympics', '100m', 'world record', 'sprint', 'athletics'],
            views: 350000,
            publishedAt: yesterday,
            createdAt: yesterday,
            isActive: true
        }
    ];
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

// ========== CREATE DEFAULT ADMIN ACCOUNT ==========
async function createDefaultAdmin() {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@allsports.com' });
    
    if (!adminExists) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@allsports.com',
        password: 'admin123', // Change this in production!
        isAdmin: true,
        adminCode: process.env.ADMIN_SECRET_CODE || 'DEFAULT_ADMIN_CODE_123'
      });
      
      await adminUser.save();
      console.log('✅ Default admin account created: admin@allsports.com / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}
// Add this endpoint to check admin status
app.get('/api/admin/check-status/:userId', async (req, res) => {
    try {
        console.log('🔍 Checking admin status for user:', req.params.userId);
        
        const user = await User.findById(req.params.userId).select('isAdmin username email');
        
        if (!user) {
            console.log('❌ User not found for admin check');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log(`✅ User ${user.username} admin status: ${user.isAdmin}`);
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin || false
            }
        });
    } catch (error) {
        console.error('❌ Error checking admin status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking admin status'
        });
    }
});

// Protect admin routes
app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Protect all /api/admin/* routes
app.use('/api/admin/*', (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }
  next();
});

// Run on startup
createDefaultAdmin();

// ========== AUTO-SEED DATABASE ON STARTUP IF EMPTY ==========
async function autoSeedDatabase() {
  try {
    // Check if database is empty
    const videoCount = await Video.countDocuments();
    const newsCount = await News.countDocuments();
    const teamCount = await Team.countDocuments();
    
    if (videoCount > 0 || newsCount > 0 || teamCount > 0) {
      console.log('📊 Database already has data, skipping auto-seed');
      console.log(`   Videos: ${videoCount}, News: ${newsCount}, Teams: ${teamCount}`);
      return;
    }
    
    console.log('🌱 Database is empty, auto-seeding...');
    
    // Import data files with individual error handling
    try {
      const fixturesData = require('./data/fixtures');
      const fixtureResult = await Fixture.insertMany(fixturesData, { ordered: false });
      console.log(`✅ Fixtures: ${fixtureResult.length}`);
    } catch (e) {
      console.error('⚠️  Fixtures error:', e.message);
    }
    
    try {
      const tournamentsData = require('./data/tournaments');
      const tournamentResult = await Tournament.insertMany(tournamentsData, { ordered: false });
      console.log(`✅ Tournaments: ${tournamentResult.length}`);
    } catch (e) {
      console.error('⚠️  Tournaments error:', e.message);
    }
    
    try {
      const videosData = require('./data/videos');
      const videoResult = await Video.insertMany(videosData, { ordered: false });
      console.log(`✅ Videos: ${videoResult.length}`);
    } catch (e) {
      console.error('⚠️  Videos error:', e.message);
    }
    
    try {
      const newsData = require('./data/news');
      const newsResult = await News.insertMany(newsData, { ordered: false });
      console.log(`✅ News: ${newsResult.length}`);
    } catch (e) {
      console.error('⚠️  News error:', e.message);
    }
    
    try {
      const teamsData = require('./data/teams');
      const teamResult = await Team.insertMany(teamsData, { ordered: false });
      console.log(`✅ Teams: ${teamResult.length}`);
    } catch (e) {
      console.error('⚠️  Teams error:', e.message);
    }
    
    try {
      const leagueTablesData = require('./data/leaguetables');
      const leagueTableResult = await LeagueTable.insertMany(leagueTablesData, { ordered: false });
      console.log(`✅ League Tables: ${leagueTableResult.length}`);
    } catch (e) {
      console.error('⚠️  League Tables error:', e.message);
    }
    
    try {
      const playersData = require('./data/players');
      const playerResult = await Player.insertMany(playersData, { ordered: false });
      console.log(`✅ Players: ${playerResult.length}`);
    } catch (e) {
      console.error('⚠️  Players error:', e.message);
    }
    
    try {
      const scoresData = require('./data/scores');
      const scoreResult = await Score.insertMany(scoresData, { ordered: false });
      console.log(`✅ Scores: ${scoreResult.length}`);
    } catch (e) {
      console.error('⚠️  Scores error:', e.message);
    }
    
    try {
      const liveEventsData = require('./data/liveevents');
      const liveEventResult = await LiveEvent.insertMany(liveEventsData, { ordered: false });
      console.log(`✅ Live Events: ${liveEventResult.length}`);
    } catch (e) {
      console.error('⚠️  Live Events error:', e.message);
    }
    
    console.log('🎉 Auto-seed completed!');
    
  } catch (error) {
    console.error('❌ Auto-seed error:', error);
    // Don't crash the app if seeding fails
  }
}

// Run auto-seed after DB connection
mongoose.connection.once('open', async () => {
  console.log('🔗 MongoDB connection established');
  await autoSeedDatabase();
});

// ========== ONE-TIME DATABASE SEED ENDPOINT ==========
app.get('/api/seed-database-now', async (req, res) => {
  try {
    console.log('🌱 Starting database seed...');
    
    // Import seed functions
    const seedModule = require('./seed');
    
    // Note: You'll need to export functions from seed.js
    // For now, we'll use import_all_data.js approach
    
    // Import data files
    const fixturesData = require('./data/fixtures');
    const tournamentsData = require('./data/tournaments');
    const videosData = require('./data/videos');
    const newsData = require('./data/news');
    const teamsData = require('./data/teams');
    const leagueTablesData = require('./data/leaguetables');
    const playersData = require('./data/players');
    const scoresData = require('./data/scores');
    const liveEventsData = require('./data/liveevents');
    
    let results = {};
    
    // Import all data
    const fixtureResult = await Fixture.insertMany(fixturesData, { ordered: false }).catch(e => ({ length: 0 }));
    results.fixtures = fixtureResult.length || 0;
    
    const tournamentResult = await Tournament.insertMany(tournamentsData, { ordered: false }).catch(e => ({ length: 0 }));
    results.tournaments = tournamentResult.length || 0;
    
    const videoResult = await Video.insertMany(videosData, { ordered: false }).catch(e => ({ length: 0 }));
    results.videos = videoResult.length || 0;
    
    const newsResult = await News.insertMany(newsData, { ordered: false }).catch(e => ({ length: 0 }));
    results.news = newsResult.length || 0;
    
    const teamResult = await Team.insertMany(teamsData, { ordered: false }).catch(e => ({ length: 0 }));
    results.teams = teamResult.length || 0;
    
    const leagueTableResult = await LeagueTable.insertMany(leagueTablesData, { ordered: false }).catch(e => ({ length: 0 }));
    results.leagueTables = leagueTableResult.length || 0;
    
    const playerResult = await Player.insertMany(playersData, { ordered: false }).catch(e => ({ length: 0 }));
    results.players = playerResult.length || 0;
    
    const scoreResult = await Score.insertMany(scoresData, { ordered: false }).catch(e => ({ length: 0 }));
    results.scores = scoreResult.length || 0;
    
    const liveEventResult = await LiveEvent.insertMany(liveEventsData, { ordered: false }).catch(e => ({ length: 0 }));
    results.liveEvents = liveEventResult.length || 0;
    
    console.log('✅ Database seeded successfully!', results);
    
    res.json({
      success: true,
      message: 'Database seeded successfully!',
      results: results,
      note: 'You can delete this endpoint after seeding'
    });
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: error.message
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
  console.log(`🔐 Admin access code: ${process.env.ADMIN_ACCESS_CODE || 'ADMIN123'}`);
  console.log(`🔐 Admin secret code: ${process.env.ADMIN_SECRET_CODE || 'DEFAULT_ADMIN_CODE_123'}`);
  console.log(`👑 Default admin: admin@allsports.com / admin123`);
});