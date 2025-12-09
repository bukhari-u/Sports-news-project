const fixturesData = [
  // Today's fixtures - using current date
  {
    fixtureId: 'FIX-401',
    sport: 'Football',
    league: 'Champions League',
    homeTeam: { name: 'Bayern Munich', shortCode: 'BAY' },
    awayTeam: { name: 'Paris SG', shortCode: 'PSG' },
    date: new Date(), // This will be today's date
    time: '19:45',
    venue: 'Allianz Arena',
    status: 'Scheduled',
    round: 'Group Stage',
    competition: 'UEFA Champions League',
    isFeatured: true,
    isActive: true
  },
  {
    fixtureId: 'FIX-402',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: { name: 'Golden State Warriors', shortCode: 'GSW' },
    awayTeam: { name: 'Phoenix Suns', shortCode: 'PHX' },
    date: new Date(), // Today
    time: '02:30',
    venue: 'Chase Center',
    status: 'Scheduled',
    round: 'Regular Season',
    competition: 'National Basketball Association',
    isActive: true
  },
  {
    fixtureId: 'FIX-403',
    sport: 'Cricket',
    league: 'T20 World Cup',
    homeTeam: { name: 'England', shortCode: 'ENG' },
    awayTeam: { name: 'Pakistan', shortCode: 'PAK' },
    date: new Date(), // Today
    time: '08:00',
    venue: 'Dubai International Stadium',
    status: 'Scheduled',
    round: 'Semi Final',
    competition: 'ICC T20 World Cup',
    isActive: true
  },
  {
    fixtureId: 'FIX-404',
    sport: 'Tennis',
    league: 'Australian Open',
    homeTeam: { name: 'Rafael Nadal', shortCode: 'RNA' },
    awayTeam: { name: 'Daniil Medvedev', shortCode: 'DME' },
    date: new Date(), // Today
    time: '14:00',
    venue: 'Rod Laver Arena',
    status: 'Scheduled',
    round: 'Quarter Final',
    competition: 'Australian Open',
    isActive: true
  },
  {
    fixtureId: 'FIX-405',
    sport: 'MMA',
    league: 'UFC',
    homeTeam: { name: 'Israel Adesanya', shortCode: 'IAD' },
    awayTeam: { name: 'Alex Pereira', shortCode: 'APE' },
    date: new Date(), // Today
    time: '23:00',
    venue: 'T-Mobile Arena',
    status: 'Scheduled',
    round: 'Main Event',
    competition: 'UFC 287',
    isActive: true
  },
  {
    fixtureId: 'FIX-406',
    sport: 'Football',
    league: 'Premier League',
    homeTeam: { name: 'Chelsea', shortCode: 'CHE' },
    awayTeam: { name: 'Arsenal', shortCode: 'ARS' },
    date: new Date(), // Today
    time: '20:00',
    venue: 'Stamford Bridge',
    status: 'Scheduled',
    round: 'Matchweek 15',
    competition: 'English Premier League',
    isActive: true
  },
  {
    fixtureId: 'FIX-407',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: { name: 'NY Yankees', shortCode: 'NYY' },
    awayTeam: { name: 'Boston Red Sox', shortCode: 'BOS' },
    date: new Date(), // Today
    time: '01:05',
    venue: 'Yankee Stadium',
    status: 'Scheduled',
    round: 'Regular Season',
    competition: 'Major League Baseball',
    isActive: true
  },
  {
    fixtureId: 'FIX-408',
    sport: 'Hockey',
    league: 'NHL',
    homeTeam: { name: 'Toronto Maple Leafs', shortCode: 'TOR' },
    awayTeam: { name: 'Montreal Canadiens', shortCode: 'MTL' },
    date: new Date(), // Today
    time: '00:00',
    venue: 'Scotiabank Arena',
    status: 'Scheduled',
    round: 'Regular Season',
    competition: 'National Hockey League',
    isActive: true
  },
  // Upcoming fixtures - next few days
  {
    fixtureId: 'FIX-409',
    sport: 'Football',
    league: 'Premier League',
    homeTeam: { name: 'Manchester United', shortCode: 'MUN' },
    awayTeam: { name: 'Liverpool', shortCode: 'LIV' },
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: '15:00',
    venue: 'Old Trafford',
    status: 'Scheduled',
    round: 'Matchweek 16',
    competition: 'English Premier League',
    isFeatured: true,
    isActive: true
  },
  {
    fixtureId: 'FIX-410',
    sport: 'Cricket',
    league: 'IPL',
    homeTeam: { name: 'Mumbai Indians', shortCode: 'MI' },
    awayTeam: { name: 'Chennai Super Kings', shortCode: 'CSK' },
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: '19:30',
    venue: 'Wankhede Stadium',
    status: 'Scheduled',
    round: 'Group Stage',
    competition: 'Indian Premier League',
    isActive: true
  },
  {
    fixtureId: 'FIX-411',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: { name: 'LA Lakers', shortCode: 'LAL' },
    awayTeam: { name: 'Boston Celtics', shortCode: 'BOS' },
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    time: '23:00',
    venue: 'Staples Center',
    status: 'upcoming',
    round: 'Regular Season',
    competition: 'National Basketball Association',
    isActive: true
  },
  {
    fixtureId: 'FIX-412',
    sport: 'Tennis',
    league: 'Wimbledon',
    homeTeam: { name: 'Novak Djokovic', shortCode: 'NDJ' },
    awayTeam: { name: 'Roger Federer', shortCode: 'RFE' },
    date: new Date(Date.now() + 259200000), // 3 days from now
    time: '13:00',
    venue: 'Centre Court',
    status: 'upcoming',
    round: 'Final',
    competition: 'Wimbledon Championships',
    isActive: true
  },
  {
    fixtureId: 'FIX-413',
    sport: 'Rugby',
    league: 'Six Nations',
    homeTeam: { name: 'England', shortCode: 'ENG' },
    awayTeam: { name: 'Wales', shortCode: 'WAL' },
    date: new Date(Date.now() + 345600000), // 4 days from now
    time: '14:30',
    venue: 'Twickenham Stadium',
    status: 'upcoming',
    round: 'Round 3',
    competition: 'Six Nations Championship',
    isActive: true
  },
  {
    fixtureId: 'FIX-414',
    sport: 'Golf',
    league: 'Masters Tournament',
    homeTeam: { name: 'Tiger Woods', shortCode: 'TWO' },
    awayTeam: { name: 'Rory McIlroy', shortCode: 'RMC' },
    date: new Date(Date.now() + 432000000), // 5 days from now
    time: '08:00',
    venue: 'Augusta National',
    status: 'upcoming',
    round: 'Final Round',
    competition: 'Masters Tournament',
    isActive: true
  },
  {
    fixtureId: 'FIX-415',
    sport: 'Boxing',
    league: 'WBC Heavyweight',
    homeTeam: { name: 'Tyson Fury', shortCode: 'TFU' },
    awayTeam: { name: 'Anthony Joshua', shortCode: 'AJ' },
    date: new Date(Date.now() + 518400000), // 6 days from now
    time: '22:00',
    venue: 'Wembley Stadium',
    status: 'upcoming',
    round: 'Main Event',
    competition: 'WBC Heavyweight Title',
    isActive: true
  },
  {
    fixtureId: 'FIX-416',
    sport: 'Formula1',
    league: 'Monaco Grand Prix',
    homeTeam: { name: 'Lewis Hamilton', shortCode: 'LHA' },
    awayTeam: { name: 'Max Verstappen', shortCode: 'MVE' },
    date: new Date(Date.now() + 604800000), // 7 days from now
    time: '14:00',
    venue: 'Circuit de Monaco',
    status: 'upcoming',
    round: 'Race',
    competition: 'Formula 1 World Championship',
    isActive: true
  },
  // Additional current fixtures
  {
    fixtureId: 'PL-2024-001',
    sport: 'Football',
    league: 'Premier League',
    homeTeam: { name: 'Manchester City', shortCode: 'MCI' },
    awayTeam: { name: 'Arsenal', shortCode: 'ARS' },
    date: new Date(), // Today
    time: "17:30",
    venue: "Etihad Stadium",
    status: "upcoming",
    isFeatured: true,
    isActive: true
  },
  {
    fixtureId: 'UCL-2024-001',
    sport: 'Football',
    league: 'Champions League',
    homeTeam: { name: 'Real Madrid', shortCode: 'RMA' },
    awayTeam: { name: 'Bayern Munich', shortCode: 'BAY' },
    date: new Date(), // Today
    time: "20:00",
    venue: "Santiago Bernabéu",
    status: "upcoming",
    isFeatured: true,
    isActive: true
  },
  {
    fixtureId: 'NBA-2024-001',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: { name: 'Boston Celtics', shortCode: 'BOS' },
    awayTeam: { name: 'Los Angeles Lakers', shortCode: 'LAL' },
    date: new Date(), // Today
    time: "20:00",
    venue: "TD Garden",
    status: "upcoming",
    isFeatured: true,
    isActive: true
  },
  {
    fixtureId: 'NBA-2024-002',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: { name: 'Golden State Warriors', shortCode: 'GSW' },
    awayTeam: { name: 'Boston Celtics', shortCode: 'BOS' },
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: "22:30",
    venue: "Chase Center",
    status: "upcoming",
    isFeatured: false,
    isActive: true
  },
  {
    fixtureId: 'MLB-2024-001',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: { name: 'New York Yankees', shortCode: 'NYY' },
    awayTeam: { name: 'Boston Red Sox', shortCode: 'BOS' },
    date: new Date(), // Today
    time: "19:05",
    venue: "Yankee Stadium",
    status: "upcoming",
    isFeatured: true,
    isActive: true
  },
  {
    fixtureId: 'MLB-2024-002',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: { name: 'Los Angeles Dodgers', shortCode: 'LAD' },
    awayTeam: { name: 'San Francisco Giants', shortCode: 'SF' },
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: "21:10",
    venue: "Dodger Stadium",
    status: "upcoming",
    isFeatured: false,
    isActive: true
  }
];

module.exports = fixturesData;