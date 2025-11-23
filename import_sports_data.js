// import_sports_data.js - Enhanced with more matches for all statuses
require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/News');

const MONGO = process.env.MONGODB_URI;
let importedCount = 0;

async function connectDB() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
}

async function clearExistingData() {
  await News.deleteMany({});
  console.log('Cleared existing news data');
}

// Generate realistic mock data with balanced status distribution
function generateMockSportsData() {
  const sportsData = [];
  const currentDate = new Date();

  // Football matches - Increased to 60 matches
  const footballLeagues = [
    { name: 'English Premier League', country: 'England' },
    { name: 'La Liga', country: 'Spain' },
    { name: 'Serie A', country: 'Italy' },
    { name: 'Bundesliga', country: 'Germany' },
    { name: 'Ligue 1', country: 'France' },
    { name: 'Champions League', country: 'Europe' },
    { name: 'Europa League', country: 'Europe' },
    { name: 'FA Cup', country: 'England' }
  ];

  const footballTeams = [
    'Manchester United', 'Liverpool', 'Arsenal', 'Chelsea', 'Manchester City',
    'Tottenham', 'Newcastle', 'Brighton', 'West Ham', 'Crystal Palace',
    'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia',
    'Juventus', 'AC Milan', 'Inter Milan', 'Napoli', 'Roma', 'Lazio',
    'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen',
    'PSG', 'Lyon', 'Marseille', 'Monaco', 'Lille'
  ];

  // Generate 60 football matches with balanced status distribution
  for (let i = 0; i < 60; i++) {
    const homeTeam = footballTeams[Math.floor(Math.random() * footballTeams.length)];
    let awayTeam = footballTeams[Math.floor(Math.random() * footballTeams.length)];
    while (awayTeam === homeTeam) {
      awayTeam = footballTeams[Math.floor(Math.random() * footballTeams.length)];
    }

    const league = footballLeagues[Math.floor(Math.random() * footballLeagues.length)];
    const matchDate = new Date(currentDate);
    
    // Distribute dates: some in past (finished), some today (live), some future (upcoming)
    const dateOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    matchDate.setDate(matchDate.getDate() + dateOffset);
    
    // Balanced status distribution: 40% Finished, 30% Live, 30% Upcoming
    let status;
    const statusRand = Math.random();
    if (statusRand < 0.4) {
      status = 'Finished';
    } else if (statusRand < 0.7) {
      status = 'Live';
    } else {
      status = 'Upcoming';
    }
    
    let score = null;
    if (status === 'Finished') {
      score = `${Math.floor(Math.random() * 5)}-${Math.floor(Math.random() * 5)}`;
    } else if (status === 'Live') {
      score = `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}`;
    }

    sportsData.push({
      sport: 'Football',
      league: league.name,
      title: `${homeTeam} vs ${awayTeam} - ${league.name}`,
      excerpt: `Exciting ${league.name} clash between ${homeTeam} and ${awayTeam}. ${status === 'Finished' ? 'Match completed with thrilling action.' : status === 'Live' ? 'Live action happening now!' : 'Upcoming match preview.'}`,
      content: `Match details: ${homeTeam} takes on ${awayTeam} in ${league.name}. ${status === 'Finished' ? `The match ended ${score} after 90 minutes of intense football.` : status === 'Live' ? `Currently ${score} with both teams pushing for victory.` : 'Scheduled match with both teams preparing for this important fixture.'} Key players to watch and tactical analysis available.`,
      img: `https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=600&auto=format&fit=crop&${Math.random()}`,
      author: `${league.name} Official`,
      date: matchDate,
      teams: { home: homeTeam, away: awayTeam },
      score: score,
      status: status,
      venue: `${homeTeam} Stadium`
    });
  }

  // Cricket matches - Increased to 40 matches
  const cricketTeams = [
    'India', 'Australia', 'England', 'Pakistan', 'New Zealand',
    'South Africa', 'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan',
    'Ireland', 'Zimbabwe', 'Netherlands', 'Scotland'
  ];

  const cricketTournaments = [
    'ICC World Cup', 'T20 World Cup', 'Test Championship', 'Asia Cup', 
    'Border-Gavaskar Trophy', 'Ashes Series', 'World Test Championship',
    'ICC Champions Trophy', 'Commonwealth Bank Series'
  ];

  for (let i = 0; i < 40; i++) {
    const team1 = cricketTeams[Math.floor(Math.random() * cricketTeams.length)];
    let team2 = cricketTeams[Math.floor(Math.random() * cricketTeams.length)];
    while (team2 === team1) {
      team2 = cricketTeams[Math.floor(Math.random() * cricketTeams.length)];
    }

    const tournament = cricketTournaments[Math.floor(Math.random() * cricketTournaments.length)];
    const matchDate = new Date(currentDate);
    const dateOffset = Math.floor(Math.random() * 60) - 30;
    matchDate.setDate(matchDate.getDate() + dateOffset);

    // Balanced status distribution
    let status;
    const statusRand = Math.random();
    if (statusRand < 0.4) {
      status = 'Finished';
    } else if (statusRand < 0.7) {
      status = 'Live';
    } else {
      status = 'Upcoming';
    }
    
    let score = null;
    if (status === 'Finished') {
      const runs1 = Math.floor(Math.random() * 350) + 150;
      const wickets1 = Math.floor(Math.random() * 10);
      const runs2 = Math.floor(Math.random() * 350) + 150;
      const wickets2 = Math.floor(Math.random() * 10);
      score = `${runs1}/${wickets1} - ${runs2}/${wickets2}`;
    } else if (status === 'Live') {
      const runs = Math.floor(Math.random() * 200) + 50;
      const wickets = Math.floor(Math.random() * 9);
      const overs = (Math.floor(Math.random() * 40) + 10).toFixed(1);
      score = `${runs}/${wickets} (${overs} ov)`;
    }

    sportsData.push({
      sport: 'Cricket',
      league: tournament,
      title: `${team1} vs ${team2} - ${tournament}`,
      excerpt: `${tournament} match between ${team1} and ${team2}. ${status === 'Finished' ? 'Match completed with impressive performances.' : status === 'Live' ? 'Live cricket action!' : 'Upcoming cricket match.'}`,
      content: `Cricket match: ${team1} vs ${team2} in ${tournament}. ${status === 'Finished' ? `Final score: ${score}. Excellent display of cricket from both teams.` : status === 'Live' ? `Current score: ${score}. Exciting match in progress.` : 'Teams preparing for this important cricket fixture.'} Player performances and match analysis.`,
      img: `https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&${Math.random()}`,
      author: 'ICC Official',
      date: matchDate,
      teams: { home: team1, away: team2 },
      score: score,
      status: status,
      venue: `${team1} Cricket Ground`
    });
  }

  // Basketball matches (NBA) - Increased to 35 matches
  const nbaTeams = [
    'Los Angeles Lakers', 'Golden State Warriors', 'Boston Celtics', 'Chicago Bulls',
    'Miami Heat', 'Toronto Raptors', 'Philadelphia 76ers', 'Denver Nuggets',
    'Milwaukee Bucks', 'Phoenix Suns', 'Dallas Mavericks', 'Brooklyn Nets',
    'LA Clippers', 'Memphis Grizzlies', 'Atlanta Hawks', 'Sacramento Kings'
  ];

  for (let i = 0; i < 35; i++) {
    const homeTeam = nbaTeams[Math.floor(Math.random() * nbaTeams.length)];
    let awayTeam = nbaTeams[Math.floor(Math.random() * nbaTeams.length)];
    while (awayTeam === homeTeam) {
      awayTeam = nbaTeams[Math.floor(Math.random() * nbaTeams.length)];
    }

    const matchDate = new Date(currentDate);
    const dateOffset = Math.floor(Math.random() * 60) - 30;
    matchDate.setDate(matchDate.getDate() + dateOffset);

    // Balanced status distribution
    let status;
    const statusRand = Math.random();
    if (statusRand < 0.4) {
      status = 'Finished';
    } else if (statusRand < 0.7) {
      status = 'Live';
    } else {
      status = 'Upcoming';
    }
    
    let score = null;
    if (status === 'Finished') {
      const homeScore = Math.floor(Math.random() * 50) + 80;
      const awayScore = Math.floor(Math.random() * 50) + 80;
      score = `${homeScore}-${awayScore}`;
    } else if (status === 'Live') {
      const homeScore = Math.floor(Math.random() * 40) + 60;
      const awayScore = Math.floor(Math.random() * 40) + 60;
      const quarter = Math.floor(Math.random() * 4) + 1;
      score = `${homeScore}-${awayScore} (Q${quarter})`;
    }

    sportsData.push({
      sport: 'Basketball',
      league: 'NBA',
      title: `${homeTeam} vs ${awayTeam} - NBA`,
      excerpt: `NBA matchup: ${homeTeam} hosts ${awayTeam}. ${status === 'Finished' ? 'Game completed with exciting plays.' : status === 'Live' ? 'Live NBA action!' : 'Upcoming NBA game.'}`,
      content: `NBA Regular Season: ${homeTeam} vs ${awayTeam}. ${status === 'Finished' ? `Final score: ${score}. Great basketball action with impressive performances.` : status === 'Live' ? `Current score: ${score}. Intense game in progress.` : 'Teams preparing for this NBA matchup.'} Star players and key matchups.`,
      img: `https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&${Math.random()}`,
      author: 'NBA Official',
      date: matchDate,
      teams: { home: homeTeam, away: awayTeam },
      score: score,
      status: status,
      venue: `${homeTeam} Arena`
    });
  }

  // Tennis matches - Increased to 30 matches
  const tennisPlayers = [
    'Novak Djokovic', 'Rafael Nadal', 'Carlos Alcaraz', 'Daniil Medvedev',
    'Iga Swiatek', 'Aryna Sabalenka', 'Coco Gauff', 'Elena Rybakina',
    'Jannik Sinner', 'Stefanos Tsitsipas', 'Alexander Zverev', 'Holger Rune',
    'Taylor Fritz', 'Frances Tiafoe', 'Jessica Pegula', 'Ons Jabeur'
  ];

  const tennisTournaments = [
    'Australian Open', 'French Open', 'Wimbledon', 'US Open',
    'ATP Finals', 'Indian Wells Masters', 'Miami Open', 'Monte Carlo Masters',
    'Madrid Open', 'Italian Open', 'Canadian Open', 'Cincinnati Open'
  ];

  for (let i = 0; i < 30; i++) {
    const player1 = tennisPlayers[Math.floor(Math.random() * tennisPlayers.length)];
    let player2 = tennisPlayers[Math.floor(Math.random() * tennisPlayers.length)];
    while (player2 === player1) {
      player2 = tennisPlayers[Math.floor(Math.random() * tennisPlayers.length)];
    }

    const tournament = tennisTournaments[Math.floor(Math.random() * tennisTournaments.length)];
    const matchDate = new Date(currentDate);
    const dateOffset = Math.floor(Math.random() * 60) - 30;
    matchDate.setDate(matchDate.getDate() + dateOffset);

    // Balanced status distribution
    let status;
    const statusRand = Math.random();
    if (statusRand < 0.4) {
      status = 'Finished';
    } else if (statusRand < 0.7) {
      status = 'Live';
    } else {
      status = 'Upcoming';
    }
    
    let score = null;
    if (status === 'Finished') {
      const sets = [];
      const numSets = Math.random() > 0.5 ? 3 : 5;
      for (let s = 0; s < numSets; s++) {
        const set1 = Math.floor(Math.random() * 7);
        const set2 = Math.floor(Math.random() * 7);
        // Ensure one player wins the set
        if (set1 > set2 || (set1 === 6 && set2 === 6 && Math.random() > 0.5)) {
          sets.push(`${set1}-${set2}`);
        } else {
          sets.push(`${set2}-${set1}`);
        }
      }
      score = sets.join(', ');
    }

    sportsData.push({
      sport: 'Tennis',
      league: tournament,
      title: `${player1} vs ${player2} - ${tournament}`,
      excerpt: `${tournament} match: ${player1} faces ${player2}. ${status === 'Finished' ? 'Match completed with great tennis.' : status === 'Live' ? 'Live tennis action!' : 'Upcoming tennis match.'}`,
      content: `Tennis ${tournament}: ${player1} vs ${player2}. ${status === 'Finished' ? `Final score: ${score}. Excellent display of tennis skills.` : status === 'Live' ? `Current sets: ${score}. Exciting match in progress.` : 'Players preparing for this important match.'} Match analysis and player stats.`,
      img: `https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&auto=format&fit=crop&${Math.random()}`,
      author: 'ATP/WTA Official',
      date: matchDate,
      teams: { home: player1, away: player2 },
      score: score,
      status: status,
      venue: `${tournament} Court`
    });
  }

  // Additional sports - Increased to 20 each
  const additionalSports = [
    {
      sport: 'American Football',
      league: 'NFL',
      teams: ['Kansas City Chiefs', 'Philadelphia Eagles', 'San Francisco 49ers', 'Buffalo Bills', 'Dallas Cowboys', 'Miami Dolphins', 'Baltimore Ravens', 'Detroit Lions'],
      imageBase: 'photo-1531415074968-036ba1b575da'
    },
    {
      sport: 'Baseball',
      league: 'MLB', 
      teams: ['New York Yankees', 'Los Angeles Dodgers', 'Boston Red Sox', 'Chicago Cubs', 'Houston Astros', 'Atlanta Braves', 'St. Louis Cardinals', 'Toronto Blue Jays'],
      imageBase: 'photo-1547949003-9792a18a2601'
    },
    {
      sport: 'Hockey',
      league: 'NHL',
      teams: ['Colorado Avalanche', 'Tampa Bay Lightning', 'Toronto Maple Leafs', 'Boston Bruins', 'Edmonton Oilers', 'New York Rangers', 'Vegas Golden Knights', 'Carolina Hurricanes'],
      imageBase: 'photo-1550675894-95b70ec8d936'
    },
    {
      sport: 'Rugby',
      league: 'Premiership Rugby',
      teams: ['Saracens', 'Leicester Tigers', 'Northampton Saints', 'Harlequins', 'Exeter Chiefs', 'Sale Sharks', 'Bristol Bears', 'Bath Rugby'],
      imageBase: 'photo-1612874740001-3c21e5578236'
    },
    {
      sport: 'Golf',
      league: 'PGA Tour',
      teams: [], // Individual sport
      imageBase: 'photo-1535131749006-b7f993534a4c'
    }
  ];

  additionalSports.forEach(sportConfig => {
    const matchCount = sportConfig.sport === 'Golf' ? 15 : 20;
    
    for (let i = 0; i < matchCount; i++) {
      let homeTeam, awayTeam;
      
      if (sportConfig.sport === 'Golf') {
        // Golf tournaments are individual
        const golfers = ['Rory McIlroy', 'Scottie Scheffler', 'Jon Rahm', 'Viktor Hovland', 'Xander Schauffele', 'Patrick Cantlay', 'Matt Fitzpatrick', 'Jordan Spieth'];
        homeTeam = golfers[Math.floor(Math.random() * golfers.length)];
        let tempAway = golfers[Math.floor(Math.random() * golfers.length)];
        while (tempAway === homeTeam) {
          tempAway = golfers[Math.floor(Math.random() * golfers.length)];
        }
        awayTeam = tempAway;
      } else {
        homeTeam = sportConfig.teams[Math.floor(Math.random() * sportConfig.teams.length)];
        awayTeam = sportConfig.teams[Math.floor(Math.random() * sportConfig.teams.length)];
        while (awayTeam === homeTeam) {
          awayTeam = sportConfig.teams[Math.floor(Math.random() * sportConfig.teams.length)];
        }
      }

      const matchDate = new Date(currentDate);
      const dateOffset = Math.floor(Math.random() * 60) - 30;
      matchDate.setDate(matchDate.getDate() + dateOffset);

      // Balanced status distribution
      let status;
      const statusRand = Math.random();
      if (statusRand < 0.4) {
        status = 'Finished';
      } else if (statusRand < 0.7) {
        status = 'Live';
      } else {
        status = 'Upcoming';
      }
      
      let score = null;
      if (status === 'Finished') {
        if (sportConfig.sport === 'American Football') {
          score = `${Math.floor(Math.random() * 50)}-${Math.floor(Math.random() * 50)}`;
        } else if (sportConfig.sport === 'Baseball') {
          score = `${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 10)}`;
        } else if (sportConfig.sport === 'Hockey') {
          score = `${Math.floor(Math.random() * 6)}-${Math.floor(Math.random() * 6)}`;
        } else if (sportConfig.sport === 'Rugby') {
          score = `${Math.floor(Math.random() * 50)}-${Math.floor(Math.random() * 50)}`;
        } else if (sportConfig.sport === 'Golf') {
          const score1 = Math.floor(Math.random() * 10) - 5; // -5 to +5
          const score2 = Math.floor(Math.random() * 10) - 5;
          score = `${score1 > 0 ? '+' : ''}${score1} / ${score2 > 0 ? '+' : ''}${score2}`;
        }
      }

      const title = sportConfig.sport === 'Golf' 
        ? `${homeTeam} vs ${awayTeam} - ${sportConfig.league} Tournament`
        : `${homeTeam} vs ${awayTeam} - ${sportConfig.league}`;

      sportsData.push({
        sport: sportConfig.sport,
        league: sportConfig.league,
        title: title,
        excerpt: `${sportConfig.league} ${sportConfig.sport === 'Golf' ? 'tournament' : 'matchup'}: ${homeTeam} vs ${awayTeam}. ${status === 'Finished' ? 'Completed.' : status === 'Live' ? 'Live action!' : 'Upcoming.'}`,
        content: `${sportConfig.sport} ${sportConfig.league}: ${homeTeam} vs ${awayTeam}. ${status === 'Finished' ? `Final score: ${score}.` : status === 'Live' ? `Current score: ${score}.` : 'Preview and analysis.'}`,
        img: `https://images.unsplash.com/${sportConfig.imageBase}?w=600&auto=format&fit=crop&${Math.random()}`,
        author: `${sportConfig.league} Official`,
        date: matchDate,
        teams: { home: homeTeam, away: awayTeam },
        score: score,
        status: status,
        venue: sportConfig.sport === 'Golf' ? `${sportConfig.league} Course` : `${homeTeam} Stadium`
      });
    }
  });

  return sportsData;
}

async function importMockData() {
  console.log('Generating enhanced sports data with balanced status distribution...');
  const mockData = generateMockSportsData();
  
  console.log(`Generated ${mockData.length} sports events`);
  
  // Count status distribution for verification
  const statusCount = mockData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Status distribution:', statusCount);
  
  for (const item of mockData) {
    try {
      await News.create(item);
      importedCount++;
    } catch (error) {
      console.error('Error inserting item:', error.message);
    }
  }
  
  console.log(`Successfully imported ${importedCount} sports events`);
}

async function run() {
  try {
    await connectDB();
    await clearExistingData();
    await importMockData();
    
    console.log('\n✅ Import completed successfully!');
    console.log(`📊 Total events imported: ${importedCount}`);
    console.log('🎯 Balanced status distribution achieved');
    console.log('🚀 Start your server with: npm start');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

run();