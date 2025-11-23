// seed.js - Updated with required fields
require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/News');

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/allsports';

const sampleNews = [
  { 
    sport: 'Cricket', 
    league: 'ICC World Cup',
    title: 'Pakistan chase 300 as star batsman hits a blistering century', 
    excerpt: 'In a dramatic turnaround, Pakistan chased down 300 runs with exceptional batting performance.', 
    content: 'Full match details and analysis of Pakistan\'s incredible chase in the World Cup match.',
    img: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?q=80&w=1400&auto=format&fit=crop', 
    author: 'Hamza A', 
    date: new Date('2025-11-12'),
    teams: { home: 'Pakistan', away: 'India' },
    score: '300/4 - 299/8',
    status: 'Finished',
    venue: 'Melbourne Cricket Ground'
  },
  { 
    sport: 'Football', 
    league: 'Premier League',
    title: 'Late winner seals derby for the Red Hawks', 
    excerpt: 'A dramatic stoppage-time strike secured a memorable victory in the local derby.', 
    content: 'Match report and analysis of the thrilling derby match that went down to the wire.',
    img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop', 
    author: 'Lina', 
    date: new Date('2025-11-12'),
    teams: { home: 'Red Hawks', away: 'Blue Eagles' },
    score: '2-1',
    status: 'Finished',
    venue: 'Red Hawks Stadium'
  },
  { 
    sport: 'Tennis', 
    league: 'Wimbledon',
    title: 'Quarter-final shock: an underdog rises', 
    excerpt: 'A surprising performance from the underdog stunned the crowd and the favorite.', 
    content: 'Complete match analysis and player performance review of the quarter-final upset.',
    img: 'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?q=80&w=1200&auto=format&fit=crop', 
    author: 'Akira', 
    date: new Date('2025-11-12'),
    teams: { home: 'Novak Djokovic', away: 'Underdog Player' },
    score: '6-4, 3-6, 6-2',
    status: 'Finished',
    venue: 'Centre Court'
  },
  // Additional sports events
  { 
    sport: 'Basketball', 
    league: 'NBA',
    title: 'Lakers vs Warriors: Classic rivalry continues', 
    excerpt: 'Another chapter in the historic Lakers-Warriors rivalry with standout performances.', 
    content: 'Game analysis and player highlights from the latest Lakers vs Warriors matchup.',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop', 
    author: 'Mike T', 
    date: new Date('2025-11-11'),
    teams: { home: 'Los Angeles Lakers', away: 'Golden State Warriors' },
    score: '112-108',
    status: 'Finished',
    venue: 'Staples Center'
  },
  { 
    sport: 'American Football', 
    league: 'NFL',
    title: 'Chiefs dominate in Sunday night showdown', 
    excerpt: 'Kansas City Chiefs put on a commanding performance in prime time.', 
    content: 'Complete game breakdown and analysis of the Chiefs victory.',
    img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop', 
    author: 'Sarah J', 
    date: new Date('2025-11-10'),
    teams: { home: 'Kansas City Chiefs', away: 'Las Vegas Raiders' },
    score: '31-17',
    status: 'Finished',
    venue: 'Arrowhead Stadium'
  },
  { 
    sport: 'Baseball', 
    league: 'MLB',
    title: 'Yankees clinch playoff spot with walk-off win', 
    excerpt: 'Dramatic walk-off home run secures postseason berth for the Yankees.', 
    content: 'Game recap and analysis of the Yankees dramatic victory.',
    img: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1200&auto=format&fit=crop', 
    author: 'David R', 
    date: new Date('2025-11-09'),
    teams: { home: 'New York Yankees', away: 'Boston Red Sox' },
    score: '5-4',
    status: 'Finished',
    venue: 'Yankee Stadium'
  },
  { 
    sport: 'Hockey', 
    league: 'NHL',
    title: 'Avalanche continue winning streak', 
    excerpt: 'Colorado Avalanche extend their streak with another impressive victory.', 
    content: 'Game analysis and team performance review.',
    img: 'https://images.unsplash.com/photo-1550675894-95b70ec8d936?q=80&w=1200&auto=format&fit=crop', 
    author: 'Chris M', 
    date: new Date('2025-11-08'),
    teams: { home: 'Colorado Avalanche', away: 'Tampa Bay Lightning' },
    score: '4-2',
    status: 'Finished',
    venue: 'Ball Arena'
  },
  { 
    sport: 'Football', 
    league: 'Champions League',
    title: 'Real Madrid advances to semi-finals', 
    excerpt: 'Real Madrid secures semi-final spot with commanding performance.', 
    content: 'Match analysis and player ratings from the Champions League quarter-final.',
    img: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1200&auto=format&fit=crop', 
    author: 'Carlos G', 
    date: new Date('2025-11-07'),
    teams: { home: 'Real Madrid', away: 'Bayern Munich' },
    score: '3-1',
    status: 'Finished',
    venue: 'Santiago Bernabéu'
  },
  { 
    sport: 'Cricket', 
    league: 'T20 World Cup',
    title: 'England sets new T20 record score', 
    excerpt: 'England cricket team posts highest ever T20 international score.', 
    content: 'Innings breakdown and player performance analysis.',
    img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop', 
    author: 'Emma W', 
    date: new Date('2025-11-06'),
    teams: { home: 'England', away: 'South Africa' },
    score: '258/5 - 200/9',
    status: 'Finished',
    venue: 'Lord\'s Cricket Ground'
  },
  { 
    sport: 'Tennis', 
    league: 'US Open',
    title: 'New champion crowned at Flushing Meadows', 
    excerpt: 'Rising star claims first Grand Slam title in dramatic final.', 
    content: 'Match analysis and tournament recap from the US Open.',
    img: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1200&auto=format&fit=crop', 
    author: 'Maria K', 
    date: new Date('2025-11-05'),
    teams: { home: 'Carlos Alcaraz', away: 'Novak Djokovic' },
    score: '6-4, 5-7, 6-4, 6-3',
    status: 'Finished',
    venue: 'Arthur Ashe Stadium'
  }
];

async function seed(){
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB. Clearing old news...');
  await News.deleteMany({});
  console.log('Inserting sample news...');
  const inserted = await News.insertMany(sampleNews);
  console.log('Inserted', inserted.length, 'items.');
  mongoose.disconnect();
}

seed().catch(err => { 
  console.error(err); 
  mongoose.disconnect(); 
  process.exit(1); 
});